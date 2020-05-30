new Vue({
    el: '#app_v',
    data: {
       scelti: []
    },
    mounted: 
    function() {
      axios.post('home') //nostro server
          .then(response => {
            this.scelti = response.data;
            console.log(data);
          })
          .catch(error => {
            console.log(error);
          });
    }

})