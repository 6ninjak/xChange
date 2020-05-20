var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

// creazione server
var app = express();
var some;
// imposta html come default per i file nelle views
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// middleware di body parser per riconoscere diversi tipi di url
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// riconoscce il percorso public
app.use(express.static(path.join(__dirname, 'public')));

// percorso home
app.get('/', (req, res) => {
    console.log(req.method + ": " + req.path);
    res.render('home', {
        title: 'xChange'
    });
});

app.get('/Faq', (req, res) => {
    console.log(req.method + ": " + req.path);
    res.render('Faq', {
        title: 'Faq'
    });
});

app.get('/profilo', (req, res) => {
    console.log(req.method + ": " + req.path);
    res.render('profilo', {
        title: 'profilo'
    });
});

app.post('/profilo', (req, res) => {
    console.log(req.method + ": " + req.path);
    console.log(req.body.telefono);
    res.redirect('/profilo');
});

app.get('/profilo_esterno', (req, res) => {
    console.log(req.method + ": " + req.path);
    res.render('profilo_esterno', {
        title: 'profilo'
    });
});

app.get('/edit_dati', (req, res) => {
    console.log(req.method + ": " + req.path);
    res.render('edit_dati', {
        title: 'edit_dati'
    });
});

app.get('/ricerca', (req, res) => {
    console.log(req.method + ": " + req.path);
    res.render('ricerca', {
        title: 'edit_dati'
    });
});

app.get('/search', (req, res) => {
    console.log(req.method + ": " + req.path);
    res.json([{
        "id": 1,
        "name": "Leanne Graham",
        "username": "Bret",
        "email": "Sincere@april.biz",
        "address": {
          "street": "Kulas Light",
          "suite": "Apt. 556",
          "city": "Gwenborough",
          "zipcode": "92998-3874",
          "geo": {
            "lat": "-37.3159",
            "lng": "81.1496"
          }
        }
    },
    {
        "id": 2,
        "name": "Ervin Howell",
        "username": "Antonette",
        "email": "Shanna@melissa.tv",
        "address": {
          "street": "Victor Plains",
          "suite": "Suite 879",
          "city": "Wisokyburgh",
          "zipcode": "90566-7771",
          "geo": {
            "lat": "-43.9509",
            "lng": "-34.4618"
          }
        }
    }
     ]);
});


// ascolto server
app.listen(3000, () => {
    console.log('Server in ascolto sulla porta 3000...');
});