// visualizza sulla home i profili con i voti migliori
new Vue({
    el: '#app_v',
    data: {
        scelti: [],
        notifiche: []
    },
    mounted:
        function () {
            axios.post('/migliori') //nostro server
                .then(response => {
                    this.scelti = response.data.docs;
                    console.log(data);
                })
                .catch(error => {
                    console.log(error);
                });
            
            axios.get("/users/"+ username +"/notifiche")
                .then(response => {
                    this.notifiche = response.data.docs;
                    console.log(data);
                })
                .catch(error => {
                    console.log(error);
                });
        }
})