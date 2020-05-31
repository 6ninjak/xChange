// controlle se i valori inseriti nella form della registrazione corrispondono alle nostre richieste
// controlla se la password ha una lunghezza almeno pari a 8 caratteri
// controlla se la prima password inserita è identica alla seconda
function validaForm(){
    if(password()){
        if(!passwordIdentiche()){
            return false;
        }
    }
    else{
        return false;
    }
}

function passwordIdentiche(){
    if(document.registrazione.passwordVerifica.value.toString()!= document.registrazione.password.value.toString()){
        alert("Le due password devono essere identiche");
        // alert();
        return false;
    }
    return true;
}

function password(){
    if(document.registrazione.password.value.length < 8){
        alert("Password troppo corta");
        return false;
    }
    return true;
}