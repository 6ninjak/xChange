const nano = require('nano')('http://admin:admin@localhost:5984');
const db = nano.db.use('xchange');

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

db.addAttachment = (docId, filePath, fileName, contentType, callback) => {
  fs.readFile(filePath, (err, data) => {
      if (!err) {
          db.get(docId, (error, res) => {
              if (!error) db.attachment.insert(docId, fileName, data, contentType, { rev:res._rev }, callback);
          })
      }
  });
}

db.removeAttachment = (docId, fileName, callback) => {
  db.get(docId, (error, res) => {
      if (!error) db.attachment.destroy(docId, fileName, { rev:res._rev }, callback);
  })
}

// indice necessario per fare query ordinate in base al punteggio
const indexClassifica = {
  index: { fields: ['media', 'recensioni'] },
  name: 'classifica'
};
db.createIndex(indexClassifica).then((result) => {
  console.log(result);
})

// indice necessario per ordinare i documenti per data, se hanno questo campo
const indexData = {
  index: { fields: ['data'] },
  name: 'data'
};
db.createIndex(indexData).then((result) => {
  console.log(result);
})

module.exports = db;