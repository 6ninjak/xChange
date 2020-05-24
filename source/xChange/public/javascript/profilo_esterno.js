var app = new Vue({
    el: '#app_v',
    data: {
      utente: []
    },
    mounted: function() {
    axios.post('profilo_esterno') //nostro server
    .then(response => {
    this.utente = response.data;
    console.log(data);
    })
    .catch(error => {
        console.log(body);
    });
  }
})