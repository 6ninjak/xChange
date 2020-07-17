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
                    console.log(response.data);
                })
                .catch(error => {
                    console.log(error);
                });
        }
})