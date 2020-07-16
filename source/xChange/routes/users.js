const express = require('express');
const router = express.Router();
const upload = require('../public/helper/imageHelper.js');
const fs = require('fs');
const axios = require('axios').default;
const FormData = require('form-data');

axios.defaults.baseURL = 'http://localhost:3001';

router.post('/', (req, res) => {
    axios.post('/users', req.body, req.objHeader).
        then(response => {
            console.log(response.data);
            res.redirect('/login');
        }).catch(error => {
            errMess = error.response.data.error;
            console.log(error.response.data);
            res.render('registrazione', {
                error: errMess
            });
        })
});

// get su /users/:id conduce a profilo.html di :id
router.get('/:id', (req, res, next) => {
    axios.get('/users/'+req.params.id+'/dati', req.objHeader).
        then(response => {
            var doc = response.data;
            console.log(doc);
            if (doc.me) {
                res.render('profilo', {
                    utente: doc
                })
            } else {
                res.render('profilo_esterno', {
                    utente: req.cookies.cookieUtente,
                    media: doc.media,
                    username: doc.username
                })
            }
        }).catch(error => {
            next();
        })
});

router.get('/:id/dati', (req, res, next) => {
    // console.log(req.cookies.cookieUtente)
    axios.get('/users/'+req.params.id+'/dati', req.objHeader).
        then(response => {
            res.json(response.data);
        }).catch(error => {
            next();
        })
});
router.get('/:id/notifiche', (req, res, next) => {
    axios.get('/users/'+req.params.id+'/notifiche', req.objHeader).
    then(response => {
        res.json(response.data);
    }).catch(error => {
        next();
    })
});

// get su /users/:id/edit conduce a edit_dati.html di :id
router.get('/:id/edit', (req, res, next) => {
    axios.get('/users/'+req.params.id+'/dati', req.objHeader).
        then(response => {
            if (response.data.me) {
                res.render('edit_dati', {
                    utente: response.data
                });
            } else {
                res.send('Non puoi accedere a questa pagina, non fare il furbo!');
            }
        }).catch(error => {
            next();
        })
});

// put su users/:id aggiorna i dati da db e reindirizza a /users/:id
router.post('/:id', (req, res) => {
    axios.post('/users/'+req.params.id, req.body, req.objHeader).
        then(response => {
            res.render('profilo', {
                utente: response.data.doc
            })
        }).catch(error => {
            if (error.response.status == 404) res.redirect('/invalid');
            else res.send(error.response.data.error);
        })
});

// questa post serve ad aggiornare l'immagine profilo dell'utente id
// un utente può aggiornare solo la propria pagina profilo
router.post('/:id/image', upload.single('file'), (req, res) => {
    const form_data = new FormData();
    form_data.append('file', fs.createReadStream(req.file.path));
    axios.post('/users/'+req.params.id+'/image', form_data, 
        {
            headers: {
                "Authorization": req.objHeader.headers.Authorization,
                ...form_data.getHeaders()
            }
        }).
        then(response => {
            res.redirect('/users/' + req.params.id)
        }).catch(error => {
            if (!error.response) res.redirect('/invalid');
            else if (error.response.status == 404) res.redirect('/invalid');
            else res.send(error.response.data.error);
        })
})

// questa get serve ad ottenere tutte le richieste di scambio ricevute non rifiutate
// un utente può accedere solo alle richieste fatte a lui
// le richieste vengono visualizzate in ordine dal più recente al meno recente (meglio al contrario?)
// in caso di errori di parametri si viene reindirizzati alla pagina di errore
router.get('/:id/ricevute', (req, res) => {
    axios.get('/users/'+req.params.id+'/ricevute', req.objHeader).
        then(response => {
            res.json(response.data);
            console.log(response.data);
        }).catch(error => {
            if (error.response) {
                if (error.response.status == 403) res.send('Non puoi accedere a questa pagina, non fare il furbo!');
                else res.redirect('/invalid');
            }
        })
})

// questa get serve ad ottenere tutte le richieste di scambio effettuate
// un utente può accedere solo alle richieste fatte da lui
// le richieste vengono visualizzate in ordine dal più recente al meno recente (meglio al contrario?)
// in caso di errori di parametri si viene reindirizzati alla pagina di errore
router.get('/:id/effettuate', (req, res) => {
    axios.get('/users/'+req.params.id+'/effettuate', req.objHeader).
        then(response => {
            res.json(response.data);
            console.log(response.data);
        }).catch(error => {
            if (error.response) {
                if (error.response.status == 403) res.send('Non puoi accedere a questa pagina, non fare il furbo!');
                else res.redirect('/invalid');
            }
        })
})

// questa post serve a fare richieste di scambio con l'utente con username id
// la form deve contenere due campi: "competenza", "messaggio"
// la competenza deve rientrare tra quelle offerte dall'utente
// se qualche parametro non è corretto si viene reindirizzati alla pagina di errore. 
// Un utente non può chiedere uno scambio a se stesso
// se uno scambio con il medesimo id esiste già si riceve un messaggio di errore
// non si può fare una richiesta alla stessa persona per la stessa competenza se esiste già una precedente richiesta ancora in attesa
// l'id di una recensione è una combinazione dell'username dell'utente richiesto, di quello del richiedente e della competenza richiesta
// quando la richiesta viene declinata o accettata all'id viene aggiunto il timestamp dell'accettazione
router.post('/:id/scambi', (req, res) => {
    axios.post('/users/'+req.params.id+'/scambi', req.body, req.objHeader).
        then(response => {
            res.redirect('/users/' + req.params.id);
        }).catch(error => {
            if (error.response) {
                if (error.response.status == 404) res.redirect('/invalid');
                else if (error.response.status == 403) res.send(error.response.data.error);
                else res.redirect('/users/' + req.params.id);
            }
        })
})

// questa post serve ad accettare o rifiutare una richiesta di scambio ricevuta
// un utente non può modificare solo richieste che ha ricevuto
// l'id di scambio fornito nella richiesta deve essere corretto (deve esistere uno scambio in attesa con lo stesso id)
// la richiesta deve passare un parametro: "stato"
// il parametro di stato può essere solo "accettato" o "rifiutato"
// viene inserito un nuovo documento per lo scambio con le informazioni di contatto che include nell'id il timestamp di conferma
// viene eliminato il documento con la richiesta in attesa, rendendo possibile effettuare un'altra richiesta
router.post('/:id_user/scambio/:id_scambio', (req, res) => {
    axios.post('/users/'+req.params.id_user+'/scambio/'+req.params.id_scambio, req.body, req.objHeader).
        then(response => {
            console.log(response.data);
            res.json(response.data);
        }).catch(error => {
            if (error.response) {
                if (error.response.status == 404) res.redirect('/invalid');
                else (res.send(error.response.data.error));
            }
        })
})

router.post('/:id_user/scambio/:id_scambio/delete', (req, res) => {
    axios.post('/users/'+req.params.id_user+'/scambio/'+req.params.id_scambio+'/delete', null, req.objHeader).
        then(response => {
            console.log(response.data);
            res.json(response.data);
        }).catch(error => {
            if (error.response) {
                if (error.response.status == 404) res.redirect('/invalid');
                else (res.send(error.response.data.error));
            }
        })
})

// questa get serve ad ottenere le 6 recensioni più recenti fatte all'utente con username id
// se l'id non è valido si viene reindirizzati alla pagina di errore
// la risposta contiene una chiave "docs" che contiene un'array di recensioni (array di oggetti json)
//  e una chiave bookmark finalizzata alla paginazione
router.get('/:id/recensioni', (req, res) => {
    axios.get('/users/'+req.params.id+'/recensioni', req.objHeader).
        then(response => {
            res.json(response.data);
        }).catch(error => {
            if (error.response) res.redirect('/invalid');
        })
})

// questa post serve a pubblicare recensioni. 
// deve essere fornito nell'url come query l'id dello scambio associato, nella forma "?scambio=<id_scambio>"
// la richiesta deve avere tre parametri: "sintesi", "recensione", "voto"
// se qualche parametro non è corretto si riceve un messaggio di errore. 
// Un utente non può recensire se stesso
// se una recensione con il medesimo id esiste già si riceve un messaggio di errore
// l'id di una recensione è semplicemente l'id dello scambio associato combinato al tag "recensione"
// una volta pubblicata la recnsione vengono aggiornati i dati i punteggio dell'utente recensito
router.post('/:id/recensioni', (req, res) => {
    req.body.scambio = req.query.scambio
    axios.post('/users/'+req.params.id+'/recensioni', req.body, {
            headers: req.objHeader.headers,
            params: {
                scambio: req.query.scambio
            }
        }).then(response => {
            res.redirect('/users/'+req.cookies.cookieUtente.username);
        }).catch(error => {
            if (error.response) {
                if (error.response.status != 404) res.send(error.response.data.error);
                else res.redirect('/invalid');
            }
        })
})

// URL non valido, reindirizza a pagina d'errore
router.get('*', (req, res) => {
    res.status(404).render('404NotFound');
})

module.exports = router;