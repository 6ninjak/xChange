const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
var dbHelper = require('./helper/dbHelper.js');
const upload = require('./helper/imageHelper.js');

let db;

function errHandler(err, res) {
    if (err) console.log(err);
    console.log(res);
}

// json di errore deve essere del tipo {error: "descrizione errore"}
// nessun altro json restituito deve avere un campo "error"

// creazione server
const app = express();
app.use(cookieParser());


// middleware di body parser per riconoscere diversi tipi di url
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



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

// impedisce che vengano hittati percorsi non accessibili ai non utenti
app.use((req, res, next) => {
    if (req.cookies.cookieUtente == undefined && !(['/login', '/users'].includes(req.path) && req.method == 'POST')){
        res.json({error: "login richiesto"});
    }
    else if (req.cookies.cookieUtente != undefined) {
        db.get(req.cookies.cookieUtente.id, (err, response) => {
            if (!err && req.cookies.cookieUtente.password == response.password) {
                // per non dover modificare le get di login e registrazione e verificare se è già loggato
                if (["/login", '/users'].includes(req.path) && req.method == 'POST') {
                    res.json({error: "login già effettuato"});
                }
                else next();
            }
            else {
                //entrando qui abbiamo rilevato dei cookie sbagliati e perciò lo indirizziamo a login ma svuotando i cookie, così da non entrare dentro un loop
                res.clearCookie('cookieUtente');
                res.json({error: "cookie sbagliati"});
            }
        });
    }
    else {
        next();
    }
});
// solo per debug
app.get('/test', (req, res) => {
    // db.addAttachment('6ninjak', './public/images/sarto.jpg', 'immagine_profilo', 'image/jpeg', errHandler);
    res.send('test');
})

// get su /file
// richiede parametri di query "docName" e "attName"
// restituisce l'attachment attName del documento docName nel db
// in caso di errore restituisce un json di errore
app.get('/file', (req, res) => {
    db.attachment.get(req.query.docName, req.query.attName, (err, body) => {
        if (err) res.json({error: err});
        else res.end(body);
    });
});

// post su /login
// richiede parametri in input "username" e "password"
// effettua il login dell'utente
// in caso di errore restituisce un json di errore
app.post('/login', (req, res) => {
    db.get(req.body.username, (err, response) => {
        console.log(err);
        console.log(response);
        if (err && err.error == 'not_found') {
            res.json({error: 'utente inesistente'});
        } else if (err) {
            res.json({error: err});
        } else {
            let encPwd = crypto.createHash('md5').update(req.body.password).digest('hex'); // Codifichiamo la password in MD5
            if (encPwd == response.password) {
                res.cookie("cookieUtente", utente = {
                    id: response._id,
                    password: response.password,
                    username: response.username
                });
                res.json({success: "utente loggato correttamente"});
            }
            else {
                res.json({error: "password errata"});
            }
        }
    });
});

// get (meglio post?) su /logout
// effettua il logout dell'user attuale
app.get('/logout', (req, res) => {
    res.clearCookie("cookieUtente");     
    res.json({success: "logout effettuato correttamente"});
});

// post (meglio get?) su /migliori
// restituisce i 5 utenti meglio recensiti
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

// post su /ricerca
// richiede parametro di query "input"
// viene effettuata una ricerca sul db basandosi sui parametri passati
// la ricerca avviene per nome, cognome, username, competenza
// i risultati vengono ordinati per qualità
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

/* -------------in allestimento--------------- */
// get su /Faq mostra Faq.html 
// app.get('/Faq', (req, res) => {
//     res.render('Faq', {
//         title: 'xChange - Faq'
//     });
// })

// URL non valido, reindirizza a pagina d'errore
app.get('*', (req, res) => {
    res.status(404).json({error: "Page Not Found"});
})


// ascolto server
app.listen(3001, () => {
    console.log('Server in ascolto sulla porta 3001...');
});

