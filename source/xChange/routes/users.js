const express = require('express');
const router = express.Router();
const nano = require('nano')('http://admin:admin@localhost:5984');
const db = nano.db.use('xchange');
const crypto = require('crypto');



// percorso di prova /users
router.get('/', (req, res) => {
    res.send('percorso standard...');
});

router.post('/', (req, res) => {
    var body = req.body;
    let encPwd = crypto.createHash('md5').update(body.password).digest('hex'); // Codifichiamo la password in MD5
    db.insert({
        tipo: 'user',
        
        nome: body.nome,
        cognome: body.cognome,
        email: body.email,
        password: encPwd
        
    }, body.email, (err, response) => {
        if (err && err.error == 'conflict') {
            res.render('registrazione', {
                title: 'xChange - registrazione',
                error: 'esiste già un utente con questa email'
            });
        } else if (err) {
            res.render('registrazione', {
                title: 'xChange - registrazione',
                error: err
            });
        } else {
            console.log(response);
            res.redirect('/login');
        }
    });
});

// get su /users/:id conduce a profilo.html di :id
router.get('/:id', (req, res) => {
    // db.get(req.params.id + "@gmail.com", (err, doc) => {
    //     console.log(err);
    //     console.log(doc);
    //     if (!err) res.render('profilo', {
    //         utente: doc.nome
    //     });
    //     else res.render('profilo_esterno');
    // });
    res.render('profilo_esterno', {
        utente: ''
    });
});

// get su /users/:id/edit conduce a edit_dati.html di :id
router.get('/:id/edit', (req, res) => {
    res.render('edit_dati');
});

// post su users/:id aggiorna i dati da db e reindirizza a /users/:id
router.post('/:id', (req, res) => {
    console.log(req.body);
    res.redirect('.');
});

module.exports = router;

