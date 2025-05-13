
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
const shuffleButton =document.getElementById("shuffle")
const progressElement = document.getElementById("progress")
const filterDifficulty = document.getElementById("filter-difficulty");
const filterCategory = document.getElementById("filter-category");

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
}

// Show the current flashcard
function showCard(index){
    if (filteredCards.length===0){
        questionElement.textContent = "No flashcards" ;
        answerElement.textContent="";
        progressElement.textContent="";
        cardElement.className = "card";
        return;
    }
    const card = filteredCards[index];
    showingAnswer=false;
    questionElement.textContent = card.question;
  answerElement.textContent = card.answer;
  answerElement.classList.add("hidden");
  questionElement.classList.remove("hidden");

  cardElement.className = "card " + card.difficulty; // color-coded by difficulty
  progressElement.textContent = `Card ${index + 1} of ${filteredCards.length}`; //Updates the progress bar text (e.g., Card 3 of 10) to show the current card number out of the total.
}


// Flip the card
cardElement.addEventListener("click",() => {
if(filteredCards.length ===0)return;
showingAnswer=!showingAnswer;
questionElement.classList.toggle("hidden",showingAnswer);
answerElement.classList.toggle("hidden", !showingAnswer);
});


// Next card
nextButton.addEventListener("click", () =>{
if(filteredCards.length===0)return;
currentIndex=(currentIndex +1) % filteredCards.length;
showCard(currentIndex);
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
