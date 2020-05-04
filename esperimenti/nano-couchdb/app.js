var nano = require('nano');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Questo è solo un esperimento');
})
app.listen(3000, () => {
    console.log('server in ascolto sulla porta 3000');
})