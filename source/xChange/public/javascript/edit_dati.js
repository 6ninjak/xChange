// controlla se i valori passati dalla form del file edit_dati.html sono giusti
function verificaForm(){
    if(document.getElementById("telefono").value.length < 9){
        alert("Il numero di telefono è troppo corto");
        return false;
    }  
    alert("successo")  
    return true
}