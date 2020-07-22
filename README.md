# ![xChange](source/xChange/public/images/logoScrittaNera.png)
Un sito web che permette agli utenti di scambiare oggetti, competenze o qualsiasi altra cosa. Il denaro non esiste... un vero e proprio baratto online

----------

## Descrizione
La nostra applicazione funziona su due server: uno principale costituito esclusivamente da API (infatti è completamente autonomo) e uno secondario che si appoggia al principale e si occupa di mostrare le pagine html dell'applicazione

## Link utili
- [couchdb](https://docs.couchdb.org/en/3.0.0/index.html)
- [rabbitmq](https://www.rabbitmq.com/documentation.html)
- [express](http://expressjs.com/)
- [nano](https://www.npmjs.com/package/nano)
- [cookie-parser](https://www.npmjs.com/package/cookie-parser)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [axios](https://www.npmjs.com/package/axios)
- [amqplib](https://www.npmjs.com/package/amqplib)

## Requisiti
1. node.js
2. couchdb
3. rabbitmq

## Come far funzionare l'app
1. eseguire `npm -g install bower nodemon` sul terminale da qualsiasi directory per installare globalmente nodemon e bower
2. recarsi da terminale nella directory /source/xChange
3. eseguire il comando `npm install` per installare tutti i moduli necessari
4. eseguire il comando `bower install` per installare le componenti bower
5. eseguire il comando `nodemon` per far partire il server secondario sulla porta 3000
6. recarsi da terminale nella directory /source/xChangeAPI
7. eseguire il comando `npm install` per installare tutti i moduli necessari
8. eseguire il comando `nodemon` per far partire il server principale sulla porta 3001

----------

# Autori

- @6ninjak *Giacomo Colizzi Coin*
- @lorenzoCatini *Lorenzo Catini*
- @simone1708475 *Simone Mastrocola*
