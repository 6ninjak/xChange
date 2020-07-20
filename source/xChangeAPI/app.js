const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
var dbHelper = require('./helper/dbHelper.js');
const upload = require('./helper/imageHelper.js');
const fs = require('fs');
const jwt = require('jsonwebtoken');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2').Strategy;


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



function ensureToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        var userId;
        if (userId = jwt.verify(bearerToken, 'secret_key')) {
            req.userId = userId;
            req.token = bearerToken;
            console.log('authorized!');
            next();
        } else res.status(403).json({ error: "non sei autorizzato" });
    } else {
        res.status(403).json({ error: "non sei autorizzato" });
    }
}

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

// log automatico delle richieste al server
app.use((req, res, next) => {
    dbHelper().then(res => {
        db = res;
        next();
    });
})
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

passport.use(new GoogleStrategy({
    clientID: '1011578368251-ulleto7urkdglnanmainbemc5hihcgl5.apps.googleusercontent.com',
    clientSecret: 'HhWpePp9aHEGcrvG131AIPPl',
    callbackURL: "http://localhost:3001/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    var q = {
        selector: {
            $or: [{ tipo: 'user' }, { tipo: 'pre-user' }],
            email: profile.email
        }
    };
    db.find(q, (err, response) => {
        if (!err && response.docs.length == 0) {
            var documento = {
                tipo: 'pre-user',

                nome: profile.given_name,
                cognome: profile.family_name,
                email: profile.email,
                googleId: profile.sub
            };
            db.insert(documento, profile.id, (err, response) => {
                if (err) {
                    res.status(500).json({ error: err });
                } else {
                    console.log(response);
                    done(null, documento);
                }
            });
        } else if (response.docs[0].tipo == 'user') {
            const user = {
                id: response.docs[0].username
            }
            const token = jwt.sign({ user }, 'secret_key');
            done(null, { token: token, username: response.docs[0].username });
        } else {
            done(null, response.docs[0]);
        }
    });
}));

app.use((req, res, next) => {
    console.log(req.method + ": " + req.path);
    next();
});

app.post('/authenticate', ensureToken, (req, res) => {
    res.json({ success: "tutto OK" });
})

app.post('/addusername/:googleId', (req, res) => {
    var q = {
        selector: {
            tipo: 'pre-user',
            googleId: req.params.googleId
        }
    };
    db.find(q, (err, response) => {
        if (!err && response.docs.length == 0) {
            res.redirect('/invalid');
        } else if (response.docs.length == 1) {
            doc = response.docs[0];
            var documento = {
                tipo: 'user',

                username: req.body.username,
                nome: doc.nome,
                cognome: doc.cognome,
                email: doc.email,
                posizione: '',
                competenze: [],
                punti: 0,
                media: 0,
                recensioni: 0

            };
            db.insert(documento, req.body.username, (err, response) => {
                if (err && err.error == 'conflict') {
                    res.status(409).json({ error: 'esiste già un utente con questo username' });
                } else if (err) {
                    res.status(500).json({ error: err });
                } else {
                    fs.readFile('public/images/profilo.png', (err, data) => {
                        if (!err) {
                            db.attachment.insert(response.id, 'immagine_profilo', data, 'image/png', { rev: response.rev }, (error, r) => {
                                console.log(error || r);
                            });
                        }
                        else console.log(err);
                    });
                    console.log(response);
                    db.destroy(doc.googleId, doc._rev, (err, delRes) => {
                        if (!err) {
                            console.log(delRes);
                            const user = {
                                id: response.id
                            }
                            const token = jwt.sign({ user }, 'secret_key');
                            res.json({
                                documento: documento,
                                token: token,
                                username: response.id
                            });
                        } else console.log(err);
                    })
                }
            });
        } else {
            res.status(500).json({ error: err });
        }
    })
})
// solo per debug
app.get('/test', (req, res) => {
    // db.addAttachment('6ninjak', './public/images/sarto.jpg', 'immagine_profilo', 'image/jpeg', errHandler);
    res.send('test');
})

// impedisce che vengano hittati percorsi non accessibili ai non utenti
app.use((req, res, next) => {
    if (!((['/login', '/users'].includes(req.path) && req.method == 'POST') || ['/auth/google', '/auth/google/callback'].includes(req.path))) {
        ensureToken(req, res, next);
    }
    else {
        next();
    }
});

// get su /file
// richiede parametri di query "docName" e "attName"
// restituisce l'attachment attName del documento docName nel db
// in caso di errore restituisce un json di errore
app.get('/file', (req, res) => {
    db.attachment.get(req.query.docName, req.query.attName, (err, body) => {
        if (err) res.json({ error: err });
        else db.attachment.getAsStream(req.query.docName, req.query.attName).pipe(res);
    })
});

var redirect = '';

app.get('/auth/google',
    (req, res, next) => {
        redirect = '';
        if (req.headers.referer) redirect = req.headers.referer + '/callback';
        if (redirect == 'localhost:3001/auth/google/callback') redirect = '';
        console.log(redirect);
        next();
    },
    passport.authenticate('google', { scope: ['openid', 'profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // console.log(req);
        var user = req.user;
        if (user.token != null) {
            if (redirect != '')
                res.redirect(redirect + '?token=' + user.token + '&username=' + user.username);
            else
                res.json({
                    token: user.token,
                    username: user.username
                })
        } else {
            if (redirect != '')
                res.redirect(redirect + '?googleId=' + user.googleId);
            else
                res.json({
                    googleId: user.googleId
                })
        }
    }
);


// post su /login
// richiede parametri in input "username" e "password"
// effettua il login dell'utente
// in caso di errore restituisce un json di errore
app.post('/login', (req, res) => {
    db.get(req.body.username, (err, response) => {
        if (err && err.error == 'not_found') {
            res.status(404).json({ error: 'utente inesistente' });
        } else if (err) {
            res.status(404).json({ error: err });
        } else {
            let encPwd = crypto.createHash('md5').update(req.body.password).digest('hex'); // Codifichiamo la password in MD5
            if (encPwd == response.password) {
                //autentica user e restituisce il token
                const user = {
                    id: response.username
                }
                const token = jwt.sign({ user }, 'secret_key');
                res.json({
                    token: token,
                    username: response.username
                });
            }
            else {
                res.status(400).json({ error: "password errata" });
            }
        }
    });
});

// non ha senso il logout in un servizio di API, visto che il token va mandato ad ogni richiesta
// get (meglio post?) su /logout
// effettua il logout dell'user attuale
// app.get('/logout', (req, res) => {
//     res.clearCookie("cookieUtente");     
//     res.json({success: "logout effettuato correttamente"});
// });

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
        else res.status(500).json({ error: 'qualcosa è andato storto' });
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

// URL non valido, invia errore con stato 404
app.get('*', (req, res) => {
    res.status(404).json({ error: "Page Not Found" });
})


// ascolto server
app.listen(3001, () => {
    console.log('Server in ascolto sulla porta 3001...');
});