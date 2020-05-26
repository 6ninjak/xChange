new Vue({
    el: '#app_vue',
    data: {
      users: []
    },
    mounted: function() {
      axios.post('ricerca') //nostro server
          .then(response => {
            this.users = response.data;
            console.log(data);
          })
          .catch(error => {
            console.log(error);
          });
    }
  })
