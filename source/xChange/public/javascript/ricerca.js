var app = new Vue({
  el: '#app_vue',
  data: {
    users: []
  },
  mounted: function() {
    var http = new XMLHttpRequest();
    http.onreadystatechange = gestisciResponse;
    http.open("POST", document.location.href, true);
    http.responseType = "json";
    http.send();
    function gestisciResponse(e) {
      if (e.target.readyState == 4 && e.target.status == 200) {
        app.users = e.target.response.docs;
        for (let index = 0; index < app.users.length; index++) {
          app.users[index].media=Math.round(app.users[index].media); 
        }
      }
    }
  }
});