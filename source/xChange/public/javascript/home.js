new Vue({
    el: '#app_v',
    data: {
       scelti: []
    },
    mounted: 
    function() {
      axios.post('migliori') //nostro server
          .then(response => {
            this.scelti = response.data.docs;
            console.log(data);
          })
          .catch(error => {
            console.log(error);
          });
    }

})