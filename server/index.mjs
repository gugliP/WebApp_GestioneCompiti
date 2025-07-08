import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import * as dao from './dao.mjs';

const app = express();
const port = 3001;

// Middleware di logging delle richieste HTTP
app.use(morgan('dev'));

// Middleware per parsing JSON
app.use(express.json());

// Configurazione CORS per permettere richieste dal frontend
const corsOption = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true
};
app.use(cors(corsOption));

// Configurazione sessione utente
app.use(session({
  secret: "Segreto",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));

// Middleware di autenticazione

// Verifica se l'utente è autenticato
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Non autenticato' });
}

// Verifica se l'utente è un docente
function isDocente(req, res, next) {
  if (req.user && req.user.ruolo === 'docente') return next();
  res.status(403).json({ error: 'Solo per docenti' });
}

// Verifica se l'utente è uno studente
function isStudente(req, res, next) {
  if (req.user && req.user.ruolo === 'studente') return next();
  res.status(403).json({ error: 'Solo per studenti' });
}

// Configurazione di login locale con Passport
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await dao.getUtente(username, password);
  if (!user)
    return cb(null, false, 'Username o Password errata.');

  return cb(null, user);
}));

// Recupera dati da Utente e li serializza per salvare informazioni nella sessione
passport.serializeUser(function (user, cb) {
  cb(null, user);
});

// All'arrivo di un coockie con id sessione fa la deserializzazione
// e recupera i dati dell'utente dalla sessione
passport.deserializeUser(function (user, cb) {
  return cb(null, user);
});

// API Sessione

// POST /api/sessions
// Autenticazione utente - login
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      return res.status(401).send(info).end();
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(201).json(req.user).end();
    });
  })(req, res, next);
});

// GET /api/sessions/current
// Restituisce l'utente autenticato
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  }
  else
    res.status(401);
});

// DELETE /api/sessions/current
// Logout dell'utente corrente
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});

// logout alternativo del professore
app.post('/api/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      }
      res.clearCookie('connect.sid');
    });
  });
});

// API DOCENTE

// POST /api/compiti
// Creazione nuovo compito
app.post('/api/compiti', isLoggedIn, isDocente, async (req, res) => {
  try {
    const { titolo, descrizione, gruppo } = req.body;
    // Controllo => gruppo tra 2 e 6 studenti
    if (!Array.isArray(gruppo) || gruppo.length < 2 || gruppo.length > 6)
      return res.status(400).json({ error: 'Il gruppo deve avere tra 2 e 6 studenti.' });

    // Controllo => vincolo sulle coppie di studenti
    for (let i = 0; i < gruppo.length; i++) {
      for (let j = i + 1; j < gruppo.length; j++) {
        const count = await dao.contaCompitiInsieme(gruppo[i], gruppo[j], req.user.utenteId);
        if (count >= 2)
          return res.status(400).json({ error: 'Una coppia di studenti ha già lavorato insieme in almeno 2 compiti.' });
      }
    }

    // Inserisci compito
    const compitoId = await dao.inserisciCompito(titolo, descrizione, req.user.utenteId, 'aperto');
    // Inserisci gruppo
    const gruppoId = await dao.inserisciGruppo(compitoId);
    // Inserisci membri
    for (const studenteId of gruppo) {
      await dao.inserisciMembroGruppo(gruppoId, studenteId);
    }
    res.status(201).json({ compitoId, gruppoId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/compiti/:compitoId/rispostaDocente
// Visualizzazione risposta di un gruppo a un compito
app.get('/api/compiti/:compitoId/rispostaDocente', isLoggedIn, isDocente, async (req, res) => {
  try {
    const { compitoId } = req.params;
    // Recupera tutti i gruppi associati al compito
    const gruppi = await dao.getGruppiByCompito(compitoId);
    const risposte = [];
    for (const gruppo of gruppi) {
      const risposta = await dao.getRispostaByGruppo(gruppo.gruppoId);
      risposte.push({ gruppoId: gruppo.gruppoId, risposta });
    }
    res.json(risposte);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/compiti/aperti-docente
// Restituisce tutti i compiti aperti creati dal docente autenticato
app.get('/api/compiti/aperti-docente', isLoggedIn, isDocente, async (req, res) => {
  try {
    const compiti = await dao.getCompitiApertiByDocente(req.user.utenteId);
    res.json(compiti);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/compiti/:compitoId/valutazione
// Inserimento valutazione e chiusura compito
app.post('/api/compiti/:compitoId/valutazione', isLoggedIn, isDocente, async (req, res) => {
  try {
    const { compitoId } = req.params;
    const { gruppoId, voto } = req.body;

    // Controlla che il compito sia del docente autenticato
    const compiti = await dao.getCompitiByDocente(req.user.utenteId);
    if (!compiti.find(c => c.compitoId == compitoId))
      return res.status(403).json({ error: 'Non autorizzato' });

    // Controlla che il compito sia ancora aperto
    const compito = compiti.find(c => c.compitoId == compitoId);
    if (compito.stato !== 'aperto')
      return res.status(400).json({ error: 'Compito già chiuso' });

    // Controlla che esista una risposta per il gruppo
    const risposta = await dao.getRispostaByGruppo(gruppoId);
    if (!risposta)
      return res.status(400).json({ error: 'Risposta non trovata' });

    // Inserisci valutazione
    await dao.inserisciValutazione(compitoId, gruppoId, voto); 
    // Chiudi il compito
    await dao.chiudiCompito(compitoId);

    res.status(201).json({ message: 'Valutazione inserita e compito chiuso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/classe/stato
// Stato generale della classe per il docente (3 tipi di ordinamento: alfabetico, per voto medio, per stato)
app.get('/api/classe/stato', isLoggedIn, isDocente, async (req, res) => {
  try {
    const ordine = req.query.ordine || 'alfabetico';
    const stato = await dao.getStatoClasse(req.user.utenteId, ordine);
    res.json(stato);
  } catch (err) {
    console.error("ERRORE SQL:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/studenti
// Restituisce tutti gli studenti della classe per il docente
app.get('/api/studenti', isLoggedIn, isDocente, async (req, res) => {
  try {
    const studenti = await dao.getStudenti();
    res.json(studenti);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API STUDENTE

// GET /api/compiti/aperti
// Visualizza i compiti aperti in cui lo studente è coinvolto
app.get('/api/compiti/aperti', isLoggedIn, isStudente, async (req, res) => {
  try {
    const compiti = await dao.getCompitiApertiByStudente(req.user.utenteId);
    res.json(compiti);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/compiti/:compitoId/rispostaStudente
// Invio o modifica risposta ad un compito
app.post('/api/compiti/:compitoId/rispostaStudente', isLoggedIn, isStudente, async (req, res) => {
  try {
    const { compitoId } = req.params;
    const { testo } = req.body;

    // Trova il gruppo dello studente per questo compito
    const gruppoId = await dao.getGruppoStudenteCompito(req.user.utenteId, compitoId);
    if (!gruppoId)
      return res.status(403).json({ error: 'Non fai parte di nessun gruppo per questo compito.' });

    // Controlla che il compito sia ancora aperto
    const compito = await dao.getCompitoById(compitoId);
    if (!compito || compito.stato !== 'aperto')
      return res.status(400).json({ error: 'Compito non aperto.' });

    // Verifica se esiste già una risposta
    const risposta = await dao.getRispostaByGruppo(gruppoId);
    if (risposta) {
      // Modifica la risposta
      await dao.aggiornaRisposta(gruppoId, testo);
      res.json({ message: 'Risposta aggiornata.' });
    } else {
      // Inserisce la nuova risposta per la prima volta
      await dao.inserisciRisposta(gruppoId, testo);
      res.status(201).json({ message: 'Risposta inviata.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /api/compiti/:compitoId/rispostaStudente
// Recupero risposta dello studente per un compito specifico
app.get('/api/compiti/:compitoId/rispostaStudente', isLoggedIn, isStudente, async (req, res) => {
  try {
    const { compitoId } = req.params;
    const gruppoId = await dao.getGruppoStudenteCompito(req.user.utenteId, compitoId);
    if (!gruppoId)
      return res.status(403).json({ error: 'Non fai parte di nessun gruppo per questo compito.' });

    const risposta = await dao.getRispostaByGruppo(gruppoId);
    res.json([{ gruppoId, risposta }]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/valutazioni
// Visualizza le valutazioni ricevute
app.get('/api/valutazioni', isLoggedIn, isStudente, async (req, res) => {
  try {
    // Recupera tutte le valutazioni dei compiti chiusi a cui lo studente ha partecipato
    const valutazioni = await dao.getValutazioniByStudente(req.user.utenteId);
    res.json(valutazioni);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/gruppi/:gruppoId
// Recupera i membri di un gruppo
app.get('/api/gruppi/:gruppoId', isLoggedIn, async (req, res) => {
  try {
    const { gruppoId } = req.params;
    const membri = await dao.getMembriGruppo(gruppoId);
    res.json(membri);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Avvio server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});