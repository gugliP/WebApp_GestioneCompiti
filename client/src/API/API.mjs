import { Utente, Compito, Gruppo, MembroGruppo, Risposta, Valutazione } from '../Models.mjs';

// URL base del server API
const SERVER_URL = 'http://localhost:3001/api';

// SESSIONE

// Effettua il login con le credenziali fornite
const logIn = async (credentials) => {
  const response = await fetch(SERVER_URL + '/sessions', {
    method: 'POST',
    // inseriamo il credentials per permettere al server di leggere i cookie
    // anche se al primo accesso non sono ancora stati creati
    // e per permettere al server di inviare i cookie di sessione
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify(credentials)
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  }
  else {
    const errDetails = await response.text();
    throw errDetails;
  }
};

// Effettua il logout dell'utente corrente
const logOut = async () => {
  const response = await fetch(SERVER_URL + '/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });

  if (response.ok)
    return null;
};

// Ottiene le informazioni dell'utente loggato (se presente)
const getUserInfo = async () => {
  const response = await fetch(SERVER_URL + '/sessions/current', {
    credentials: 'include',
  });
  const user = await response.json();
  if (response.ok) {
    throw user;
  } else {
    throw user;
  }
};

// DOCENTE

// Crea un nuovo compito con titolo, descrizione e gruppo di studenti
const creaCompito = async ({ titolo, descrizione, gruppo }) => {
  const response = await fetch(`${SERVER_URL}/compiti`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titolo, descrizione, gruppo }),
  });
  if (response.ok) {
    return await response.json();
  } else {
    const errDetails = await response.json();
    throw new Error(errDetails.error || 'Errore creazione compito');
  }
};

// Ottiene la risposta di un gruppo per un compito (per DOCENTE)
const getRispostaCompitoDocente = async (compitoId) => {
  const response = await fetch(`${SERVER_URL}/compiti/${compitoId}/rispostaDocente`, {
    credentials: 'include',
  });
  if (response.ok) {
    const risposte = await response.json();
    return risposte.map(r => ({
      gruppoId: r.gruppoId,
      risposta: r.risposta
        ? new Risposta(r.risposta.rispostaId, r.risposta.gruppoId, r.risposta.testo)
        : null
    }));
  } else {
    throw new Error('Errore caricamento risposte');
  }
};

// Inserisce la valutazione per un compito e chiude il compito ( per DOCENTE)
const inserisciValutazione = async (compitoId, gruppoId, voto) => {
  const response = await fetch(`${SERVER_URL}/compiti/${compitoId}/valutazione`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gruppoId, voto }),
  });
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Errore inserimento valutazione');
  }
};

// Ottiene i compiti aperti del docente
const getCompitiApertiDocente = async () => {
  const response = await fetch(`${SERVER_URL}/compiti/aperti-docente`, {
    credentials: 'include',
  });
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Errore caricamento compiti aperti del docente');
  }
};

// Ottiene lo stato della classe secondo il criterio di ordinamento scelto
const getStatoClasse = async (ordine = 'alfabetico') => {
  const response = await fetch(`${SERVER_URL}/classe/stato?ordine=${ordine}`, {
    credentials: 'include',
  });
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Errore caricamento stato classe');
  }
};

// Ottiene la lista degli studenti per il docente
const getStudenti = async () => {
  const response = await fetch(`${SERVER_URL}/studenti`, {
    credentials: 'include',
  });
  if (response.ok) {
    const studenti = await response.json();
    return studenti.map(s => new Utente(s.utenteId, s.email, s.nome, s.ruolo));
  } else {
    throw new Error('Errore caricamento studenti');
  }
};

// STUDENTE

// Ottiene la lista dei compiti aperti per lo studente
const getCompitiAperti = async () => {
  const response = await fetch(`${SERVER_URL}/compiti/aperti`, {
    credentials: 'include',
  });
  if (response.ok) {
    const compiti = await response.json();
    return compiti.map(c => new Compito(c.compitoId, c.titolo, c.descrizione, c.docenteId, c.stato));
  } else {
    throw new Error('Errore caricamento compiti aperti');
  }
};

// Invia la risposta per un compito specifico
const inviaRisposta = async (compitoId, testo) => {
  const response = await fetch(`${SERVER_URL}/compiti/${compitoId}/rispostaStudente`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testo }),
  });
  if (response.ok) {
    return await response.json();
  } else {
    // Leggi il vero messaggio di errore dal server
    const errDetails = await response.json();
    throw new Error(errDetails.error || 'Errore invio risposta');
  }
};

// Ottiene la risposta per un compito specifico (per STUDENTE)
const getRispostaCompito = async (compitoId) => {
  const response = await fetch(`${SERVER_URL}/compiti/${compitoId}/rispostaStudente`, {
    credentials: 'include',
  });
  if (response.ok) {
    const risposte = await response.json();
    // risposte è un array di { gruppoId, risposta }
    return risposte.map(r => ({
      gruppoId: r.gruppoId,
      risposta: r.risposta
        ? new Risposta(r.risposta.rispostaId, r.risposta.gruppoId, r.risposta.testo)
        : null
    }));
  } else {
    throw new Error('Errore caricamento risposte');
  }
};

// Ottiene le valutazioni per lo studente (e la media)
const getValutazioni = async () => {
  const response = await fetch(`${SERVER_URL}/valutazioni`, {
    credentials: 'include',
  });
  if (response.ok) {
    const result = await response.json();
    // Restituisci le valutazioni e la media
    return {
      valutazioni: result.valutazioni,
      media: result.media
    };
  } else {
    throw new Error('Errore caricamento valutazioni');
  }
};

// Ottiene i membri di un gruppo specifico
const getMembriGruppo = async (gruppoId) => {
  const response = await fetch(`${SERVER_URL}/gruppi/${gruppoId}`, {
    credentials: 'include',
  });
  if (response.ok) {
    const membri = await response.json();
    return membri.map(m => new MembroGruppo(m.gruppoId, m.studenteId));
  } else {
    throw new Error('Errore caricamento membri gruppo');
  }
};

// Esporta tutte le funzioni API come oggetto
const API = {
  logIn, logOut, getUserInfo, creaCompito, getRispostaCompitoDocente, getRispostaCompito, inserisciValutazione, getCompitiApertiDocente,
  getStatoClasse, getStudenti, getCompitiAperti, inviaRisposta, getValutazioni, getMembriGruppo
};
export default API;