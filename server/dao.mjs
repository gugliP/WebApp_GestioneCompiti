import sqlite from 'sqlite3';
import crypto from 'crypto';
import { Utente, Compito, Gruppo, MembroGruppo, Risposta, Valutazione } from './Models.mjs';

import path from 'path';
import { fileURLToPath } from 'url';

// Otteniamo il percorso assoluto del file corrente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Costruiamo il percorso assoluto del file di database
const dbPath = path.join(__dirname, 'compiti.sqlite');

// Apertura del database
const db = new sqlite.Database(dbPath, (err) => {
  if (err) throw err;
  console.log('Connected to SQLite database at:', dbPath);
});

// UTENTI

// Controlla le credenziali di accesso e restituisce l'utente se corrette
export const getUtente = (username, password) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM utenti WHERE username = ?";
    db.get(query, [username], (err, row) => {
      if (err) {
        reject(err);
      }
      else if (row === undefined) {
        resolve(null);
      }
      else {
        // Verifica la password usando scrypt
        crypto.scrypt(password, row.salt, 32, (err, hashedPassword) => {
          if (err) {
            reject(err);
          } else {
            // Confronta le password in modo sicuro
            if (!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword)) {
              resolve(false);
            } else {
              const user = {
                utenteId: row.utenteId,
                email: row.email,
                username: row.username,
                ruolo: row.ruolo
              };
              resolve(user);
            }
          }
        });
      }
    });
  });
};

// COMPITI

// Inserisce un nuovo compito con stato 'aperto'
export function inserisciCompito(titolo, descrizione, docenteId, stato = 'aperto') {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO compiti (titolo, descrizione, docenteId, stato) VALUES (?, ?, ?, ?)';
    db.run(sql, [titolo, descrizione, docenteId, stato], function (err) {
      if (err) reject(err);
      // compitoId appena creato
      else resolve(this.lastID);
    });
  });
}

// Recupera tutti i compiti di un docente
export function getCompitiByDocente(docenteId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM compiti WHERE docenteId = ?';
    db.all(sql, [docenteId], (err, rows) => {
      if (err) reject(err);
      // Se non ci sono compiti restituisce un array vuoto
      else resolve(rows.map(row => new Compito(row.compitoId, row.titolo, row.descrizione, row.docenteId, row.stato)));
    });
  });
}

// Recupera un compito specifico per compitoId
export function getCompitoById(compitoId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM compiti WHERE compitoId = ?';
    db.get(sql, [compitoId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Recupera i compiti aperti per uno studente
export function getCompitiApertiByStudente(studenteId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT c.*
      FROM compiti c
      JOIN gruppi g ON c.compitoId = g.compitoId
      JOIN membri_gruppo m ON g.gruppoId = m.gruppoId
      WHERE m.studenteId = ? AND c.stato = 'aperto'
    `;
    db.all(sql, [studenteId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(row =>
        ({
          compitoId: row.compitoId,
          titolo: row.titolo,
          descrizione: row.descrizione,
          stato: row.stato
        })
      ));
    });
  });
}

// Chiude un compito
// Modifica lo stato del compito a 'chiuso'
export function chiudiCompito(compitoId) {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE compiti SET stato = 'chiuso' WHERE compitoId = ?";
    db.run(sql, [compitoId], function (err) {
      if (err) reject(err);
      // Risultato 1 se compito chiuso con successo, 0 se non esiste
      else resolve(this.changes);
    });
  });
}

// Recupera tutti i compiti aperti creati da un docente
export function getCompitiApertiByDocente(docenteId) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM compiti WHERE docenteId = ? AND stato = 'aperto'";
    db.all(sql, [docenteId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// GRUPPI

// Inserisci un nuovo gruppo per un compito
export function inserisciGruppo(compitoId) {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO gruppi (compitoId) VALUES (?)';
    db.run(sql, [compitoId], function (err) {
      if (err) reject(err);
      // gruppoId appena creato
      else resolve(this.lastID);
    });
  });
}

// Inserisci un membro in un gruppo
export function inserisciMembroGruppo(gruppoId, studenteId) {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO membri_gruppo (gruppoId, studenteId) VALUES (?, ?)';
    db.run(sql, [gruppoId, studenteId], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

// Recupera il gruppo associato a un compito
export function getGruppiByCompito(compitoId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM gruppi WHERE compitoId = ?';
    db.all(sql, [compitoId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(row => new Gruppo(row.gruppoId, row.compitoId)));
    });
  });
}

// Recupera i membri di un gruppo
export function getMembriGruppo(gruppoId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM membri_gruppo WHERE gruppoId = ?';
    db.all(sql, [gruppoId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(row => new MembroGruppo(row.gruppoId, row.studenteId)));
    });
  });
}

// Recupera il gruppo di uno studente per un compito specifico
export function getGruppoStudenteCompito(studenteId, compitoId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT g.gruppoId
      FROM gruppi g
      JOIN membri_gruppo m ON g.gruppoId = m.gruppoId
      WHERE m.studenteId = ? AND g.compitoId = ?
    `;
    db.get(sql, [studenteId, compitoId], (err, row) => {
      if (err) reject(err);
      else resolve(row ? row.gruppoId : null);
    });
  });
}

// CONTROLLO COPPIE STUDENTI

// Utilizzata nella route /api/compiti 
// Controlla se due studenti hanno fatto dei compiti insieme
// Restituisce il numero di compiti che hanno fatto insieme
export function contaCompitiInsieme(studA, studB, docenteId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT COUNT(DISTINCT g.compitoId) AS compiti_insieme
      FROM membri_gruppo m1
      JOIN membri_gruppo m2 ON m1.gruppoId = m2.gruppoId AND m1.studenteId < m2.studenteId
      JOIN gruppi g ON m1.gruppoId = g.gruppoId
      JOIN compiti c ON g.compitoId = c.compitoId
      WHERE m1.studenteId = ? AND m2.studenteId = ? AND c.docenteId = ?
    `;
    db.get(sql, [studA, studB, docenteId], (err, row) => {
      if (err) reject(err);
      else resolve(row ? row.compiti_insieme : 0);
    });
  });
}

// RISPOSTE

// Recupera la risposta di un gruppo
export function getRispostaByGruppo(gruppoId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT * FROM risposte
      WHERE gruppoId = ?
    `;
    db.get(sql, [gruppoId], (err, row) => {
      if (err) reject(err);
      else if (!row) resolve(undefined);
      else resolve(new Risposta(row.rispostaId, row.gruppoId, row.testo, row.data));
    });
  });
}

// Inserisce una risposta per un gruppo
export function inserisciRisposta(gruppoId, testo) {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO risposte (gruppoId, testo) VALUES (?, ?)';
    db.run(sql, [gruppoId, testo], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

// Aggiorna la risposta di un gruppo
export function aggiornaRisposta(gruppoId, testo) {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE risposte SET testo = ? WHERE gruppoId = ?';
    db.run(sql, [testo, gruppoId], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
}

// VALUTAZIONI

// Recupera una valutazione per un compito e un gruppo specifico
export function getValutazioneByCompitoGruppo(compitoId, gruppoId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM valutazioni WHERE compitoId = ? AND gruppoId = ?';
    db.get(sql, [compitoId, gruppoId], (err, row) => {
      if (err) reject(err);
      else if (!row) resolve(undefined);
      else resolve(new Valutazione(row.valutazioneId, row.compitoId, row.gruppoId, row.voto,));
    });
  });
}

// Inserisce una valutazione per un compito e un gruppo specifico
export function inserisciValutazione(compitoId, gruppoId, voto) {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO valutazioni (compitoId, gruppoId, voto) VALUES (?, ?, ?)';
    db.run(sql, [compitoId, gruppoId, voto], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

// Recupera tutte le valutazioni di uno studente
// Calcola la media pesata delle valutazioni in base al numero di studenti nel gruppo
export function getValutazioniByStudente(studenteId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT v.valutazioneId, v.compitoId, v.gruppoId, v.voto, 
             c.titolo, c.descrizione, c.stato,
             u.email AS docenteEmail,
             (SELECT COUNT(*) FROM membri_gruppo WHERE gruppoId = v.gruppoId) as num_studenti
      FROM valutazioni v
      JOIN gruppi g ON v.gruppoId = g.gruppoId
      JOIN compiti c ON v.compitoId = c.compitoId
      JOIN utenti u ON c.docenteId = u.utenteId
      JOIN membri_gruppo m ON g.gruppoId = m.gruppoId
      WHERE m.studenteId = ? AND c.stato = 'chiuso'
    `;
    db.all(sql, [studenteId], (err, rows) => {
      if (err) reject(err);
      else {
        // Calcolo media pesata
        // Esempio calcolo media pesata: voti -> 22, 29, 20, 30
        // gruppi tutti da 2 ma 2 compiti assegnati da un docente e 2 da un altro
        // (22 * 0.5 + 29 * 0.5 + 20 * 0.5 + 30 * 0.5) / (0.5 + 0.5 + 0.5 + 0.5) = (11 + 14.5 + 10 + 15) / 2 = 50.5 / 2 = 25.25
        let somma = 0, pesi = 0;
        rows.forEach(r => {
          const peso = 1 / r.num_studenti;
          somma += r.voto * peso;
          pesi += peso;
        });
        const media = pesi > 0 ? somma / pesi : null;
        resolve({ valutazioni: rows, media });
      }
    });
  });
}

// STATO GENERALE DELLA CLASSE (per docente)

// Recupera lo stato della classe per un docente
export function getStatoClasse(docenteId, ordine = 'alfabetico') {
  let orderBy = 'u.username';
  if (ordine === 'compiti') orderBy = 'totale_compiti DESC';
  if (ordine === 'media') orderBy = 'media DESC';
  // Media pesata calcolata solo sui compiti chiusi del docente:
  // Esempio: studente con 4 compiti di cui solo 2 svolti con 1 docente
  // compito 1: 22 - gruppo da 2 studenti
  // compito 2: 29 - gruppo da 2 studenti
  // media pesata = (22 * 0.5 + 29 * 0.5) / (0.5 + 0.5) = (11 + 14.5) / 1 = 25.5
  const sql = `
    SELECT u.utenteId, u.username, 
      SUM(c.stato = 'aperto') AS aperti,
      SUM(c.stato = 'chiuso') AS chiusi,
      CASE 
        WHEN SUM(CASE WHEN c.stato = 'chiuso' THEN (1.0 / g.num_studenti) ELSE 0 END) > 0
        THEN
          SUM(CASE WHEN c.stato = 'chiuso' THEN v.voto * (1.0 / g.num_studenti) ELSE 0 END)
          /
          SUM(CASE WHEN c.stato = 'chiuso' THEN (1.0 / g.num_studenti) ELSE 0 END)
        ELSE NULL
      END AS media,
      COUNT(c.compitoId) AS totale_compiti
    FROM utenti u
    LEFT JOIN membri_gruppo m ON u.utenteId = m.studenteId
    LEFT JOIN gruppi g2 ON m.gruppoId = g2.gruppoId
    LEFT JOIN compiti c ON g2.compitoId = c.compitoId AND c.docenteId = ?
    LEFT JOIN valutazioni v ON c.compitoId = v.compitoId AND g2.gruppoId = v.gruppoId
    LEFT JOIN (
      SELECT gruppoId, COUNT(*) as num_studenti FROM membri_gruppo GROUP BY gruppoId
    ) g ON g.gruppoId = g2.gruppoId
    WHERE u.ruolo = 'studente'
    GROUP BY u.utenteId
    ORDER BY ${orderBy}
  `;
  return new Promise((resolve, reject) => {
    db.all(sql, [docenteId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Recupera tutti gli studenti
export function getStudenti() {
  return new Promise((resolve, reject) => {
    const sql = "SELECT utenteId, email, username FROM utenti WHERE ruolo = 'studente'";
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}