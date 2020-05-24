const express = require('express');
const router = express.Router();
const nano = require('nano')('http://admin:admin@localhost:5984');
const db = nano.db.use('xchange');

// percorso di prova /users
router.get('/', (req, res) => {
    res.send('percorso standard...');
});

router.post('/', (req, res) => {
    var body = req.body;
    db.insert({
        tipo: 'user',
        
        nome: body.nome,
        cognome: body.cognome,
        email: body.email,
        pasword: body.password
        
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

router.post('/login', (req, res) => {
    var bodyreq = req.body;
    
    // db.get(bodyreq.email).then((body) => {
    //     console.log(body.dati.email);
    // });
    db.list({include_docs: true }).then((body) => {
        
        body.rows.forEach((doc) => {
          console.log(doc);
        });
    });
    
    res.redirect('../home');
});

// get su /users/:id conduce a profilo.html di :id
router.get('/:id', (req, res) => {
    res.render('profilo');
});

// get su /users/:id/edit_dati conduce a edit_dati.html di :id
router.get('/:id/edit_dati', (req, res) => {
    res.render('edit_dati');
});

// post su users/:id aggiorna i dati da db e reindirizza a /users/:id
router.post('/:id', (req, res) => {
    console.log(req.body);
    res.redirect('.');
});

module.exports = router;

