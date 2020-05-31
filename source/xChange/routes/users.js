const express = require('express');
const router = express.Router();
const db = require('../public/helper/dbHelper.js')
const crypto = require('crypto');


router.post('/', (req, res) => {
    var body = req.body;
    let encPwd = crypto.createHash('md5').update(body.password).digest('hex'); // Codifichiamo la password in MD5
    var q = {
        selector: {
            tipo: 'user',
            email: body.email
        }
    };
    db.find(q, (err, response) => {
        if(!err && response.docs.length==0) {
            db.insert({
                tipo: 'user',
                
                username: body.username,
                nome: body.nome,
                cognome: body.cognome,
                email: body.email,
                password: encPwd,
                punti: 0,
                media: 0,
                recensioni: 0
                
            }, body.username, (err, response) => {
                if (err && err.error == 'conflict') {
                    res.render('registrazione', {
                        title: 'xChange - registrazione',
                        error: 'esiste già un utente con questo username'
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
        } else {
            res.render('registrazione', {
                title: 'xChange - registrazione',
                error: 'esiste già un utente con questa email'
            });
        }
    })
});

// get su /users/:id conduce a profilo.html di :id
router.get('/:id', (req, res, next) => {
    // console.log(req.cookies.cookieUtente)
    db.get(req.params.id, (err, doc) => {
        // console.log(err);
        // console.log(doc);
        if (!err && req.cookies.cookieUtente.username == doc.username && req.cookies.cookieUtente.password == doc.password) {
            delete doc.password;
            res.render('profilo', {
                utente: doc
            });
        } else if (!err) {
            delete doc.password;
            delete doc.email;
            res.render('profilo_esterno', {
                utente: doc
            });
        } else next();
    });
});

router.get('/:id/dati', (req, res, next) => {
    // console.log(req.cookies.cookieUtente)
    db.get(req.params.id, (err, doc) => {
        // console.log(err);
        // console.log(doc);
        if (!err && req.cookies.cookieUtente.username == doc.username && req.cookies.cookieUtente.password == doc.password) {
            delete doc.password;
            console.log(doc);
            res.json(doc);
        } else if (!err) {
            delete doc.password;
            delete doc.email;
            res.json(doc);
        } else next();
    });
});

// get su /users/:id/edit conduce a edit_dati.html di :id
router.get('/:id/edit', (req, res) => {
    db.get(req.params.id, (err, doc) => {
        if (!err && req.cookies.cookieUtente.username == doc.username && req.cookies.cookieUtente.password == doc.password) {
            delete doc.password;
            res.render('edit_dati', {
                utente: doc
            });
        } else if (!err) {
            res.send('Non puoi accedere a questa pagina, non fare il furbo!');
        } else next();
    });
});

// put su users/:id aggiorna i dati da db e reindirizza a /users/:id
router.put('/:id', (req, res) => {
    db.get(req.params.id, (err, doc) => {
        if (!err && req.cookies.cookieUtente.username == doc.username && req.cookies.cookieUtente.password == doc.password) {
            // inserisci dati su db
            res.redirect('.');
        } else if (!err) {
            res.send('Non puoi accedere a questa pagina, non fare il furbo!');
        } else res.redirect('/invalid');
    });
});

// questa post serve ad aggiornare l'immagine profilo dell'utente id
// un utente può aggiornare solo la propria pagina profilo
router.post('/:id/image', (req, res) => {
    db.get(req.params.id, (err, doc) => {
        if (!err && req.cookies.cookieUtente.username == doc.username && req.cookies.cookieUtente.password == doc.password) {
            console.log(req.body.file.type);
            // db.addAttachment(req.params.id, req.body., 'immagine_profilo', req.body.file.type, (err, response) => {
            //     if (!err) console.log(response);
            // });
            res.redirect('.');
        } else if (!err) {
            res.send('Non puoi accedere a questa pagina, non fare il furbo!');
        } else res.redirect('/invalid');
    });
})

// questa get serve ad ottenere tutte le richieste di scambio ricevute non rifiutate
// un utente può accedere solo alle richieste fatte a lui
// le richieste vengono visualizzate in ordine dal più recente al meno recente (meglio al contrario?)
// in caso di errori di parametri si viene reindirizzati alla pagina di errore
router.get('/:id/ricevute', (req, res) => {
    var q = {
        selector: {
            tipo: "scambio",
            richiesto: req.params.id,
            stato: { $and: [
                { $ne: 'rifiutato' },
                { $ne: 'concluso' }]
            }
        },
        sort: [{ data: "desc"}],
        fields: ["_id", "data", "richiedente", "competenza", "messaggio", "stato"]
    };
    db.get(req.params.id, (err, doc) => {
        if (!err && req.cookies.cookieUtente.username == doc.username && req.cookies.cookieUtente.password == doc.password) {
            db.find(q, (err, body) => {
                if (!err) res.json(body);
                console.log(body);
            });
        } else if (!err) res.send('Non puoi accedere a questa pagina, non fare il furbo!');
        else res.redirect('/invalid');
    });
})

// questa get serve ad ottenere tutte le richieste di scambio effettuate
// un utente può accedere solo alle richieste fatte da lui
// le richieste vengono visualizzate in ordine dal più recente al meno recente (meglio al contrario?)
// in caso di errori di parametri si viene reindirizzati alla pagina di errore
router.get('/:id/effettuate', (req, res) => {
    var q = {
        selector: {
            tipo: "scambio",
            richiedente: req.params.id,
        },
        sort: [{ data: "desc"}],
        fields: ["_id", "data", "richiesto", "competenza", "messaggio", "stato", "info"]
    };
    db.get(req.params.id, (err, doc) => {
        if (!err && req.cookies.cookieUtente.username == doc.username && req.cookies.cookieUtente.password == doc.password) {
            db.find(q, (err, body) => {
                if (!err) res.json(body);
                console.log(body);
            });
        } else if (!err) res.send('Non puoi accedere a questa pagina, non fare il furbo!');
        else res.redirect('/invalid');
    });
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
    db.get(req.params.id, (err, doc) => {
        if (!err && req.cookies.cookieUtente.username == doc.username && req.cookies.cookieUtente.password == doc.password) {
            res.send('Non puoi accedere a questa pagina, non fare il furbo!');
        } else if (!err) {
            if (!doc.competenze.includes(req.body.competenza)) res.send('la competenza richiesta non fa parte di quelle offerte!');
            else {
                let d = new Date();
                var documento = {
                    tipo: 'scambio',

                    richiesto: req.params.id,
                    richiedente: req.cookies.cookieUtente.username,
                    competenza: req.body.competenza,
                    messaggio: req.body.messaggio,
                    stato: 'attesa',
                    data: "" + d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear()
                }
                db.insert(documento, documento.richiesto + ':' + documento.richiedente + ':' + documento.competenza, (err, response) => {
                    if (err && err.error == 'conflict') {
                        res.send('esiste già uno scambio con questo id')
                    } else {
                        console.log(response);
                        res.redirect('/users/'+req.params.id);
                    }
                });
            }
        } else res.redirect('/invalid');
    });
})

// questa post serve ad accettare o rifiutare una richiesta di scambio ricevuta
// un utente non può modificare solo richieste che ha ricevuto
// l'id di scambio fornito nella richiesta deve essere corretto (deve esistere uno scambio in attesa con lo stesso id)
// la richiesta deve passare un parametro: "stato"
// il parametro di stato può essere solo "accettato" o "rifiutato"
// viene inserito un nuovo documento per lo scambio con le informazioni di contatto che include nell'id il timestamp di conferma
// viene eliminato il documento con la richiesta in attesa, rendendo possibile effettuare un'altra richiesta
router.post('/:id_user/scambio/:id_scambio', (req, res) => {
    let arrayScambio = req.params.id_scambio.split(':');
    if (arrayScambio.length != 3) 
        res.send("l'id di scambio fornito non è corretto");
    else if (!(req.body.stato && ["accettato", "rifiutato"].includes(req.body.stato))) 
        res.send('parametro di stato non presente o scorretto!');
    else {
        db.get(req.params.id_user, (err, doc) => {
            if (!err && req.cookies.cookieUtente.username == doc.username && req.cookies.cookieUtente.password == doc.password && doc.username == arrayScambio[0]) {
                db.get(req.params.id_scambio, (err, document) => {
                    if (err) res.send("l'id di scambio fornito non è corretto");
                    else {
                        let d = new Date();
                        document.stato = req.body.stato;
                        let rev = document._rev;
                        delete document._rev;
                        delete document._id;
                        document.data = "" + d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear()
                        document.info = 'email: ' + doc.email;
                        // aggiungere campo del telefono da fornire
                        db.insert(document, req.params.id_scambio + ':' + document.data, (err, response) => {
                            if (!err) {
                                console.log(response);
                                res.json(document);
                                db.destroy(req.params.id_scambio, rev).then((body) => {
                                    console.log(body);
                                });
                            } else console.log(err);
                        });
                    }
                })
            } else if (!err) {
                res.send('Non puoi accedere a questa pagina, non fare il furbo!');
            } else res.redirect('/invalid');
        });
    }
})

// questa get serve ad ottenere le 6 recensioni più recenti fatte all'utente con username id
// se l'id non è valido si viene reindirizzati alla pagina di errore
// la risposta contiene una chiave "docs" che contiene un'array di recensioni (array di oggetti json)
//  e una chiave bookmark finalizzata alla paginazione
router.get('/:id/recensioni', (req, res) => {
    var q = {
        selector: {
            tipo: "recensione",
            recensito: req.params.id,
        },
        sort: [{ data: "desc"}],
        fields: ["recensore", "sintesi", "recensione", "voto"]
    };
    db.get(req.params.id, (err, doc) => {
        if (!err) {
            db.find(q, (err, body) => {
                if (!err) res.json(body);
                console.log(body);
            });
        } else res.redirect('/invalid');
    });
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
    db.get(req.params.id, (err, doc) => {
        if (!err && req.cookies.cookieUtente.username == doc.username && req.cookies.cookieUtente.password == doc.password) {
            res.send('Non puoi accedere a questa pagina, non fare il furbo!');
        } else if (!err) {
            if (req.body.voto > 5 || req.body.voto < 0) res.send('voto non valido');
            else {
                let d = new Date();
                var documento = {
                    tipo: 'recensione',

                    recensito: req.params.id,
                    recensore: req.cookies.cookieUtente.username,
                    sintesi: req.body.sintesi,
                    recensione: req.body.recensione,
                    voto: req.body.voto,
                    data: "" + d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear()
                }
                db.get(req.query.scambio, (err, document) => {
                    if (!err && document.stato == "accettato")
                        db.insert(documento, req.query.scambio + ':recensione', (err, response) => {
                            if (err && err.error == 'conflict') {
                                res.send('esiste già una recensione con questo id')
                            } else {
                                console.log(response);
                                let new_punti = parseInt(doc.punti) + parseInt(documento.voto);
                                let new_recensioni = doc.recensioni + 1;
                                let new_media = new_punti/new_recensioni;
                                db.updateFields({
                                    punti: new_punti,
                                    recensioni: new_recensioni,
                                    media : new_media,
                                }, doc.username, (err, res) => {
                                    if (!err) console.log(res)
                                });
                                db.updateFields({
                                    stato: 'concluso'
                                }, req.query.scambio, (err, res) => {
                                    if (!err) console.log(res)
                                });
                                res.redirect('../' + documento.recensore);
                            }
                        });
                    else if (!err) res.send('lo stato dello scambio non è valido');
                    else res.send('id dello scambio errato');
                });
            }
        } else res.redirect('/invalid');
    });
})

// URL non valido, reindirizza a pagina d'errore
router.get('*', (req, res) => {
    res.status(404).render('404');
})

module.exports = router;

