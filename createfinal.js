
let decks = JSON.parse(localStorage.getItem("decks")) || ["Default"];
let flashcards = JSON.parse(localStorage.getItem("flashcards")) || [];

function showStatus(message, isError = false) {
  const status = document.getElementById("status");
  status.textContent = message;
  status.style.color = isError ? "red" : "white";

  setTimeout(() => {
    status.textContent = "";
  }, 3000);
}

function clearForm() {
  document.getElementById("question").value = "";
  document.getElementById("answer").value = "";
  document.getElementById("difficulty").value = "easy";
  document.getElementById("category").value = "";
}

function savecard() {
  const questionInput = document.getElementById("question");
  const answerInput = document.getElementById("answer");
  const deckSelect = document.getElementById("deck");

  const question = questionInput.value.trim();
  const answer = answerInput.value.trim();
  const difficulty = document.getElementById("difficulty").value;
  const category = document.getElementById("category").value.trim();
  const deck = deckSelect.value || "Default";  // Use Default if none selected

  // Remove any previous error styling
  questionInput.classList.remove("input-error");
  answerInput.classList.remove("input-error");

  // Validation check
  if (!question || !answer) {
    if (!question) questionInput.classList.add("input-error");
    if (!answer) answerInput.classList.add("input-error");

    showStatus("❌ Please fill both question and answer", true);
    return;
  }

  // Save flashcard
  flashcards.push({ question, answer, difficulty, category, deck });
  localStorage.setItem("flashcards", JSON.stringify(flashcards));
  showStatus("✅ Flashcard saved");

  clearForm();
  renderCard({ question, answer, difficulty, category, deck }, flashcards.length - 1);
  updateCardCount();
  refreshDecksFromFlashcards();
}

function populateDecks() {
  const deckSelect = document.getElementById("deck");
  deckSelect.innerHTML = "";
  decks.forEach(deck => {
    const option = document.createElement("option");
    option.value = deck;
    option.textContent = deck;
    deckSelect.appendChild(option);
  });
}

function createNewDeck() {
  const newDeck = prompt("Enter new deck name:");
  if (newDeck && !decks.includes(newDeck.trim())) {
    decks.push(newDeck.trim());
    localStorage.setItem("decks", JSON.stringify(decks));
    populateDecks();
    document.getElementById("deck").value = newDeck.trim();
  } else {
    alert("Deck name is empty or already exists.");
  }
}

function updatePreview() {
  const preview = document.getElementById("preview");
  preview.innerHTML = ""; // Clear all cards
  const selectedDeck = document.getElementById("deck").value;
  preview.innerHTML = ""; // Clear all cards

  flashcards.forEach((card, actualIndex) => {
    // if (!selectedDeck || card.deck === selectedDeck) {
    //   renderCard(card, index);
    // if (card.deck === selectedDeck) {
    if (selectedDeck === "Default" || card.deck === selectedDeck) {
      renderCard(card, actualIndex); // Now index is correct
    }
  });
  updateCardCount();
}

window.onload = () => {
  if (!decks.includes("Default")) {
    decks.unshift("Default");
  } else {
    const defaultIndex = decks.indexOf("Default");
    if (defaultIndex > 0) {
      decks.splice(defaultIndex, 1);
      decks.unshift("Default");
    }
  }

  localStorage.setItem("decks", JSON.stringify(decks));
  populateDecks();

  // Select Default by default
  document.getElementById("deck").value = "Default";

  updatePreview();
};
function addNewDeck(deckName) {

  // Add only if not already in the list
  if (!decks.includes(deckName)) {
    decks.push(deckName);
    localStorage.setItem("decks", JSON.stringify(decks));
    populateDecks(); // refresh dropdown
  }
}

function populateEditDecks() {
  const editDeckSelect = document.getElementById("editDeck");
  editDeckSelect.innerHTML = "";
  decks.forEach(deck => {
    const option = document.createElement("option");
    option.value = deck;
    option.textContent = deck;
    editDeckSelect.appendChild(option);
  });
}

function renderCard(card, index) {
  const preview = document.getElementById("preview");

  const cardDiv = document.createElement("div");
  cardDiv.className = "card";

  const q = document.createElement("p");
  q.innerHTML = `<strong>Question:</strong> ${card.question}`;

  const a = document.createElement("p");
  a.innerHTML = `<strong>Answer:</strong> ${card.answer}`;

  const d = document.createElement("p");
  d.innerHTML = `<strong>Difficulty:</strong> ${card.difficulty}`;
  d.classList.add(`difficulty-${card.difficulty}`); // Add class based on difficulty

  const c = document.createElement("p");
  c.innerHTML = `<strong>Category:</strong> ${card.category || "N/A"}`;
  const deckName = document.createElement("p");
  deckName.innerHTML = `<strong>Deck:</strong> ${card.deck || "Unassigned"}`;
  cardDiv.appendChild(deckName);

  //Edit Button
  const editBtn = document.createElement("button");
  editBtn.textContent = "✏️ Edit";
  editBtn.className = "edit-btn"; // Apply your CSS styles
  // Edit button click handler
  editBtn.onclick = function () {
    openModal(card, index); // <- this shows the modal and loads data
  };

  //  Delete Button
  const delBtn = document.createElement("button");
  delBtn.textContent = "🗑️ Delete";
  delBtn.className = "del-btn"; // Apply your CSS styles

  (function (currentIndex) {
    delBtn.onclick = function () {
      const confirmDelete = confirm("Are you sure you want to delete this card?");
      if (confirmDelete) {
        cardDiv.style.opacity = "0";
        setTimeout(() => {
          const deckSelect = document.getElementById("deck");
          const selectedDeck = deckSelect.value;

          // Remove the card from flashcards
          flashcards.splice(currentIndex, 1);
          localStorage.setItem("flashcards", JSON.stringify(flashcards));

          // Refresh the decks list based on remaining cards
          refreshDecksFromFlashcards();

          // Check if the selected deck still has cards
          const deckHasCards = flashcards.some(card => card.deck === selectedDeck);

          if (!deckHasCards) {
            // Remove the deck if it is not "Default" and exists in decks list
            if (selectedDeck !== "Default" && decks.includes(selectedDeck)) {
              decks = decks.filter(deck => deck !== selectedDeck);
              localStorage.setItem("decks", JSON.stringify(decks));
              populateDecks(); // Refresh dropdown
            }
            deckSelect.value = "Default"; // Switch to Default deck if no cards left
          } else {
            deckSelect.value = selectedDeck; // Keep current deck selected if it still has cards
          }

          updatePreview();
          updateCardCount();
          showStatus("✅ Card deleted successfully.");
        }, 300);
      }
    };
  })(index);

  // Append all elements to card container
  cardDiv.appendChild(q);
  cardDiv.appendChild(a);
  cardDiv.appendChild(d);
  cardDiv.appendChild(c);
  cardDiv.appendChild(editBtn);
  cardDiv.appendChild(delBtn);
  preview.prepend(cardDiv); // added card appears on the top

  //   preview.appendChild(cardDiv); (to add cards at the end)
}
function deleteAllCards() {
  if (confirm("Are you sure you want to delete ALL flashcards from all decks? This cannot be undone.")) {
    // Loop through all localStorage keys and remove only flashcard decks
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      // Optional: Add a prefix check if decks are stored with a pattern like `deck_`
      // if (key.startsWith("deck_")) {
      localStorage.removeItem(key);
      // }
    }

    // Clear preview section visually
    document.getElementById("preview").innerHTML = "";
    document.getElementById("card-count").textContent = "Total Cards: 0";

    // Optionally reset the deck dropdown
    const deckSelect = document.getElementById("deck");
    deckSelect.innerHTML = "";

    alert("All flashcards from all decks have been deleted.");
  }
}

// Download flashcards as a JSON file
function downloadcards() {
  const blob = new Blob([JSON.stringify(flashcards)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "flashcards.json";
  link.click();
  URL.revokeObjectURL(url);
  setTimeout(() => {
    showStatus("✅ File Downloaded successfully");
  }, 1000);
}

let editIndex = null;
function openModal(card, index) {
  editIndex = index;

  document.getElementById("editQuestion").value = card.question;
  document.getElementById("editAnswer").value = card.answer;
  document.getElementById("editDifficulty").value = card.difficulty;
  document.getElementById("editCategory").value = card.category;

  populateEditDecks();
  document.getElementById("editDeck").value = card.deck || decks[0];

  document.getElementById("editModal").style.display = "block";
}

function closeModal() {
  document.getElementById("editModal").style.display = "none";
}

function saveEdit() {
  const question = document.getElementById("editQuestion").value.trim();
  const answer = document.getElementById("editAnswer").value.trim();
  const difficulty = document.getElementById("editDifficulty").value;
  const category = document.getElementById("editCategory").value.trim();
  const deck = document.getElementById("editDeck").value;

  if (question && answer) {
    flashcards[editIndex] = { question, answer, difficulty, category, deck };
    localStorage.setItem("flashcards", JSON.stringify(flashcards));
    updatePreview(); // re-render the updated cards
    closeModal();
    showStatus("✅ Flashcard updated.");
  } else {
    alert("❌ Question and Answer cannot be empty.");
  }
}


// Upload flashcards from a JSON file input
function uploadCards(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const uploaded = JSON.parse(event.target.result);
      // Only accept if uploaded data is an array
      if (Array.isArray(uploaded)) {
        flashcards = flashcards.concat(uploaded);
        removeDuplicateQuestions();// no dulicate cards will be uploaded
        // Extract deck names from uploaded cards
        const uploadedDecks = new Set(uploaded.map(card => card.deck).filter(Boolean));
        uploadedDecks.forEach(deck => {
          if (!decks.includes(deck)) {
            decks.push(deck);
          }
        });
        localStorage.setItem("flashcards", JSON.stringify(flashcards));
        localStorage.setItem("decks", JSON.stringify(decks));
        populateDecks(); // refresh deck dropdown

        document.getElementById("deck").value = "Default";


        updatePreview();
        updateCardCount();
        showStatus("✅ Flashcards uploaded successfully.");
      } else {
        showStatus("❌Invalid file format.");
      }
    } catch (err) {
      showStatus("❌ Error reading file.");
    }
  };

  reader.readAsText(file);
}

// Remove flashcards with duplicate questions (case-insensitive)
function removeDuplicateQuestions() {
  const seen = new Set();
  const uniqueCards = [];

  for (const card of flashcards) {
    const q = card.question.trim().toLowerCase();
    if (!seen.has(q)) {
      seen.add(q);
      uniqueCards.push(card);
    }
  }
  flashcards = uniqueCards;// Update global flashcards array
  localStorage.setItem("flashcards", JSON.stringify(flashcards));// Save unique cards

  updatePreview();
  updateCardCount();
  showStatus("✅ Duplicates removed.");
}


function updateCardCount() {
  const selectedDeck = document.getElementById("deck").value;

  // If "Default", count all flashcards
  const count = selectedDeck === "Default"
    ? flashcards.length
    : flashcards.filter(card => card.deck === selectedDeck).length;

  document.getElementById("card-count").textContent = `Total Cards: ${count}`;
}

function deleteDeck() {
  const deckSelect = document.getElementById("deck");
  const selectedDeck = deckSelect.value;

  if (selectedDeck === "Default") {
    alert("You cannot delete the Default deck.");
    return;
  }
  // Confirm deletion
  if (!confirm(`Are you sure you want to delete the deck "${selectedDeck}"? This will also delete all flashcards in this deck.`)) {
    return;
  }

  // Remove deck from decks array
  decks = decks.filter(deck => deck !== selectedDeck);
  localStorage.setItem("decks", JSON.stringify(decks));

  // Remove all flashcards belonging to this deck
  flashcards = flashcards.filter(card => card.deck !== selectedDeck);
  localStorage.setItem("flashcards", JSON.stringify(flashcards));
  refreshDecksFromFlashcards();
  // Refresh deck dropdown and preview
  populateDecks();

  // If decks exist, select the first one, else reset selection
  if (decks.length > 0) {
    deckSelect.value = decks[0];
  } else {
    deckSelect.value = "";
  }

  updatePreview();
  updateCardCount();
  showStatus(`✅ Deck "${selectedDeck}" and its flashcards deleted.`);
}

function refreshDecksFromFlashcards() {
  const deckSet = new Set();

  flashcards.forEach(card => {
    if (card.deck) {
      deckSet.add(card.deck);
    }
  });
  const deckArray = Array.from(deckSet).filter(deck => deck !== "Default");

  // Ensure "Default" is always first
  decks = ["Default", ...deckArray];

  localStorage.setItem("decks", JSON.stringify(decks));
  populateDecks();
}

function myFunction() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}
