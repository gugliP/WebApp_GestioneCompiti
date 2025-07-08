import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Form, Button, Alert, Spinner, Card, Container } from 'react-bootstrap';
import API from '../../../API/API.mjs';

// Componente per inviare o modificare la risposta a un compito
function InviaModificaRisposta() {
  // Recupera l'id del compito dalla route
  const { compitoId } = useParams();
  // Stato per la domanda del compito
  const [domanda, setDomanda] = useState('');
  // Stato per la risposta attuale del gruppo
  const [rispostaAttuale, setRispostaAttuale] = useState('');
  // Stato per la nuova risposta da inviare
  const [nuovaRisposta, setNuovaRisposta] = useState('');
  // Stato per mostrare lo spinner di caricamento
  const [loading, setLoading] = useState(true);
  // Stato per mostrare lo spinner di salvataggio
  const [saving, setSaving] = useState(false);
  // Stato per eventuali errori
  const [error, setError] = useState('');
  // Stato per il messaggio di successo
  const [success, setSuccess] = useState('');
  // Hook per navigare tra le pagine
  const navigate = useNavigate();
  // Stato per bloccare l'invio se il compito è già chiuso
  const [bloccato, setBloccato] = useState(false);

  // Effetto che carica la domanda e la risposta attuale al montaggio o cambio compito
  useEffect(() => {
    const fetchRisposta = async () => {
      try {
        // Recupera tutti i compiti aperti e trova quello giusto
        const compiti = await API.getCompitiAperti();
        const compito = compiti.find(c => c.compitoId == compitoId);
        setDomanda(compito?.descrizione || '');

        // Recupera la risposta attuale del gruppo (se esiste)
        const risposte = await API.getRispostaCompito(compitoId);
        const rispostaGruppo = Array.isArray(risposte) && risposte.find(r => r.risposta)?.risposta?.testo || '';
        setRispostaAttuale(rispostaGruppo);
        setNuovaRisposta(rispostaGruppo);
      } catch (err) {
        setError('Errore nel caricamento della risposta');
      } finally {
        setLoading(false);
      }
    };
    fetchRisposta();
  }, [compitoId]);

  // Gestisce l'invio del form (invio o modifica risposta)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // Invia la risposta tramite API
      await API.inviaRisposta(compitoId, nuovaRisposta);
      setSuccess('Risposta salvata con successo!');
      setRispostaAttuale(nuovaRisposta);
    } catch (err) {
      if (err.message && err.message.includes('Compito non aperto')) {
        setError('Il compito è stato già chiuso dal docente: non puoi più inviare o modificare la risposta.');
        setBloccato(true);
      } else {
        setError('Errore durante il salvataggio della risposta');
      }
    } finally {
      setSaving(false);
    }
  };

  // Se il caricamento è in corso o c'è un errore, mostra rispettivamente uno spinner o un messaggio di errore
  if (loading) return <div className="text-center my-4"><Spinner animation="border" /></div>;

  // Render principale del componente
  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body>
          <h4 className="mb-3">Risposta al Compito</h4>
          {/* Mostra la domanda prima della risposta attuale */}
          <div className="mb-3">
            <strong>Domanda:</strong>
            <div className="border rounded p-2 bg-light mt-1">{domanda || '...'}</div>
          </div>
          {/* Mostra l'errore sopra il form se presente */}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <div className="mb-3">
              <Form.Label>Risposta attuale</Form.Label>
              <div className="border rounded p-2 bg-light mt-1" style={{ minHeight: '90px' }}>
                {rispostaAttuale || 'Ancora nessuna risposta inserita'}
              </div>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Nuova risposta</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={nuovaRisposta}
                onChange={e => setNuovaRisposta(e.target.value)}
                placeholder="Scrivi o modifica la risposta qui..."
                required
                disabled={bloccato}
              />
            </Form.Group>
            <div className="d-flex gap-2">
              <Button type="submit" variant="success" disabled={saving || bloccato}>
                {saving ? 'Salvataggio...' : 'Invia Risposta'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/studente')} disabled={saving}>
                Annulla
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default InviaModificaRisposta;