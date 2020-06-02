// controlla se i valori passati dalla form del file edit_dati.html sono giusti
function verificaForm() {
    if (document.getElementById("telefono").value.length < 9 && document.getElementById("telefono").value.length != 0) {
        alert("Il numero di telefono è troppo corto");
        return false;
    }
    else {
        // alert($("[data-id*='competenze]"));
        // document.getElementById("professione").value = document.getElementById("professione").title
        // alert(document.getElementById("professione").value);
        // alert(document.getElementById("competenze").value);
        alert("modifiche apportate con successo!")
        return true;
    }
}