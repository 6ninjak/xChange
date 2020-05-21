var app = new Vue({
    el: '#app_vue',
    data: {
      users: []
    },
    mounted: function() {
      axios.get('search') //nostro server
          .then(response => {
            this.users = response.data;
            console.log(response);
          })
          .catch(error => {
            console.log(error);
          });
    }
  })
