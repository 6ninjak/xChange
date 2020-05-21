function validaForm(){
    if(passwordIdentiche()){
    }
    else{
        return false;
    }
}

function passwordIdentiche(){
    if(document.registrazione.passwordVerifica.value.toString()!= document.registrazione.password.value.toString()){
        alert("Le due password devono essere identiche");
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