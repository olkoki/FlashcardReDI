document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const target = link.getAttribute('href').substring(1);
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');

    // Show the target section
    document.getElementById(target).style.display = 'block';

    // Update active class on nav links
    document.querySelectorAll('.topnav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
  });
});

// Load flashcards from localStorage

let allCards = JSON.parse(localStorage.getItem("flashcards")) || [];
let filteredCards = [...allCards]; 
let currentIndex=0;
let showingAnswer=false;


// DOM elements
const cardElement = document.getElementById("card");
const questionElement = document.getElementById("question");
const answerElement = document.getElementById("answer");
const nextButton = document.getElementById("next");
const shuffleButton = document.getElementById("shuffle");
const filterDifficulty = document.getElementById("filter-difficulty");
const filterCategory = document.getElementById("filter-category");
const markKnownButton = document.getElementById("mark-known"); 
const markDifficultButton = document.getElementById("mark-difficult"); 
const skippedCount = 0;

//  Filter flashcards by difficulty and category
function applyFilters() {
    const difficulty = filterDifficulty.value.toLowerCase();
    const category = filterCategory.value.trim().toLowerCase();
  
    filteredCards = allCards.filter(card => {
        const matchesDifficulty = !difficulty || card.difficulty === difficulty;
        const matchesCategory = !category || (card.category && card.category.toLowerCase().includes(category));
        return matchesDifficulty && matchesCategory;
    });

    currentIndex = 0;
    showCard(currentIndex);

    // Ensure buttons are visible if there are cards
    if (filteredCards.length > 0) {
        markKnownButton.style.display = 'inline-block';
        markDifficultButton.style.display = 'inline-block';
    } else {
        markKnownButton.style.display = 'none';
        markDifficultButton.style.display = 'none';
    }
}

// Toggle filters visibility
const toggleBtn = document.getElementById("toggle-filters");
const filters = document.getElementById("filters");

toggleBtn.addEventListener("click", () => {
  const isHidden = filters.classList.toggle("hidden");
  toggleBtn.setAttribute("aria-expanded", !isHidden);
  toggleBtn.innerHTML = isHidden ? "Show Filters &#x25BC;" : "Hide Filters &#x25B2;";
});

const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
  
function updateProgress() {
  if (filteredCards.length === 0 || currentIndex >= filteredCards.length) {
    progressBar.style.width = "100%";
    progressText.textContent = "All done!";
    return;
  } 

  const progressPercentage = ((currentIndex + 1) / filteredCards.length) * 100;
  progressBar.style.width = `${progressPercentage}%`;
  progressText.textContent = `Card ${currentIndex + 1} of ${filteredCards.length}`;
}

// Container to hold end buttons
const endButtonsContainer = document.createElement("div");
endButtonsContainer.className = "end-buttons";
endButtonsContainer.style.display = "none"; // Hide by default
document.querySelector("main").appendChild(endButtonsContainer);

// Show the current flashcard
function showCard(index) {
  const cardContainer = document.querySelector(".card-container");

  // Reset the flip state NEW
  cardElement.classList.remove("flip");
  questionElement.classList.remove("hidden");
  answerElement.classList.add("hidden");
  showingAnswer = false;
    
  if (filteredCards.length === 0 || index >= filteredCards.length) {
        questionElement.classList.add("hidden");
        answerElement.classList.add("hidden");
        document.getElementById("end-message").classList.remove("hidden");
        updateProgress();

        //Ensure is not flipped
        cardContainer.style.transform = "";
        cardContainer.classList.remove("flip");
        return;
    } else {
        document.getElementById("end-message").classList.add("hidden");
    }
    const card = filteredCards[index];
    showingAnswer = false;
    questionElement.textContent = card.question;
    answerElement.textContent = card.answer;
    answerElement.classList.add("hidden");
    questionElement.classList.remove("hidden");

    cardElement.className = "card " + card.difficulty; // color-coded by difficulty
    endButtonsContainer.style.display = "none"; // Hide during normal viewing
    updateProgress();
}


// Flip the card
cardElement.addEventListener("click",() => {
  if(filteredCards.length ===0)return;
  showingAnswer=!showingAnswer;
  cardElement.classList.toggle("flip", showingAnswer);
  questionElement.classList.toggle("hidden",showingAnswer);
  answerElement.classList.toggle("hidden", !showingAnswer);

});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") nextButton.click();
  if (e.key === "ArrowLeft") prevButton.click();
  if (e.key === " ") cardElement.click(); // Flip card
});

// Next card
nextButton.addEventListener("click", () =>{
if(filteredCards.length===0)return;
currentIndex=(currentIndex +1) % filteredCards.length;
showCard(currentIndex);
updateCarousel();
});

//Previous
const prevButton = document.getElementById("prev");
prevButton.addEventListener("click", () => {
  if (filteredCards.length === 0) return;
  currentIndex = (currentIndex - 1 + filteredCards.length) % filteredCards.length;
  showCard(currentIndex);
  updateCarousel();
});

// Shuffle cards
shuffleButton.addEventListener("click",()=>{
  for (let i = filteredCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Picks a random index j, where 0 ≤ j ≤ i.
    [filteredCards[i], filteredCards[j]] = [filteredCards[j], filteredCards[i]];
  }
  currentIndex = 0;
  showCard(currentIndex);
});


// Apply filters when user changes dropdown/input
filterDifficulty.addEventListener("change", applyFilters);
filterCategory.addEventListener("input", applyFilters);

// Load initial cards
applyFilters();
updateUndoButtonsVisibility();


const knownList = document.getElementById("known-list");
const difficultList = document.getElementById("difficult-list");




// Track known and difficult cards
let knownCards = JSON.parse(localStorage.getItem("knownCards")) || []; //NEW
let difficultCards = JSON.parse(localStorage.getItem("difficultCards")) || [];//NEW
let knownUndoStack = [];
let difficultUndoStack = [];

function saveStashesToLocalStorage() {
  localStorage.setItem("knownCards", JSON.stringify(knownCards));
  localStorage.setItem("difficultCards", JSON.stringify(difficultCards));
}

function rebuildStashLists() {
  knownList.innerHTML = "";
  difficultList.innerHTML = "";

  knownCards.forEach(card => {
    const listItem = document.createElement("li");
    listItem.textContent = card.question;
    knownList.appendChild(listItem);
  });

  difficultCards.forEach(card => {
    const listItem = document.createElement("li");
    listItem.textContent = card.question;
    difficultList.appendChild(listItem);
  });

  updateUndoButtonsVisibility();
}

function updateUndoButtons() {
  document.getElementById("undo-known").disabled = knownUndoStack.length === 0;
  document.getElementById("undo-difficult").disabled = difficultUndoStack.length === 0;
}

function updateUndoButtonsVisibility() {
  const leftList = document.getElementById('known-list');
  const rightList = document.getElementById('difficult-list');

  const undoLeftBtn = document.getElementById("undo-known");
  const undoRightBtn = document.getElementById("undo-difficult");

  undoLeftBtn.style.display = leftList.children.length === 0 ? 'none' : 'inline-block';
  undoRightBtn.style.display = rightList.children.length === 0 ? 'none' : 'inline-block';
}



function addToStash(card, type) {
  const listItem = document.createElement("li");
  listItem.textContent = card.question;
  listItem.dataset.question = card.question;

  if (type === "known") {
    knownCards.push(card);
    knownList.appendChild(listItem);
    knownUndoStack.push({ card, element: listItem });
  } else if (type === "difficult") {
    difficultCards.push(card);
    difficultList.appendChild(listItem);
    difficultUndoStack.push({ card, element: listItem });
  }

  // --- Force reflow before adding animation class ---
  void listItem.offsetWidth;
  listItem.classList.add("animated");

  listItem.addEventListener("animationend", () => {
    listItem.classList.remove("animated");
  });

  filteredCards.splice(currentIndex, 1);
  if (currentIndex >= filteredCards.length) currentIndex = 0;
  showCard(currentIndex);

  saveStashesToLocalStorage();
  updateUndoButtons(); 
  updateUndoButtonsVisibility();
  updateProgress();
}

document.querySelectorAll('.stash h3').forEach(heading => {
  heading.addEventListener('click', () => {
    heading.parentElement.classList.toggle('open');
  });
})


markKnownButton.addEventListener("click", () => {
    if (filteredCards.length === 0) return; // Prevent errors if no cards are available
    addToStash(filteredCards[currentIndex], "known");

    if (filteredCards.length === 0) {
        markKnownButton.style.display = 'none';
        markDifficultButton.style.display = 'none';
        endButtonsContainer.style.display = 'block';
    }
});

markDifficultButton.addEventListener("click", () => {
    if (filteredCards.length === 0) return; // Prevent errors if no cards are available
    addToStash(filteredCards[currentIndex], "difficult");

    if (filteredCards.length === 0) {
        markKnownButton.style.display = 'none';
        markDifficultButton.style.display = 'none';
        endButtonsContainer.style.display = 'block';
    }
});

document.getElementById("undo-known").addEventListener("click", () => {
  const last = knownUndoStack.pop();
  if (!last) return;

  knownCards = knownCards.filter(c => c !== last.card);
  knownList.removeChild(last.element);

  filteredCards.splice(currentIndex, 0, last.card);
  showCard(currentIndex);

  //Reset flip
  const cardContainer = document.querySelector(".card-container");
  cardContainer.style.transform = "";
  cardContainer.classList.remove("flip");

  saveStashesToLocalStorage();
  updateUndoButtons(); 
  updateUndoButtonsVisibility();
  updateProgress();
  // Show the mark buttons again if hidden
  markKnownButton.style.display = 'inline-block';
  markDifficultButton.style.display = 'inline-block';

});

document.getElementById("undo-difficult").addEventListener("click", () => {
  const last = difficultUndoStack.pop();
  if (!last) return;

  difficultCards = difficultCards.filter(c => c !== last.card);
  difficultList.removeChild(last.element);

  filteredCards.splice(currentIndex, 0, last.card);
  showCard(currentIndex);

  //Reset flip NEW
  const cardContainer = document.querySelector(".card-container");
  cardContainer.style.transform = "";
  cardContainer.classList.remove("flip");

  saveStashesToLocalStorage();
  updateUndoButtons();
  updateUndoButtonsVisibility();
  updateProgress();
  // Show the mark buttons again if hidden
  markKnownButton.style.display = 'inline-block';
  markDifficultButton.style.display = 'inline-block';

});



// Start Over button
const startOverButton = document.createElement("button");
startOverButton.textContent = "Start Over";
startOverButton.addEventListener("click", () => {
  filteredCards = [...allCards];
  currentIndex = 0;
  knownCards = [];
  difficultCards = [];
  knownUndoStack = [];
  difficultUndoStack = [];
  knownList.innerHTML = "";
  difficultList.innerHTML = "";
  endButtonsContainer.style.display = "none";

  localStorage.removeItem("knownCards");
  localStorage.removeItem("difficultCards");

  markKnownButton.style.display = 'inline-block';
  markDifficultButton.style.display = 'inline-block';
  updateUndoButtons();
  updateUndoButtonsVisibility();
  showCard(currentIndex);
});
endButtonsContainer.appendChild(startOverButton);

// On page load, rebuild stashes so UI reflects localStorage data
rebuildStashLists();

// Create New button
const createButton = document.createElement("button");
createButton.textContent = "Add New Flashcards";
createButton.addEventListener("click", () => {
  // You can redirect to a flashcard creation page or open a form modal
  window.location.href = "createnew.html"; // Change to your actual creation page
});
createButton.classList.add("create-button");
endButtonsContainer.appendChild(createButton);

// Add search functionality
const searchGroup = document.createElement("div");
searchGroup.className = "filter-group";

const searchLabel = document.createElement("label");
searchLabel.htmlFor = "search-flashcards";
searchLabel.textContent = "Search:";

const inputWrapper = document.createElement("div");
inputWrapper.className = 'input-icon-wrapper';

const searchIcon = document.createElement("i");
searchIcon.className = "fas fa-magnifying-glass search-icon";

const searchInput = document.createElement("input");
searchInput.type = "text";
searchInput.id = "search-flashcards";
searchInput.placeholder = "Search flashcards...";
searchInput.className = "search-input";

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  filteredCards = allCards.filter(card =>
    card.question.toLowerCase().includes(query) ||
    (card.answer && card.answer.toLowerCase().includes(query))
  );
  currentIndex = 0;
  showCard(currentIndex);
});

inputWrapper.appendChild(searchIcon);
inputWrapper.appendChild(searchInput);
searchGroup.appendChild(searchLabel);
searchGroup.appendChild(inputWrapper);

const mediaQuery = window.matchMedia('(max-width: 767px)');
const stashButtons = document.querySelectorAll('.stash-button');
const stashOverlays = document.querySelectorAll('.stash-overlay');

function setupOverlayHandlers() {
  stashButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      stashOverlays[index].style.display = 'flex';
    });
  });

  stashOverlays.forEach((overlay) => {
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        overlay.style.display = 'none';
      }
    });
  });
}

if (mediaQuery.matches) setupOverlayHandlers();
mediaQuery.addEventListener('change', (e) => {
  if (e.matches) setupOverlayHandlers();
});


document.querySelector(".filters").appendChild(searchGroup);

// JavaScript code to split text into individual words or letters
const title = document.querySelector('.fun-title');
const text = title.dataset.text;
const isMobile = window.matchMedia('(max-width: 768px)').matches;

const words = text.split(' ');
const letters = words.map(word => word.split(''));

if (isMobile) {
  title.innerHTML = words.map(word => `<span class="glow-word">${word}</span>`).join(' ');
} else {
  title.innerHTML = letters.map(letterArray => letterArray.map(letter => `<span class="glow-letter">${letter}</span>`).join('')).join(' ');
}

// Update on window resize
window.addEventListener('resize', () => {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) {
    title.innerHTML = words.map(word => `<span class="glow-word">${word}</span>`).join(' ');
  } else {
    title.innerHTML = letters.map(letterArray => letterArray.map(letter => `<span class="glow-letter">${letter}</span>`).join('')).join(' ');
  }
});







//Prevent firing multiple times/ hover effect