const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const nano = require('nano')('http://admin:admin@localhost:5984');
const fs = require('fs');

const db = nano.db.use('xchange');


function errHandler(err, res) {
    if (err) console.log(err);
    console.log(res);
}

//funzioni helper per couchdb
db.insertOrUpdate = (docData, docId, callback) => {
    db.get(docId, (err, res) => {
        if (!err) docData._rev = res._rev;
        db.insert(docData, docId, callback);
    });
}

db.addAttachment = (docId, filePath, fileName, contentType, callback) => {
    fs.readFile(filePath, (err, data) => {
        if (!err) {
            db.get(docId, (error, res) => {
                if (!error) db.attachment.insert(docId, fileName, data, contentType, res._rev, callback);
            })
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
    db.insertOrUpdate({ tipo: 'user', username: 'alfredo', email: 'alfredo@pippo.com', password: 'inutile' }, 'alfredo@pippo.com', errHandler);
    db.insertOrUpdate({ tipo: 'user', username: 'piero', email: 'pierpaolo@gugol.com', password: 'difficile' }, 'pierpaolo@gugol.com', errHandler);
    db.insertOrUpdate({ tipo: 'user', username: 'alfredo', email: 'alfredo4@pippo.com', password: 'domani' }, 'alfredo4@pippo.com', errHandler);
    db.insertOrUpdate({ tipo: 'scambio', user1: 'alfredo@pippo.com', user2: 'pierpaolo@gugol.com', oggetto1: 'ak47', oggetto2: 'un bottone' }, '12345a9876', errHandler);
    db.list((err, body) => {
        if (!err) {
            res.send(body.rows);
        }
    });
})




// get su / mostra home.html
app.get('/', (req, res) => {
    res.render('homepage', {
        title: 'xChange'
    });
});

app.get('/home', (req, res) => {
    res.render('home', {
        title: 'xChange - Home'
    });
});

// get su /login mostra login.html
app.get('/login', (req, res) => {
    res.render('login', {
        title: 'xChange - login'
    });
});

// get su /registrazione mostra registrazione.html
app.get('/registrazione', (req, res) => {
    res.render('registrazione', {
        title: 'xChange - registrazione',
        error: ''
    });
});


// i percorsi da seguire facendo richieste su /users si trovano in routes/users
const users = require('./routes/users');
app.use('/users', users);

app.get('/ricerca', (req, res) => {
    res.render('ricerca', {
        title: 'edit_dati'
    });
});

/*
app.get('/search', (req, res) => {
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
        }
    }
]);
});
*/
//giusto
///////////////////////////////////////////////////////////////

app.post('/ricerca', (req, res) => {
    const q ={
        selector:{
            nome: req.body.sercio
        },
        fields: ["nome","cognome","email"]
    }
    console.log(req.body);
    db.find(q).then((body) => {
        res.json(body.docs);
        console.log(body.docs);
      })
    });

///////////////////////////////////////////////////////////////////

app.get('/profilo_esterno', (req, res) => {
    res.render('profilo_esterno',{
        title: 'xChange - profilo_esterno'
    });
})

app.post('/profilo_esterno', (req, res) => {
    res.json(
        {"email":"afsdfsò@sffs.it",
        
        
        "recensioni":[{   
            "sintesi": "soddisfacente",
            "recensione":"mmmmm....bho non lo so non mi convince"},
        {   
            "sintesi": "malino",
            "recensione":"no grattelli troppo forte fratelli"},
        {   
            "sintesi": "ottimo direi",
            "recensione":"no fratelli chi si è salvato sto sito è diventato migliardario fratelli"
        }]
        });
    console.log(res);
   })


// get su /Faq mostra Faq.html
app.get('/Faq', (req, res) => {
    res.render('Faq', {
        title: 'xChange - Faq'
    });
})


// ascolto server
app.listen(3000, () => {
    console.log('Server in ascolto sulla porta 3000...');
});