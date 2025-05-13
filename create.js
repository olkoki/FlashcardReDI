function savecard() {
    const question=document.getElementById("question").value.trim();
    const answer=document.getElementById("answer").value.trim();
    const difficulty = document.getElementById("difficulty").value;
    const category = document.getElementById("category").value.trim();
    
        if (question && answer){
            let cards=JSON.parse(localStorage.getItem("flashcards")) || [];
            cards.push({question,answer,difficulty,category});
            localStorage.setItem("flashcards",JSON.stringify(cards));
            document.getElementById("status").textContent = "Flashcard saved";
            document.getElementById("question").value="";
            document.getElementById("answer").value="";
            document.getElementById("category").value = "";
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
