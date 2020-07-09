const express = require('express');
const router = express.Router();
const dbHelper = require('../helper/dbHelper.js');
const crypto = require('crypto');
const multer = require('multer');
const upload = require('../helper/imageHelper.js');
const fs = require('fs');
let db;


function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

router.use((req, res, next) => {
    dbHelper().then(res => {
        db = res;
        next();
    })
})

// questa post permette di creare un nuovo utente
// richiede parametri in input: "username", "nome", "cognome", "password", "email"
// in caso di errore viene restituito un json di errore
router.post('/', (req, res) => {
    console.log(req.body);
    var body = req.body;
    if (!(body.username && body.nome && body.cognome && body.password && body.email)) res.json({error: "manca qualche parametro"});
    if (body.username.includes(":") || body.username.includes("?") || body.username.includes("/") || body.username.includes("=")) {
        res.status(400).json({error: 'username non valido'});
    } else if (body.password.length < 8) {
        res.status(400).json({error: 'password non valida'});
    } else if (!validateEmail(body.email)) {
        res.status(400).json({error: 'email non valida'});
    } else {
        let encPwd = crypto.createHash('md5').update(body.password).digest('hex'); // Codifichiamo la password in MD5
        var q = {
            selector: {
                tipo: 'user',
                email: body.email
            }
        };
        db.find(q, (err, response) => {
            if (!err && response.docs.length == 0) {
                var documento = {
                    tipo: 'user',

                    username: body.username,
                    nome: body.nome,
                    cognome: body.cognome,
                    email: body.email,
                    password: encPwd,
                    competenze: [],
                    punti: 0,
                    media: 0,
                    recensioni: 0

                };
                db.insert(documento, body.username, (err, response) => {
                    if (err && err.error == 'conflict') {
                        res.status(409).json({error: 'esiste già un utente con questo username'});
                    } else if (err) {
                        res.status(500).json({error: err});
                    } else {
                        // db.addAttachment(body.username, 'public/images/profilo.png', 'immagine_profilo', 'image/png', (err, response) => {
                        //     if (!err) console.log(response);
                        //     else console.log(err);
                        // });
                        fs.readFile('public/images/profilo.png', (err, data) => {
                            if (!err) {
                                db.attachment.insert(response.id, 'immagine_profilo', data, 'image/png', { rev: response.rev }, (error, r) => {
                                    console.log(error || r);
                                });
                            }
                            else console.log(err);
                        });
                        res.json(documento);
                        console.log(response);
                    }
                });
            } else {
                res.status(409).json({error: 'esiste già un utente con questa email'});
            }
        })
    }
});

// questa get restituisce i dati relativi all'utente :id
// non richiede parametri
// un utente non può accedere ai dati di contatto di un altro utente
router.get('/:id/dati', (req, res, next) => {
    db.get(req.params.id, (err, doc) => {
        // console.log(err);
        // console.log(doc);
        if (!err && req.userId.user.id == doc.username) {
            delete doc.password;
            doc.me = true
            res.json(doc);
        } else if (!err) {
            delete doc.password;
            delete doc.email;
            delete doc.telefono
            doc.me = false;
            res.json(doc);
        } else next();
    });
});

// questa post aggiorna i dati dell'utente :id
// un utente può modificare solo il proprio profilo
// richiede parametri: "competenze" (array o stringa), "telefono" (numero o stringa), "professione" (stringa)
// i parametri non forniti non vanno a modificare il documento sul db
// in caso di errore viene restituito un json di errore
router.post('/:id', (req, res) => {
    db.get(req.params.id, (err, doc) => {
        if (!err && req.userId.user.id == doc.username) {
            console.log(req.body);
            var array = doc.competenze;
            if (typeof req.body.competenze == "string") {
                if (!array.includes(req.body.competenze))
                    array.push(req.body.competenze);
            } else {
                if(req.body.competenze) {
                    for (let index = 0; index < req.body.competenze.length; index++) {
                        if (!array.includes(req.body.competenze[index]))
                            array.push(req.body.competenze[index]);
                    }
                }
            }

            var variazioni = {};
            if (["string", "number", "undefined"].includes(typeof req.body.telefono)) {
                if (req.body.telefono != null) variazioni.telefono = req.body.telefono;
            } else res.status(400).json({error: "il numero di telefono deve essere una stringa o un numero"});

            variazioni.competenze = array;

            if (["string", "undefined"].includes(typeof req.body.professione)) {
                if (req.body.professione != null) variazioni.professione = req.body.professione;
            } else res.status(400).json({error: "la professione deve essere una stringa"});

            db.updateFields(variazioni, req.params.id, (err, response) => {
                if (!err) {
                    console.log(response);
                    delete doc.password
                    res.json({doc, variazioni});
                }
            })
        } else if (!err) {
            res.status(403).json({error: "non puoi accedere a questa pagina"});
        } else res.redirect('/invalid');
    });
});

// questa post serve ad aggiornare l'immagine profilo dell'utente id
// un utente può aggiornare solo la propria pagina profilo
router.post('/:id/image', (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            res.status(400).json({error: err.message})
          } else {
            console.log(req.file.path);
            db.get(req.params.id, (err, doc) => {
                if (!err && req.userId.user.id == req.params.id) {
                    // console.log(req.file);
                    db.addAttachment(req.params.id, req.file.path, 'immagine_profilo', req.file.mimetype, (err, response) => {
                        if (!err) {
                            console.log(response);
                            res.json(response);
                        }
                    });
                } else if (!err) {
                    res.status(403).json({error: "non puoi accedere a questa pagina"});
                } else res.redirect('/invalid');
            });
        }
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
            stato: {
                $and: [
                    { $ne: 'rifiutato' },
                    { $ne: 'concluso' }]
            }
        },
        sort: [{ data: "desc" }],
        fields: ["_id", "data", "richiesto", "richiedente", "competenza", "messaggio", "stato"]
    };
    db.get(req.params.id, (err, doc) => {
        if (!err && req.userId.user.id == req.params.id) {
            db.find(q, (err, body) => {
                if (!err) res.json(body);
                console.log(body);
            });
        } else if (!err) res.status(403).json({error: "non puoi accedere a questa pagina"});
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
        sort: [{ data: "desc" }],
        fields: ["_id", "data", "richiesto", "richiedente", "competenza", "messaggio", "stato", "info"]
    };
    db.get(req.params.id, (err, doc) => {
        if (!err && req.userId.user.id == req.params.id) {
            db.find(q, (err, body) => {
                if (!err) res.json(body);
                console.log(body);
            });
        } else if (!err) res.status(403).json({error: "non puoi accedere a questa pagina"});
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
        if (!err && req.userId.user.id == req.params.id) {
            res.status(403).json({error: "non puoi accedere a questa pagina"});
        } else if (!err) {
            if (!doc.competenze.includes(req.body.competenza)) res.status(400).json({error: "competenza richiesta non valida"});
            else {
                let d = new Date();
                var documento = {
                    tipo: 'scambio',

                    richiesto: req.params.id,
                    richiedente: req.userId.user.id,
                    competenza: req.body.competenza,
                    messaggio: req.body.messaggio,
                    stato: 'attesa',
                    data: Date.now()
                }
                db.insert(documento, documento.richiesto + ':' + documento.richiedente + ':' + documento.competenza, (err, response) => {
                    if (err && err.error == 'conflict') {
                        delete doc.email;
                        delete doc.password;
                        res.status(409).json({error: "competenza già richiesta, attendere risposta"});
                    } else {
                        console.log(response);
                        res.json(documento);
                    }
                });
            }
        } else res.redirect('/invalid');
    });
})

// questa post serve ad accettare o rifiutare una richiesta di scambio ricevuta
// un utente può modificare solo richieste che ha ricevuto
// l'id di scambio fornito nella richiesta deve essere corretto (deve esistere uno scambio in attesa con lo stesso id)
// la richiesta deve passare un parametro: "stato"
// il parametro di stato può essere solo "accettato" o "rifiutato"
// viene inserito un nuovo documento per lo scambio con le informazioni di contatto che include nell'id il timestamp di conferma
// viene eliminato il documento con la richiesta in attesa, rendendo possibile effettuare un'altra richiesta
router.post('/:id_user/scambio/:id_scambio', (req, res) => {
    let arrayScambio = req.params.id_scambio.split(':');
    if (arrayScambio.length != 3)
        res.status(400).json({error: "id di scambio non corretto"});
    else if (!(req.body.stato && ["accettato", "rifiutato"].includes(req.body.stato)))
        res.status(400).json({error: "parametro di stato mancante o scorretto"});
    else {
        db.get(req.params.id_user, (err, doc) => {
            if (!err && req.userId.user.id == doc.username && doc.username == arrayScambio[0]) {
                db.get(req.params.id_scambio, (err, document) => {
                    if (err) res.status(400).json({error: "id di scambio non corretto"});
                    else {
                        document.stato = req.body.stato;
                        let rev = document._rev;
                        delete document._rev;
                        delete document._id;
                        document.data = Date.now();
                        if (req.body.stato == 'accettato')
                            document.info = 'email: ' + doc.email + '\nTelefono: ' + doc.telefono;
                        // aggiungere campo del telefono da fornire
                        db.insert(document, req.params.id_scambio + ':' + document.data, (err, response) => {
                            if (!err) {
                                console.log(response);
                                res.json(response);
                                // res.redirect("/users/" + req.params.id_user);
                                db.destroy(req.params.id_scambio, rev).then((body) => {
                                    console.log(body);
                                });
                            } else console.log(err);
                        });
                    }
                });
            } else if (!err) {
                res.status(403).json({error: "non puoi accedere a questa pagina"});
            } else res.redirect('/invalid');
        });
    }
})
// questa post serve ad eliminare una richiesta di scambio effettuata
// in caso di errori di qualsiasi tipo si riceverà un json di errore
router.post('/:id_user/scambio/:id_scambio/delete', (req, res) => {
    let arrayScambio = req.params.id_scambio.split(':');
    if (arrayScambio.length < 3)
        res.status(400).json({error: "id di scambio non corretto"});
    else {
        db.get(req.params.id_user, (err, doc) => {
            if (!err && req.userId.user.id == doc.username && doc.username == arrayScambio[1]) {
                db.get(req.params.id_scambio, (err, document) => {
                    if (err) res.status(400).json({error: "id di scambio non corretto"});
                    else {
                        db.destroy(req.params.id_scambio, document._rev, (err, response) => {
                            if (!err) {
                                console.log(response);
                                res.json(response);
                            } else console.log(err);
                        })
                    }
                });
            } else if (!err) {
                res.status(403).json({error: "non puoi accedere a questa pagina"});
            } else res.redirect('/invalid');
        });
    }
})

// questa get serve ad ottenere le 6 recensioni più recenti fatte all'utente con username id
// se l'id non è valido si viene reindirizzati alla pagina di errore
// la risposta contiene una chiave "docs" che contiene un'array di recensioni (array di oggetti json)
// e una chiave bookmark finalizzata alla paginazione
router.get('/:id/recensioni', (req, res) => {
    var q = {
        selector: {
            tipo: "recensione",
            recensito: req.params.id,
        },
        sort: [{ data: "desc" }],
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
// la richiesta deve avere quattro parametri: "sintesi", "recensione", "voto"
// se qualche parametro non è corretto si riceve un json di errore. 
// Un utente non può recensire se stesso
// se una recensione con il medesimo id esiste già, si riceve un messaggio di errore
// l'id di una recensione è semplicemente l'id dello scambio associato combinato al tag "recensione"
// una volta pubblicata la recensione vengono aggiornati i dati di punteggio dell'utente recensito
router.post('/:id/recensioni', (req, res) => {
    db.get(req.params.id, (err, doc) => {
        if (!err && req.userId.user.id == doc.username) {
            res.status(403).json({error: "non puoi accedere a questa pagina"});
        } else if (!err) {
            if (req.body.voto > 5 || req.body.voto < 0) res.status(400).json({error: "voto non valido"});
            else {
                let d = new Date();
                var documento = {
                    tipo: 'recensione',

                    recensito: req.params.id,
                    recensore: req.userId.user.id,
                    sintesi: req.body.sintesi,
                    recensione: req.body.recensione,
                    voto: req.body.voto,
                    data: "" + d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear()
                }
                db.get(req.query.scambio, (err, document) => {
                    if (!err && document.stato == "accettato")
                        db.insert(documento, req.query.scambio + ':recensione', (err, response) => {
                            if (err && err.error == 'conflict') {
                                res.status(409).json({error: "recensione già esistente"})
                            } else {
                                console.log(response);
                                let new_punti = parseInt(doc.punti) + parseInt(documento.voto);
                                let new_recensioni = doc.recensioni + 1;
                                let new_media = new_punti / new_recensioni;
                                db.updateFields({
                                    punti: new_punti,
                                    recensioni: new_recensioni,
                                    media: new_media,
                                }, doc.username, (err, res) => {
                                    if (!err) console.log(res)
                                });
                                db.updateFields({
                                    stato: 'concluso'
                                }, req.query.scambio, (err, res) => {
                                    if (!err) console.log(res)
                                });
                                res.json(documento);
                            }
                        });
                    else if (!err) res.status(400).json({error: "stato dello scambio non valido"});
                    else res.status(400).json({error: "id scambio non valido"});
                });
            }
        } else res.redirect('/invalid');
    });
})

// URL non valido, reindirizza a pagina d'errore
router.get('*', (req, res) => {
    res.status(404).json({error: "Page Not Found"})
})

module.exports = router;