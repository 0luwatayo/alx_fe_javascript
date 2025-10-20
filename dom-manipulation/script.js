// Array to store quotes with text and category
const quotes = [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Your limitation—it’s only your imagination.", category: "Inspiration" },
    { text: "Push yourself, because no one else is going to do it for you.", category: "Discipline" },
    { text: "Dream it. Wish it. Do it.", category: "Action" }
  ];
  
  // Select DOM elements
  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteButton = document.getElementById('newQuote');
  
  // Function to show a random quote
  function showRandomQuote() {
    if (quotes.length === 0) {
      quoteDisplay.textContent = "No quotes available. Add one below!";
      return;
    }
  
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    quoteDisplay.innerHTML = `<strong>${randomQuote.category}:</strong> "${randomQuote.text}"`;
  }
  
  // Event listener for showing new quotes
  newQuoteButton.addEventListener('click', showRandomQuote);
  
  // Function to add a new quote
  function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();
  
    if (!newQuoteText || !newQuoteCategory) {
      alert("Please fill in both the quote and the category!");
      return;
    }
  
    // Add new quote to the array
    quotes.push({ text: newQuoteText, category: newQuoteCategory });
  
    // Clear input fields
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
  
    // Feedback to user
    quoteDisplay.innerHTML = `✅ New quote added successfully! <br><br> "${newQuoteText}" (${newQuoteCategory})`;
  }
  