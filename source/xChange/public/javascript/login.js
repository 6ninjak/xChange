new Vue({
    el: '#app_vue',
    data: {
      users: []
    },
    mounted: function() {
      axios.post(document.location.href) //nostro server
          .then(response => {
            this.users = response.data.docs;
            console.log(response);
          })
          .catch(error => {
            console.log(error);
          });
    }
  });