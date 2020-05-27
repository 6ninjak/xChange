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
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// riconoscce il percorso public
app.use(express.static(path.join(__dirname, 'public')));

// log automatico delle richieste al server
app.use((req, res, next) => {
    console.log(req.method + ": " + req.path);
    next();
});

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

app.get('/ricerca', (req, res) => {
    res.render('ricerca');
});

app.post('/ricerca', (req, res) => {
    var q = {
        selector: {
            tipo: "user",
            $or: []
        },
        fields: ["nome", "cognome", "email"],
        limit: 10
    };
    if (req.query.input) {
        var query = req.query.input.split(" ");
        for (let i = 0; i < query.length; i++) {
        
            q.selector.$or.push(
                { nome: { $regex: "(?i)" + query[i] } },
                { cognome: { $regex: "(?i)" + query[i] } }
            );
        }
    }
    // console.log(q);
    // console.log(query);
    db.find(q, (err, body) => {
        if (!err) res.json(body);
        console.log(body);
    });
})

// get su /login mostra login.html
app.get('/login', (req, res) => {
    res.render('login', {
        title: 'xChange - login'
    });
});

app.post('/login', (req, res) => {
    res.redirect('/home');
})

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

//questo va spostato su users/:id
app.get('/profilo_esterno', (req, res) => {
    res.render('profilo_esterno',{
        title: 'xChange - profilo_esterno'
    });
})

// invio recensioni
app.post('/profilo_esterno', (req, res) => {
    res.json(
      [{"username":"maramuuuu",
        "recensore":"francomat",
        "recensito":"maramuuu",
        "tipo":"recensione",
        "sintesi":"molto buono",
        "recensione":"fratm ingiustament recensito"
        },
        {"username":"maramuuuu",
        "recensore":"pizzaman",
        "recensito":"maramuuu",
        "tipo":"recensione",
        "sintesi":"una merda",
        "recensione":"fratm ingiustament recensito"
        }
    ]);
    console.log(res);
   })

// get su /Faq mostra Faq.html
app.get('/Faq', (req, res) => {
    res.render('Faq', {
        title: 'xChange - Faq'
    });
})
//modificato da lorenzo------------------------------------------------------------------------
app.get('/profilo', (req, res) => {
    res.render('profilo', {
        title: 'xChange - Faq'
    });
})
//do alla paggina profilo tutte le richieste per scambi di lavori
app.post('/profilo', (req, res) => {
    res.json(
        [{"utente_richiedente":"francofort",
          "utente_ricevente":"lorenzo",
          "richiesta":"",
          "offerta":"",
          "accettato":""
        },
        {"utente_richiedente":"maramuuuu",
        "utente_ricevente":"lorenzo",
        "accettato":""
        },
        {"utente_richiedente":"pastafrolla",
        "utente_ricevente":"lorenzo",
        "accettato":""
        }
    ])
        console.log(res);
});
// do alla paggina profilo tutti i dati relativi alla persona 
app.post('/profilo1', (req, res) => {
    res.json([{
        "nome": "lorenzo",
        "cognome": "catini",
        "email": "ahdfas@sfbfk.it",
        "professione": "informatico",
        "competenze": "cassamortaro",
        "username":"maramuuuu",
        "ricerca": [{"ric":"cuoco"},
                    {"ric":"idraulico"}],
        "punti": 25,
        "recensioni": 7,
        "descrizione": "sjabvbfvbfjsbkdvbsidfbbvebdbsjkdhskhlaiskfahskdfjhaslkvbeibviaebvraevbraiebvsubva"
    }]);
});
//do alla paggina profilo le recensioni dell'utente
app.post('/profilo2', (req, res) => {
    res.json([
        {"username":"maramuuuu",
        "recensore":"francomat",
        "recensito":"maramuuu",
        "tipo":"recensione",
        "sintesi":"molto buono",
        "recensione":"fratm ingiustament recensito"
        },
        {"username":"maramuuuu",
        "recensore":"pizzaman",
        "recensito":"maramuuu",
        "tipo":"recensione",
        "sintesi":"una merda",
        "recensione":"fratm ingiustament recensito"
        }
        
    ]);
});


//------------------------------------------------------------------------------------------------------------------------

// ascolto server
app.listen(3000, () => {
    console.log('Server in ascolto sulla porta 3000...');
});