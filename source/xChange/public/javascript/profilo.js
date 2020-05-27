var app = new Vue({
    el: '#app_ve',
    data: {
        richieste: [],
        utente:[],
        recensioni:[]
    },
    computed:{
        punteggio:function(){
            var a=this.utente[0].punti;
            var b=this.utente[0].recensioni;
            var c= a/b;
            return c.toFixed(1);
        },
        punteggioArr:function(){
            var a=this.utente[0].punti;
            var b=this.utente[0].recensioni;
            var c= a/b;
            return Math.round(c);
        }
    },
    created: function() {
            axios.post('profilo') //nostro server
                .then(response => {
                    this.richieste = response.data;
                    console.log(data);
                    alert("almeno i dati li ho presi");
                })
                .catch(error => {
                    console.log(error);
                
                });
            axios.post('profilo1') //nostro server
                .then(response => {
                    this.utente = response.data;
                    console.log(data);
                    alert("presi i dati utente");
                })
                .catch(error => {
                    console.log(error);
                });
            
            axios.post('profilo2') //nostro server
                .then(response => {
                    this.recensioni = response.data;
                    console.log(data);
                    alert("presi i dati utente");
                })
                .catch(error => {
                    console.log(error);
                });
            }
    });