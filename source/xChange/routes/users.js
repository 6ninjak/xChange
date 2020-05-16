const express = require('express');
const router = express.Router();

// percorso di prova /users
router.get('/', (req, res) => {
    res.send('percorso standard...');
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

