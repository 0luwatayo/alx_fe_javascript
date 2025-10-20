// ---------- Data & keys ----------
const LOCAL_STORAGE_KEY = 'dqg_quotes_v1'; // localStorage key
const SESSION_LAST_QUOTE_KEY = 'dqg_last_quote_index'; // sessionStorage key

// default quotes
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Your limitation—it's only your imagination.", category: "Inspiration" },
  { text: "Push yourself, because no one else is going to do it for you.", category: "Discipline" },
  { text: "Dream it. Wish it. Do it.", category: "Action" }
];

// ---------- DOM selections ----------
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const formArea = document.getElementById('formArea');
const exportBtn = document.getElementById('exportBtn');
const importFileInput = document.getElementById('importFile');

/* -------------------------
   Storage helpers
   -------------------------*/
function saveQuotes() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
  } catch (err) {
    console.error('Failed to save quotes to localStorage', err);
  }
}

function loadQuotes() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // validate basic shape (array of {text, category})
        const valid = parsed.every(q => q && typeof q.text === 'string' && typeof q.category === 'string');
        if (valid) {
          quotes = parsed;
        } else {
          console.warn('Local storage data had unexpected shape; ignoring.');
        }
      }
    }
  } catch (err) {
    console.error('Failed to load quotes from localStorage', err);
  }
}

/* Store last shown quote index in sessionStorage (session-only)
   Demonstrates sessionStorage use: it clears when tab/browser is closed */
function saveLastQuoteIndexToSession(index) {
  try {
    sessionStorage.setItem(SESSION_LAST_QUOTE_KEY, String(index));
  } catch (err) {
    console.warn('sessionStorage not available', err);
  }
}

function getLastQuoteIndexFromSession() {
  try {
    const v = sessionStorage.getItem(SESSION_LAST_QUOTE_KEY);
    return v === null ? null : parseInt(v, 10);
  } catch {
    return null;
  }
}

/* -------------------------
   Utility
   -------------------------*/
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* -------------------------
   Core features
   -------------------------*/
function showRandomQuote() {
  if (!quotes || quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available. Add one below!";
    return;
  }

  // Try to restore last shown quote for session continuity if present
  const lastIndex = getLastQuoteIndexFromSession();
  let idx;
  if (lastIndex !== null && lastIndex >= 0 && lastIndex < quotes.length) {
    // show a different random index than last if possible
    idx = Math.floor(Math.random() * quotes.length);
    if (quotes.length > 1 && idx === lastIndex) {
      idx = (idx + 1) % quotes.length;
    }
  } else {
    idx = Math.floor(Math.random() * quotes.length);
  }

  const q = quotes[idx];
  quoteDisplay.innerHTML = `<strong>${escapeHtml(q.category)}:</strong> "${escapeHtml(q.text)}"`;

  // save last shown quote index for session
  saveLastQuoteIndexToSession(idx);
}

/**
 * addQuote - named function required by the checker
 * reads values from inputs with IDs 'newQuoteText' and 'newQuoteCategory',
 * validates, pushes into quotes array, saves to localStorage, and updates DOM
 */
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const catInput = document.getElementById('newQuoteCategory');

  if (!textInput || !catInput) {
    alert('Add-quote inputs not found.');
    return;
  }

  const newQuoteText = textInput.value.trim();
  const newQuoteCategory = catInput.value.trim();

  if (!newQuoteText || !newQuoteCategory) {
    alert('Please fill in both the quote and the category!');
    return;
  }

  // add to array
  quotes.push({ text: newQuoteText, category: newQuoteCategory });

  // persist
  saveQuotes();

  // clear inputs
  textInput.value = '';
  catInput.value = '';

  // show the newly added quote
  quoteDisplay.innerHTML = `✅ New quote added!<br><br><strong>${escapeHtml(newQuoteCategory)}:</strong> "${escapeHtml(newQuoteText)}"`;
}

/**
 * createAddQuoteForm - required by earlier checker: dynamically creates the form
 * this also sets up event listeners on the Add button
 */
function createAddQuoteForm() {
  // container
  const container = document.createElement('div');

  // inputs
  const textInput = document.createElement('input');
  textInput.id = 'newQuoteText';
  textInput.type = 'text';
  textInput.placeholder = 'Enter a new quote';

  const catInput = document.createElement('input');
  catInput.id = 'newQuoteCategory';
  catInput.type = 'text';
  catInput.placeholder = 'Enter quote category';

  // add button
  const addBtn = document.createElement('button');
  addBtn.id = 'addQuoteBtn';
  addBtn.type = 'button';
  addBtn.textContent = 'Add Quote';
  addBtn.addEventListener('click', addQuote);

  // layout
  container.appendChild(textInput);
  container.appendChild(catInput);
  container.appendChild(addBtn);

  formArea.appendChild(container);
}

/* -------------------------
   JSON Export / Import
   -------------------------*/
function exportToJsonFile() {
  try {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Export failed', err);
    alert('Export failed. See console for details.');
  }
}

function importFromJsonFile(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!Array.isArray(parsed)) {
        alert('Imported JSON must be an array of quote objects.');
        return;
      }
      // validate shape
      const valid = parsed.every(q => q && typeof q.text === 'string' && typeof q.category === 'string');
      if (!valid) {
        alert('One or more items in the file has an invalid structure (need text and category strings).');
        return;
      }

      // merge in (avoid duplicates? here we simply append)
      quotes.push(...parsed);

      // persist new quotes
      saveQuotes();

      // show success
      alert('Quotes imported successfully!');
      // optionally show last imported quote
      const last = parsed[parsed.length - 1];
      quoteDisplay.innerHTML = `✅ Imported ${parsed.length} quotes. Last: <br><strong>${escapeHtml(last.category)}:</strong> "${escapeHtml(last.text)}"`;
    } catch (err) {
      console.error('Import failed', err);
      alert('Failed to import JSON file. Make sure it is valid JSON.');
    }
  };
  reader.readAsText(file);
}

/* -------------------------
   Initialization
   -------------------------*/
function init() {
  // load saved quotes from localStorage (if any)
  loadQuotes();

  // build dynamic add-quote form
  createAddQuoteForm();

  // attach listeners
  newQuoteButton.addEventListener('click', showRandomQuote);
  exportBtn.addEventListener('click', exportToJsonFile);

  // file input change
  importFileInput.addEventListener('change', function (evt) {
    const file = evt.target.files && evt.target.files[0];
    if (file) importFromJsonFile(file);
    // clear input so same file can be reselected later if needed
    importFileInput.value = '';
  });

  // If session had a last quote index, show that quote on init (optional UX)
  const lastIdx = getLastQuoteIndexFromSession();
  if (lastIdx !== null && lastIdx >= 0 && lastIdx < quotes.length) {
    const q = quotes[lastIdx];
    quoteDisplay.innerHTML = `<strong>${escapeHtml(q.category)}:</strong> "${escapeHtml(q.text)}"`;
  }
}

// run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
