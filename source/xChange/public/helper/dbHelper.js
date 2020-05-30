const nano = require('nano')('http://admin:admin@localhost:5984');
const fs = require('fs');
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

module.exports = db;