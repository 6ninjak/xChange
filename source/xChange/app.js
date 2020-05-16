const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const nano = require('nano')('http://admin:admin@localhost:5984');
const fs = require('fs');

const db = nano.db.use('xchange');


//funzioni helper per couchdb
function updateDoc(id, info) {
    db.get(id).then((res) => {
        db.insert(Object.assign({ _id: id, _rev: res._rev }, info)).then((body) => {
            console.log(body);
        });
    });
}

function updateAttachToDoc(id, path, fileName, contentType) {
    fs.readFile(path, (err, data) => {
        if (!err) {
            const res = db.get(id);
            db.attachment.insert(id, fileName, data, contentType, { rev: res._rev }).then((body) => {
                console.log(body);
            });
        }
    });
}
//esempi d'uso
// updateDoc('test', {test: "quadrato"});
// updateAttachToDoc('test', 'views/home.html', 'home.html', 'text/html');

// creazione server
const app = express();

// imposta html come default per i file nelle views
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// middleware di body parser per riconoscere diversi tipi di url
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// riconoscce il percorso public
app.use(express.static(path.join(__dirname, 'public')));

// log automatico delle richieste al server
app.use((req, res, next) => {
    console.log(req.method + ": " + req.path);
    next();
});

// percorso di test per accesso a db
app.get('/test', (req, res) => {
    // db.insert({ tipo: 'user', username: 'alfredo', email: 'alfredo@pippo.com', password: 'inutile' }, 'alfredo@pippo.com');
    // db.insert({ tipo: 'user', username: 'piero', email: 'pierpaolo@gugol.com', password: 'difficile' }, 'pierpaolo@gugol.com');
    // db.insert({ tipo: 'user', username: 'alfredo', email: 'alfredo5@pippo.com', password: 'domani' }, 'alfredo5@pippo.com');
    // db.insert({ tipo: 'scambio', _id: '12345a9876', user1: 'alfredo@pippo.com', user2: 'pierpaolo@gugol.com', oggetto1: 'ak47', oggetto2: 'un bottone' });
    db.find({ 
        selector: {
            user1: 'alfredo@pippo.com'
        },
        fields: [ '_id' ]
    }).then( (docs) => {
        res.send(docs);
    })
})

// get su / mostra home.html
app.get('/', (req, res) => {
    res.render('home', {
        title: 'xChange - home'
    });
});

// get su /Faq mostra Faq.html
app.get('/Faq', (req, res) => {
    res.render('Faq', {
        title: 'xChange - Faq'
    });
})

// get su /login mostra login.html
app.get('/login', (req, res) => {
    res.render('login', {
        title: 'xChange - login'
    });
});

// i percorsi da seguire facendo richieste su /users si trovano in routes/users
const users = require('./routes/users');
app.use('/users', users);


// ascolto server
app.listen(3000, () => {
    console.log('Server in ascolto sulla porta 3000...');
});