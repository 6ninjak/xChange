// inserisce all'interno dell'array tutti i profili che combaciano con il valore inserito all'interno
// della barra di ricerca e viene spedito al file ricerca.html
var app = new Vue({
    el: '#app_vue',
    data: {
        users: []
    },
    mounted: function () {
        var http = new XMLHttpRequest();
        http.onreadystatechange = gestisciResponse;
        var baseUrl = document.location.href.substr(-1) == '/' ? document.location.href.replace(/.$/, "") : document.location.href;
        http.open("POST", baseUrl, true);
        http.responseType = "json";
        http.send();
        function gestisciResponse(e) {
            if (e.target.readyState == 4 && e.target.status == 200) {
                app.users = e.target.response.docs;
                for (let index = 0; index < app.users.length; index++) {
                    app.users[index].media = Math.round(app.users[index].media);
                }
            }
        }
    }
});