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
        var baseUrl = document.location.href.substr(-1) == '/'? document.location.href.replace(/.$/,"") : document.location.href;
        axios.get(baseUrl + "/dati") //nostro server
            .then(response => {
                this.utente = [response.data];
                console.log(response.data);
            })
            .catch(error => {
                console.log(error);
        });
        axios.get(baseUrl + "/ricevute") //nostro server
            .then(response => {
                this.richieste = response.data;
                console.log(response.data);
            })
            .catch(error => {
                console.log(error);
        });
        axios.get(baseUrl + "/effettuate") //nostro server
            .then(response => {
                this.notifiche = response.data;
                console.log(response.data);
            })
            .catch(error => {
                console.log(error);
        });
        axios.get(baseUrl + "/recensioni") //nostro server
            .then(response => {
                this.recensioni = response.data;
                console.log(response.data);
            })
            .catch(error => {
                console.log(error);
        });
    }
});