const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const nano = require('nano')('http://admin:admin@localhost:5984');
const fs = require('fs');
const db = nano.db.use('xchange');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');


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
app.use(cookieParser());

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


//giacomino controlla se è giusto
app.use((req, res, next) => {
    
    if (req.cookies.cookieUtente == undefined && (!(["/login", "/registrazione", "/"].includes(req.path) || (req.path == '/users' && req.method == 'POST')))){
        
        res.redirect('/login');
    }
    else if(req.cookies.cookieUtente != undefined){
        db.get(req.cookies.cookieUtente.id, (err, response) => {
            if (!err && req.cookies.cookieUtente.password == response.password){
                // per non dover modificare le get di login e registrazione e verificare se è già loggato
                if(["/login", "/registrazione", "/"].includes(req.path)){
                    res.redirect('/home');
                }
                else{
                    next();
                }
            }
            else{
                //entrando qui abbiamo rilevato dei cookie sbagliati e perciò lo indirizziamo a login ma svuotando i cookie, così da non entrare dentro un loop
                res.clearCookie('cookieUtente');
                res.redirect('/login');
            }
        });
    }
    else{
        next();
    }
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
    // console.log(req.cookies.cookieProva);
    
    res.render('home', {
        title: 'xChange - Home',
        utente: req.cookies.cookieUtente.nome
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
        title: 'xChange - login',
        error: '',
        pass: ''
    });
});

app.get('/logout', (req, res) => {
    if(req.cookies.cookieUtente != undefined){
        res.clearCookie("cookieUtente");
        res.redirect('/');
    }
    else{
        res.redirect('/');
    }
});

app.post('/login', (req, res) => {
    
    db.get(req.body.email, (err, response) => {
        if (err && err.error == 'not_found') {
            res.render('login', {
                title: 'xChange - login',
                error: 'Utente inesistente',
                pass: ''
            });
        } else if (err) {
            res.render('login', {
                title: 'xChange - login',
                error: err,
                pass: ''
            });
        } else {
            let encPwd = crypto.createHash('md5').update(req.body.password).digest('hex'); // Codifichiamo la password in MD5
            if(encPwd == response.password){
                res.cookie("cookieUtente", utente = {
                    id: response._id,
                    password: response.password,
                    nome: response.nome
                });
                res.redirect('/home');
            }
            else{
                res.render('login', {
                    title: 'xChange - login',
                    error: '',
                    pass: 'errata'
                });
            }
            
        }
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