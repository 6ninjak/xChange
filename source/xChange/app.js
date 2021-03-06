const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const upload = require('./public/helper/imageHelper.js');
const axios = require('axios').default;

axios.defaults.baseURL = 'http://localhost:3001';
axios.defaults.maxRedirects = 5;

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
    console.log(req.method + ": " + req.path);
    next();
});

app.get('/test', (req, res) => {
    res.send('ok');
})

// controllo percorsi e sicurezza
app.use((req, res, next) => {
    const percorsiLogin = ["/login", "/registrazione", "/", "/auth/google", "/login/callback", "/registrazione/callback"];

    if (req.cookies.JWT_token == undefined && (!(
        percorsiLogin.includes(req.path) || (req.path == '/users' && req.method == 'POST') || 
        (req.path.split('/')[1] == 'addusername' && req.path.split('/').length == 3)
        ))) {
        res.redirect('/login');
    } else if (req.cookies.JWT_token != undefined) {
        var objHeader = {
            headers: { Authorization: 'Bearer ' + req.cookies.JWT_token.token }
        };
        // controlla validità dei cookie
        axios.post('/authenticate', null, objHeader).then(response => {
            console.log(response.data);
            if (percorsiLogin.includes(req.path) || (req.path == '/users' && req.method == 'POST')) {
                res.redirect('/home');
            }
            else {
                req.objHeader = objHeader;
                next();
            }
        }).catch(error => {
            // entrando qui abbiamo rilevato dei cookie sbagliati e perciò lo indirizziamo a login ma svuotando i cookie, così da non entrare dentro un loop
            res.clearCookie('JWT_token');
            res.redirect('/login');
        })
    }
    else {
        next();
    }
});

// get su / mostra homepage.html
app.get('/', (req, res) => {
    res.render('homepage');
});

// get su /registrazione mostra registrazione.html
app.get('/registrazione', (req, res) => {
    res.render('registrazione', {
        title: 'xChange - registrazione',
        error: ''
    });
});

app.get('/registrazione/callback', (req, res) => {
    res.redirect(req.url.replace('registrazione', 'login'));
});

app.get('/auth/google', (req, res) => {
    res.redirect('http://localhost:3001/auth/google');
});

app.post('/addusername/:googleId', (req, res) => {
    axios.post('/addusername/' + req.params.googleId, req.body)
        .then(response => {
            console.log(response.data)
            // cookie per l'autorizzazione delle api
            res.cookie("JWT_token", token = {
                token: response.data.token
            });
            res.cookie("cookieUtente", utente = {
                username: response.data.username
            });
            res.redirect('/home');
        }).catch(error => {
            res.render('addUsername', {
                error: error.response.data.error,
                googleId: req.params.googleId
            });
        })
})

// get su /login mostra login.html
app.get('/login', (req, res) => {
    res.render('login', {
        title: 'xChange - login',
        error: '',
        pass: ''
    });
});

app.post('/login', (req, res) => {
    axios.post('/login', req.body).
        then(response => {
            console.log(response.data)
            // cookie per l'autorizzazione delle api
            res.cookie("JWT_token", token = {
                token: response.data.token
            });
            res.cookie("cookieUtente", utente = {
                username: response.data.username
            });
            res.redirect('/home');
        }).catch(error => {
            res.render('login', {
                error: error.response.data.error
            });
        })
});

app.get('/login/callback', (req, res) => {
    if (req.query.token && req.query.username) {
        res.cookie("JWT_token", token = {
            token: req.query.token
        });
        res.cookie("cookieUtente", utente = {
            username: req.query.username
        });
        res.redirect('/home');
    } else if (req.query.googleId) {
        res.render('addUsername', {
            googleId: req.query.googleId,
            error: ''
        });
    } else redirect('/login');
});


app.get('/file', (req, res) => {
    axios.get('/file/', {
        headers: req.objHeader.headers,
        params: {
            docName: req.query.docName,
            attName: req.query.attName
        },
        responseType: 'stream'
    }).then(response => {
        response.data.pipe(res);
    }).catch(error => {
        console.log(error.data);
    })
});

app.get('/logout', (req, res) => {
    if (req.cookies.cookieUtente != undefined)
        res.clearCookie("cookieUtente");
    if (req.cookies.JWT_token != undefined)
        res.clearCookie("JWT_token");
    res.redirect('/');
});



app.get('/home', (req, res) => {
    // console.log(req.cookies.cookieProva);

    res.render('home', {
        title: 'xChange - Home',
        utente: req.cookies.cookieUtente
    });
});

app.post('/migliori', (req, res) => {
    axios.post('/migliori', null, req.objHeader).
        then(response => {
            res.json(response.data);
        }).catch(error => {
            console.log(error.data);
        })
});

app.get('/ricerca', (req, res) => {
    res.render('ricerca', {
        utente: req.cookies.cookieUtente
    });
});

app.post('/ricerca', (req, res) => {
    axios.post('/ricerca', null, {
        headers: req.objHeader.headers,
        params: {
            input: req.query.input
        }
    }).then(response => {
        res.json(response.data);
    }).catch(error => {
        console.log(error.data)
    });
})



// i percorsi da seguire facendo richieste su /users si trovano in routes/users
const users = require('./routes/users');
const { Stream } = require('stream');
const { url } = require('inspector');
const { parse } = require('path');
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

