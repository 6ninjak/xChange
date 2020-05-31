// immagazzina le varie informazioni riguardante il proprio profilo nei vari Array, per poi essere usati
// all'interno del file profilo.html
var app = new Vue({
    el: '#app_ve',
    data: {
        notifiche: [],
        richieste: [],
        utente: [],
        recensioni: []
    },
    created: function() {
        axios.get(document.location.href + "/dati") //nostro server
            .then(response => {
                this.utente = [response.data];
                console.log(data);
            })
            .catch(error => {
                console.log(error);
        });
        axios.get(document.location.href + "/ricevute") //nostro server
            .then(response => {
                this.richieste = response.data;
                console.log(data);
            })
            .catch(error => {
                console.log(error);
        });
        axios.get(document.location.href + "/effettuate") //nostro server
            .then(response => {
                this.notifiche = response.data;
                console.log(data);
            })
            .catch(error => {
                console.log(error);
        });
        axios.get(document.location.href + "/recensioni") //nostro server
            .then(response => {
                this.recensioni = response.data;
                console.log(data);
            })
            .catch(error => {
                console.log(error);
        });
    }
});