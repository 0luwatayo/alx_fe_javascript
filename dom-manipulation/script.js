const LOCAL_STORAGE_KEY = 'dqg_quotes_v2';
const LOCAL_FILTER_KEY = 'dqg_last_filter';
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Your limitation—it's only your imagination.", category: "Inspiration" },
  { text: "Push yourself, because no one else is going to do it for you.", category: "Discipline" },
  { text: "Dream it. Wish it. Do it.", category: "Action" }
];

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const formArea = document.getElementById('formArea');
const categoryFilter = document.getElementById('categoryFilter');
const exportBtn = document.getElementById('exportBtn');
const importFileInput = document.getElementById('importFile');

// Save quotes
function saveQuotes() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
}

// Load quotes
function loadQuotes() {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) quotes = JSON.parse(stored);
}

// Escape HTML to prevent injection
function escapeHtml(str) {
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Show random quote
function showRandomQuote() {
  const filteredCategory = categoryFilter.value;
  let filteredQuotes = quotes;

  if (filteredCategory !== 'all') {
    filteredQuotes = quotes.filter(q => q.category === filteredCategory);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = 'No quotes found for this category.';
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const q = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `<strong>${escapeHtml(q.category)}:</strong> "${escapeHtml(q.text)}"`;
}

// Create add quote form
function createAddQuoteForm() {
  const container = document.createElement('div');

  const textInput = document.createElement('input');
  textInput.id = 'newQuoteText';
  textInput.type = 'text';
  textInput.placeholder = 'Enter a new quote';

  const catInput = document.createElement('input');
  catInput.id = 'newQuoteCategory';
  catInput.type = 'text';
  catInput.placeholder = 'Enter quote category';

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add Quote';
  addBtn.addEventListener('click', addQuote);

  container.appendChild(textInput);
  container.appendChild(catInput);
  container.appendChild(addBtn);

  formArea.appendChild(container);
}

// Add new quote
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !category) {
    alert('Please fill in both fields.');
    return;
  }

  quotes.push({ text, category });
  saveQuotes();

  // Clear fields
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';

  // Refresh categories if new one added
  populateCategories();

  quoteDisplay.innerHTML = `✅ Added new quote in <strong>${escapeHtml(category)}</strong>: "${escapeHtml(text)}"`;
}

// Populate unique categories
function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  uniqueCategories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  // Restore last selected filter
  const savedFilter = localStorage.getItem(LOCAL_FILTER_KEY);
  if (savedFilter && [...categoryFilter.options].some(o => o.value === savedFilter)) {
    categoryFilter.value = savedFilter;
  }
}

// Filter quotes
function filterQuotes() {
    const selectedCategory = categoryFilter.value; // ✅ variable name updated
    localStorage.setItem(LOCAL_FILTER_KEY, selectedCategory);
  
    let filteredQuotes = quotes;
  
    if (selectedCategory !== 'all') {
      filteredQuotes = quotes.filter(q => q.category === selectedCategory);
    }
  
    if (filteredQuotes.length === 0) {
      quoteDisplay.textContent = 'No quotes found for this category.';
    } else {
      // Show one random quote from the filtered list
      const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
      quoteDisplay.innerHTML = `<strong>${selectedCategory}</strong>: "${randomQuote.text}"`;
    }
  }
  

// Export quotes to JSON
function exportToJsonFile() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Import from JSON
function importFromJsonFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        alert('Quotes imported successfully!');
      }
    } catch {
      alert('Invalid JSON file.');
    }
  };
  reader.readAsText(file);
}

// Initialization
function init() {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();

  newQuoteButton.addEventListener('click', showRandomQuote);
  exportBtn.addEventListener('click', exportToJsonFile);
  importFileInput.addEventListener('change', e => {
    importFromJsonFile(e.target.files[0]);
    e.target.value = ''; // Reset input
  });

  // Auto-apply saved filter
  const savedFilter = localStorage.getItem(LOCAL_FILTER_KEY);
  if (savedFilter && savedFilter !== 'all') {
    categoryFilter.value = savedFilter;
    filterQuotes();
  }
}

document.addEventListener('DOMContentLoaded', init);

const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // placeholder server

// Fetch quotes from "server"
async function fetchQuotesFromServer() {
    try {
      const response = await fetch(SERVER_URL);
      const data = await response.json();
  
      // Simulate quote objects with text & category
      const serverQuotes = data.slice(0, 5).map(item => ({
        text: item.title,
        category: 'server'
      }));
  
      return serverQuotes;
    } catch (error) {
      console.error('Error fetching from server:', error);
      return [];
    }
  }

  function mergeQuotes(localQuotes, serverQuotes) {
    const merged = [...localQuotes];
  
    serverQuotes.forEach(serverQuote => {
      const existing = merged.find(q => q.text === serverQuote.text);
      if (existing) {
        // Conflict detected — server takes precedence
        existing.category = serverQuote.category;
        showNotification('Conflict resolved: Server data used.');
      } else {
        // New quote from server
        merged.push(serverQuote);
        showNotification('New quote synced from server.');
      }
    });
  
    return merged;
  }

  async function syncWithServer() {
    const serverQuotes = await fetchQuotesFromServer();
    const mergedQuotes = mergeQuotes(quotes, serverQuotes);
  
    // Save merged data to localStorage
    quotes = mergedQuotes;
    saveQuotes();
    populateCategories();
  }

  setInterval(syncWithServer, 10000); // Sync every 10 seconds

  function showNotification(message) {
    const feedbackDiv = document.getElementById('form-feedback') || document.createElement('div');
    feedbackDiv.id = 'form-feedback';
    feedbackDiv.style.backgroundColor = '#fff3cd';
    feedbackDiv.style.color = '#856404';
    feedbackDiv.style.padding = '10px';
    feedbackDiv.style.marginTop = '10px';
    feedbackDiv.style.borderRadius = '4px';
    feedbackDiv.textContent = message;
    document.body.appendChild(feedbackDiv);
  
    setTimeout(() => feedbackDiv.remove(), 4000); // auto-remove after 4s
  }

  document.getElementById('syncBtn').addEventListener('click', syncWithServer);
