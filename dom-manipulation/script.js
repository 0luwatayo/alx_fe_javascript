// quotes array
const quotes = [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Your limitation—it’s only your imagination.", category: "Inspiration" },
    { text: "Push yourself, because no one else is going to do it for you.", category: "Discipline" },
    { text: "Dream it. Wish it. Do it.", category: "Action" }
  ];
  
  // Select DOM elements
  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteButton = document.getElementById('newQuote');
  

  function showRandomQuote() {
    if (quotes.length === 0) {
      quoteDisplay.textContent = "No quotes available. Add one below!";
      return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const q = quotes[randomIndex];
    quoteDisplay.innerHTML = `<strong>${escapeHtml(q.category)}:</strong> "${escapeHtml(q.text)}"`;
  }
  
  function createAddQuoteForm() {
    const formContainer = document.createElement('div');
  
    const textInput = document.createElement('input');
    textInput.id = 'newQuoteText';
    textInput.type = 'text';
    textInput.placeholder = 'Enter a new quote';
  
    const categoryInput = document.createElement('input');
    categoryInput.id = 'newQuoteCategory';
    categoryInput.type = 'text';
    categoryInput.placeholder = 'Enter quote category';
  
    const addButton = document.createElement('button');
    addButton.textContent = 'Add Quote';
    addButton.addEventListener('click', addQuote);
  
    formContainer.appendChild(textInput);
    formContainer.appendChild(categoryInput);
    formContainer.appendChild(addButton);
  
    document.body.appendChild(formContainer);
  }


  function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();
  
    if (!newQuoteText || !newQuoteCategory) {
      alert("Please fill in both fields!");
      return;
    }
  
    quotes.push({ text: newQuoteText, category: newQuoteCategory });
  
    // clear inputs
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
  
    // update DOM
    quoteDisplay.innerHTML = `✅ New quote added! <br><br><strong>${escapeHtml(newQuoteCategory)}:</strong> "${escapeHtml(newQuoteText)}"`;
  }
  

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  

  newQuoteButton.addEventListener('click', showRandomQuote);
  

  createAddQuoteForm();
  