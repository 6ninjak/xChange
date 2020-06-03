const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
var dbHelper = require('./public/helper/dbHelper.js');
const upload = require('./public/helper/imageHelper.js');

let db;

function errHandler(err, res) {
    if (err) console.log(err);
    console.log(res);
}

// creazione server
const app = express();
app.use(cookieParser());

// imposta html come default per i file nelle views
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// middleware di body parser per riconoscere diversi tipi di url
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// riconoscce il percorso public
app.use(express.static(path.join(__dirname, 'public')));


// log automatico delle richieste al server
app.use((req, res, next) => {
    dbHelper().then(res => {
        db = res;
        next();
    });
})

app.use((req, res, next) => {
    console.log(req.method + ": " + req.path);
    next();
});

app.use((req, res, next) => {
    if (req.cookies.cookieUtente == undefined &&
        (!(["/login", "/registrazione", "/"].includes(req.path)
            || (req.path == '/users' && req.method == 'POST')
        ))
    ) {
        res.redirect('/login');
    }
    else if (req.cookies.cookieUtente != undefined) {
        db.get(req.cookies.cookieUtente.id, (err, response) => {
            if (!err && req.cookies.cookieUtente.password == response.password) {
                // per non dover modificare le get di login e registrazione e verificare se è già loggato
                if (["/login", "/registrazione", "/"].includes(req.path)) {
                    res.redirect('/home');
                }
                else next();
            }
            else {
                //entrando qui abbiamo rilevato dei cookie sbagliati e perciò lo indirizziamo a login ma svuotando i cookie, così da non entrare dentro un loop
                res.clearCookie('cookieUtente');
                res.redirect('/login');
            }
        });
    }
    else {
        next();
    }
});

app.get('/test', (req, res) => {
    db.addAttachment('6ninjak', './public/images/sarto.jpg', 'immagine_profilo', 'image/jpeg', errHandler);
    res.send('ok');
})

app.get('/file', (req, res) => {
    db.attachment.get(req.query.docName, req.query.attName, (err, body) => {
        res.end(body);
    });
});

// get su / mostra home.html
app.get('/', (req, res) => {
    res.render('homepage');
});

// get su /login mostra login.html
app.get('/login', (req, res) => {
    res.render('login', {
        title: 'xChange - login',
        error: '',
        pass: ''
    });
});

app.post('/login', (req, res) => {
    db.get(req.body.username, (err, response) => {
        console.log(err);
        console.log(response);
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
            if (encPwd == response.password) {
                res.cookie("cookieUtente", utente = {
                    id: response._id,
                    password: response.password,
                    username: response.username
                });
                res.redirect('/home');
            }
            else {
                res.render('login', {
                    title: 'xChange - login',
                    error: '',
                    pass: 'errata'
                });
            }
        }
    });
});

app.get('/logout', (req, res) => {
    if (req.cookies.cookieUtente != undefined) {
        res.clearCookie("cookieUtente");
        res.redirect('/');
    }
    else {
        res.redirect('/');
    }
});

// get su /registrazione mostra registrazione.html
app.get('/registrazione', (req, res) => {
    res.render('registrazione', {
        title: 'xChange - registrazione',
        error: ''
    });
});

app.get('/home', (req, res) => {
    // console.log(req.cookies.cookieProva);

    res.render('home', {
        title: 'xChange - Home',
        utente: req.cookies.cookieUtente
    });
});

app.post('/migliori', (req, res) => {
    var q = {
        selector: {
            tipo: 'user',
            media: { $gte: 4 }
        },
        sort: [{ media: "desc" }, { recensioni: "desc" }],
        fields: ["username", "nome", "media", "competenze"],
        limit: 5
    };
    db.find(q, (err, body) => {
        if (!err) res.json(body);
        console.log(body);
    });
});

app.get('/ricerca', (req, res) => {
    res.render('ricerca', {
        utente: req.cookies.cookieUtente
    });
});

app.post('/ricerca', (req, res) => {
    var q = {
        selector: {
            tipo: "user",
            $or: []
        },
        sort: [{ media: "desc" }, { recensioni: "desc" }],
        fields: ["username", "nome", "media", "competenze"],
        limit: 10
    };
    if (req.query.input) {
        var query = req.query.input.split(" ");
        for (let i = 0; i < query.length; i++) {

            q.selector.$or.push(
                { username: { $regex: "(?i)" + query[i] } },
                { nome: { $regex: "(?i)" + query[i] } },
                { cognome: { $regex: "(?i)" + query[i] } },
                { competenze: { $elemMatch: { $regex: "(?i)" + query[i] } } }
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



// i percorsi da seguire facendo richieste su /users si trovano in routes/users
const users = require('./routes/users');
app.use('/users', users);

// get su /Faq mostra Faq.html
app.get('/Faq', (req, res) => {
    res.render('Faq', {
        title: 'xChange - Faq'
    });
})

// URL non valido, reindirizza a pagina d'errore
app.get('*', (req, res) => {
    res.status(404).render('404NotFound');
})


// ascolto server
app.listen(3000, () => {
    console.log('Server in ascolto sulla porta 3000...');
});

