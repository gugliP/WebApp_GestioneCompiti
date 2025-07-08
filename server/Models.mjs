function Utente(utenteId, email, username, password, ruolo, salt) {
  this.utenteId = utenteId;
  this.email = email;
  this.username = username;
  this.password = password;
  this.ruolo = ruolo;
  this.salt = salt;
}

function Compito(compitoId, titolo, descrizione, docenteId, stato) {
  this.compitoId = compitoId;
  this.titolo = titolo;
  this.descrizione = descrizione;
  this.docenteId = docenteId;
  this.stato = stato;
}

function Gruppo(gruppoId, compitoId) {
  this.gruppoId = gruppoId;
  this.compitoId = compitoId;
}

function MembroGruppo(gruppoId, studenteId) {
  this.gruppoId = gruppoId;
  this.studenteId = studenteId;
}

function Risposta(rispostaId, gruppoId, testo) {
  this.rispostaId = rispostaId;
  this.gruppoId = gruppoId;
  this.testo = testo;
}

function Valutazione(valutazioneId, compitoId, gruppoId, voto) {
  this.valutazioneId = valutazioneId;
  this.compitoId = compitoId;
  this.gruppoId = gruppoId;
  this.voto = voto;
}

export {Utente, Compito, Gruppo, MembroGruppo, Risposta, Valutazione};