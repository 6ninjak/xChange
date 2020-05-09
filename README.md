# xChange
Un sito web che permette agli utenti di scambiare oggetti, competenze o qualsiasi altra cosa. Il denaro non esiste... un vero e proprio baratto online

## Link utili
- [modulo nano per nodejs](https://www.npmjs.com/package/nano)
- [repository github RC di Vitaletti](https://github.com/andreavitaletti/RC)
- [documentazione couchdb 3.0.0](https://docs.couchdb.org/en/3.0.0/index.html)
- [comandi git](https://www.instagram.com/p/B_mngFBAPJO/?igshid=1vzzdu5g38dpm)

## Comandi utili git
- `git fetch origin` aggiorna la repository locale
- `git branch <nome del branch locale>` crea un branch locale
- `git branch -a` fornisce un elenco di tutti i branch locali e remoti
- `git status` fornisce informazioni su commit, push e pull del branch corrente
- `git checkout <nome branch>` cambia il branch corrente
- `git push -u origin <nome branch locale>` crea una copia remota del branch locale
- `git log --all --graph --oneline` fornisce l'elenco dei commit del progetto
- `git checkout --track <nome branch>` imposta il branch corrente in modo che tracci il branch passato come argomento
- `git push` tutti i commit effettuati nel branch corrente vengono caricati sul branch tracciato, l'upstream
- `git pull` serve ad allineare il branch corrente con il branch in upstream quando questo è avanti rispetto al branch corrente
- `git merge <nome branch>` allinea il branch corrente con il branch passato come argomento (molto rischioso!)

## Come far funzionare l'app
1. eseguire `npm -g install bower` sul terminale da qualsiasi directory
2. recarsi da terminale alla directory /source/xChange
3. eseguire il comando `npm install` per installare tutti i moduli necessari
4. eseguire il comando `node app.js` per far partire il server sulla porta 3000