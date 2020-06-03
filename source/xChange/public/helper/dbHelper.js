const nano = require('nano')('http://admin:admin@localhost:5984');
const fs = require('fs');
let db;
// const db = nano.db.use('xchange');

// indice necessario per fare query ordinate in base al punteggio
const indexClassifica = {
    index: { fields: ['media', 'recensioni'] },
    name: 'classifica'
};

// indice necessario per ordinare i documenti per data, se hanno questo campo
const indexData = {
    index: { fields: ['data'] },
    name: 'data'
};
const dbHelper = async () => {
    await nano.db.create('xchange').then(res=> {
        console.log('creato il db xchange!')
    }).catch(error => {
    });
    // console.log('apro il db xchange...') // questo log serve solo per debug... se non commentato la console si riempie di messaggi
    db = await nano.use('xchange');
    // console.log('db xchange aperto!') // come sopra

    db.insertOrUpdate = (docData, docId, callback) => {
        db.get(docId, (err, res) => {
            if (!err) docData._rev = res._rev;
            db.insert(docData, docId, callback);
        });
    }
    
    db.updateFields = (docFields, docId, callback) => {
        db.get(docId, (err, res) => {
            if (!err) db.insertOrUpdate(Object.assign(res, docFields), docId, callback);
            else callback();
        });
    }
    
    db.delete = (docId, callback) => {
        db.get(docId, (err, res) => {
            if (!err) db.destroy(docId, res._rev, callback);
        });
    }
    
    db.addAttachment = (docId, filePath, fileName, contentType, callback) => {
        fs.readFile(filePath, (err, data) => {
            if (!err) {
                db.get(docId, (error, res) => {
                    if (!error) db.attachment.insert(docId, fileName, data, contentType, { rev: res._rev }, callback);
                })
            }
        });
    }
    
    db.removeAttachment = (docId, fileName, callback) => {
        db.get(docId, (error, res) => {
            if (!error) db.attachment.destroy(docId, fileName, { rev: res._rev }, callback);
        })
    }
    return db;
}

// queste due funzioni creano indici necessari alla ricerca sul database... vengono eseguite solo all'apertura dal server
dbHelper().then(res => {
    res.createIndex(indexClassifica).then((result) => {
    console.log(result);
});
});
dbHelper().then(res => {
    res.createIndex(indexData).then((result) => {
    console.log(result);
});
});

module.exports = dbHelper;
