const API_URL = "https://dummyjson.com/quotes?limit=12";

const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const gridEl = document.getElementById("card-grid");
const searchInput = document.getElementById("search-input");
const noResultsEl = document.getElementById("no-results");

/**
 * STORED DATA
 * This is the full list of quotes we fetched from the API, kept in
 * memory. Once this is populated, we never need to hit the API again —
 * searching/filtering works against this array, not a new fetch.
 */
let allQuotes = [];

/**
 * FETCH LOGIC
 * Its only job: go get the data and hand back a plain array of quote
 * objects. It doesn't know or care about the DOM.
 */
async function fetchQuotes() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.quotes; // array of { id, quote, author }
}

/**
 * RENDER LOGIC
 * Its only job: take a list of items shaped like { quote, author }
 * and turn it into cards on the page. It doesn't know or care where
 * the data came from — real API, mock array, anything.
 */
function renderQuoteCards(items) {
  gridEl.innerHTML = ""; // clear any previous render

  items.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "quote-card";
    card.style.setProperty("--tilt", `${(index % 2 === 0 ? -1 : 1) * 0.6}deg`);

    const number = document.createElement("span");
    number.className = "card-number";
    number.textContent = `NO. ${String(item.id).padStart(3, "0")}`;

    const quoteText = document.createElement("p");
    quoteText.className = "card-quote";
    quoteText.textContent = item.quote;

    const author = document.createElement("p");
    author.className = "card-author";
    author.textContent = item.author;

    card.append(number, quoteText, author);
    gridEl.appendChild(card);
  });
}

/**
 * ORCHESTRATION
 * Wires fetch + render together and manages the loading/error UI.
 */
async function init() {
  loadingEl.hidden = false;
  errorEl.hidden = true;

  try {
    const quotes = await fetchQuotes();
    allQuotes = quotes; // keep the full fetched list in memory for searching later
    renderQuoteCards(allQuotes);
    loadingEl.hidden = true;
  } catch (err) {
    console.error("Failed to load quotes:", err);
    loadingEl.hidden = true;
    errorEl.hidden = false;
  }
}

/**
 * SEARCH / FILTER LOGIC
 * Runs entirely against the in-memory `allQuotes` array — no fetch,
 * no network request. Filters by author, case-insensitively, then
 * re-renders using the same renderQuoteCards function from 5.4.
 */
function handleSearchInput(event) {
  const searchTerm = event.target.value.trim().toLowerCase();

  const filtered = searchTerm === ""
    ? allQuotes
    : allQuotes.filter((item) =>
        item.author.toLowerCase().includes(searchTerm)
      );

  noResultsEl.hidden = filtered.length !== 0;
  renderQuoteCards(filtered);
}

searchInput.addEventListener("input", handleSearchInput);

init();