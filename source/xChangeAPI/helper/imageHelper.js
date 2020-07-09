const multer = require('multer');
const path = require('path');

const upload = multer({
    dest: path.join(__dirname, '../temp'),
    limits: {
        fileSize: 1024*1024
    }
});

module.exports = upload;