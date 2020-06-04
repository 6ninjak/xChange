# ![logo xChange](source/xChange/public/images/logoScrittaNera.png)
Un sito web che permette agli utenti di scambiare oggetti, competenze o qualsiasi altra cosa. Il denaro non esiste... un vero e proprio baratto online

----------

# Descrizione file
### app.js
- Inizializza il server aggiungendo tutti i moduli necessari
- Elenca alcune richieste possibili da fare al server, principalmente quelle che non riguardano direttamente gli utenti
- Mette il server in ascolto sulla porta 3000 di localhost

## routes/
### users.js
- Elenca tutte le richieste da fare al server che riguardano gli utenti
- Comunica molto con il database sia per ricevere che per caricare dati
- Molte delle richieste più elaborate sono commentate abbastanza dettagliatamente
  
## public/helper/
### dbHelper.js
- Avvia il database e rende disponibili alcune funzioni extra di accesso al db

### imageHelper.js
- Gestisce il caricamento delle immagini e identifica una directory temporanea pre-caricamento immagini

## public/javascript/
*alcuni file all'interno di questa directory sono vuoti*

### edit_dati.js
- Controlla che i dati inseriti alla modifica di un utente siano corretti prima di inviarli al server

### home.js
- Inizializza un'app Vue popolandola con un elenco degli utenti più recensiti

### homepage.js
- *file vuoto*

### login.js
- *file vuoto*

### profilo_esterno.js
- *file vuoto*

### profilo.js
- Inizializza un'app Vue popolandola con tutte le informazioni relative all'utente, da visualizzare all'interno della pagina profilo.html

### registrazione.js
- Esegue controlli sui dati inseriti all'interno della form per limitare i casi di errore nell'invio degli stessi dati al server

### ricerca.js
- Inizializza un'app Vue popolandola con il risultato della ricerca effettuata al server

## public/stylesheets/
### stile.css
- Foglio di stile con modifiche comuni a tutti i file html dell'app

### style404.css
- Foglio di stile relativo alla pagina 404NotFound.html

### styleHome.css
- Foglio di stile relativo alla pagina home.html

### styleHp.css
- Foglio di stile relativo alla pagina homepage.html

### styleLog.css
- Foglio di stile relativo alla pagina login.html

### styleReg.css
- Foglio di stile relativo alla pagina registrazione.html

## views/
### 404NotFound.html
- Pagina di errore con immagine molto simpatica: **da vedere**

### edit_dati.html
- Pagina per modificare i dati utente
- Un semplice form con vari tipi di inserimento, un pulsante di invio e uno per annullare

### Faq.html
- Pagina per le Faq sulle funzionalità dell'applicazione

### home.html
- Pagina principale dell'applicazione una volta eseguito il login
- Dà qualche informazione sul sito
- Mostra gli utenti più recensiti

### homepagepage.html
- Pagina principale dell'applicazione prima di aver effettuato il login
- Dà qualche informazione sul sito
- Dà la possibilità di registrarsi o di fare il login

### login.html
- Pagina di login
- Semplice form di inserimento username e password

### profilo_esterno.html
- Pagina visualizzata quando si cerca un altro utente
- Mostra tutte le informazioni (non personali) dell'utente in questione
- Permette di fare richiesta per una competenza

### profilo.html
- Pagina del proprio account
- Mostra tutte le informazioni del proprio account
- Permette di modificare immagine utente, nonché i propri dati
- Permette di visualizzare ed eliminare le notifiche
- Permette di accettare o declinare richieste e di recensire altri utenti

### registrazione.html
- Pagina di registrazione
- Semplice form per inserire username, nome, cognome, email e password da inviare al server

### ricerca.html
- Pagina di ricerca in cui è possibile cercare altri utenti per competenza, username, nome e cognome
- I risultati vengono ordinati in base alle recensioni


----------

## Link utili
- [documentazione couchdb 3.0.0](https://docs.couchdb.org/en/3.0.0/index.html)
- [modulo nano per nodejs](https://www.npmjs.com/package/nano)

## Requisiti
1. node.js
2. couchdb

## Come far funzionare l'app
1. eseguire `npm -g install bower` sul terminale da qualsiasi directory
2. recarsi da terminale alla directory /source/xChange
3. eseguire il comando `npm install` per installare tutti i moduli necessari
4. eseguire il comando `bower install` per installare le componenti bower
5. eseguire il comando `nodemon` per far partire il server sulla porta 3000

----------

# Autori

- @6ninjak *Giacomo Colizzi Coin*
- @lorenzoCatini *Lorenzo Catini*
- @simone1708475 *Simone Mastrocola*
