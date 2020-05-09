
function verificaForm(){
    var v= parseInt(document.getElementById("ID_telefono").value);
    if(isNaN(v)){
         alert("il campo accetta solo numeri");
         return false;
    }
    if(document.getElementById("ID_professione")==""){
         alert("la professione è gia inserita");
         return false;
    }
    if(document.getElementById("ID_email")==""){
        alert("e-mail gia inserita");
        return false;
    }  
    alert("successo")  
    return true
}