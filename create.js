function savecard() {
const q=document.getElementById("question").value.trim();
const a=document.getElementById("answer").value.trim();

    if (q && a){
        let cards=JSON.parse(localStorage.getItem("flashcards")) || [];
        cards.push({question:q,answer:a})
        localStorage.setItem("flashcards",JSON.stringify(cards))
        document.getElementById("status").textContent = "Flashcard saved";
        document.getElementById("question").value="";
        document.getElementById("answer").value="";
    }else{
        document.getElementById("status").textContent="Please fill both fields"
    }

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
