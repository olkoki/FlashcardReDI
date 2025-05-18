let flashcards = JSON.parse(localStorage.getItem("flashcards")) || [];
function savecard() {
const question=document.getElementById("question").value.trim();
const answer=document.getElementById("answer").value.trim();
const difficulty = document.getElementById("difficulty").value;
const category = document.getElementById("category").value.trim();

    if (question && answer){
        let cards=JSON.parse(localStorage.getItem("flashcards")) || [];
        cards.push({question,answer,difficulty,category});
        localStorage.setItem("flashcards",JSON.stringify(cards));
        const status = document.getElementById("status");
        status.textContent = "✅ Flashcard saved";
status.style.color = "green";
          // Clear inputs
        document.getElementById("question").value="";
        document.getElementById("answer").value="";
        document.getElementById("category").value = "";
    }else{
        const status = document.getElementById("status");
status.textContent = "❌ Please fill both fields";
status.style.color = "red";
    }
renderCard({ question, answer, difficulty, category });
}
function renderCard(card) {
  const preview = document.getElementById("preview");

  const cardDiv = document.createElement("div");
  cardDiv.className = "card";

  const q = document.createElement("p");
  q.innerHTML = `<strong>Q:</strong> ${card.question}`;

  const a = document.createElement("p");
  a.innerHTML = `<strong>A:</strong> ${card.answer}`;

  const d = document.createElement("p");
  d.innerHTML = `<strong>Difficulty:</strong> ${card.difficulty}`;

  const c = document.createElement("p");
  c.innerHTML = `<strong>Category:</strong> ${card.category || "N/A"}`;

  cardDiv.appendChild(q);
  cardDiv.appendChild(a);
  cardDiv.appendChild(d);
  cardDiv.appendChild(c);

  preview.appendChild(cardDiv);
}


function downloadcards() {
const cards=JSON.parse(localStorage.getItem("flashcards"));
const blob=new Blob([JSON.stringify (cards)],{type:"application/json"});
const url=URL.createObjectURL(blob);


const link =document.createElement("a");
link.href=url;
link.download="flashcards.json";
link.click();
URL.revokeObjectURL(url);
setTimeout(() =>{
    document.getElementById("status").textContent = "File Downloaded successfully";
},1000);
}
function updatePreview() {
  const preview = document.getElementById("preview");
  preview.innerHTML = "";
  flashcards.forEach(renderCard);
}

function clearForm() {
  document.getElementById("question").value = "";
  document.getElementById("answer").value = "";
  document.getElementById("difficulty").value = "easy";
  document.getElementById("category").value = "";
}

function downloadCards() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flashcards));
  const a = document.createElement("a");
  a.setAttribute("href", dataStr);
  a.setAttribute("download", "flashcards.json");
  a.click();
}

function uploadCards(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const uploaded = JSON.parse(e.target.result);
      if (Array.isArray(uploaded)) {
        flashcards = flashcards.concat(uploaded);
        localStorage.setItem("flashcards", JSON.stringify(flashcards));
        updatePreview();
        const status = document.getElementById("status");
        status.textContent = "✅ Flashcards uploaded successfully.";
        status.style.color = "green";
      } else {
        const status = document.getElementById("status");
        status.textContent = "❌Invalid file format.";
              status.style.color = "red";
      }
    } catch (err) {
      const status = document.getElementById("status");
      status.textContent = "❌ Error reading file.";
      status.style.color = "red";
    }
  };
  reader.readAsText(file);
}

// Load and preview on page load
updatePreview();
