import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Container, Card, Spinner, Alert, Form, Button, Row, Col } from 'react-bootstrap';
import API from '../../../API/API.mjs';

// Componente per la pagina di valutazione di un compito da parte del docente
function ValutaCompito() {
  // Recupera l'id del compito dalla route
  const { compitoId } = useParams();
  // Stato per il compito selezionato
  const [compito, setCompito] = useState(null);
  // Stato per la risposta del gruppo
  const [risposta, setRisposta] = useState('');
  // Stato per il voto inserito dal docente
  const [voto, setVoto] = useState('');
  // Stato per mostrare lo spinner di caricamento
  const [loading, setLoading] = useState(true);
  // Stato per mostrare lo spinner di salvataggio
  const [saving, setSaving] = useState(false);
  // Stato per eventuali errori
  const [error, setError] = useState('');
  // Stato per il messaggio di successo
  const [success, setSuccess] = useState('');
  // Stato per bloccare il form dopo la valutazione
  const [valutato, setValutato] = useState(false);
  // Hook per navigare tra le pagine
  const navigate = useNavigate();

  // Effetto che carica i dati del compito e della risposta al montaggio o cambio compito
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Recupera tutti i compiti aperti del docente e trova quello giusto
        const compiti = await API.getCompitiApertiDocente();
        const c = compiti.find(c => c.compitoId == compitoId);
        setCompito(c);

        // Recupera la risposta del gruppo per questo compito
        const risposte = await API.getRispostaCompitoDocente(compitoId);
        setRisposta(risposte[0]?.risposta?.testo || 'Nessuna risposta inviata');
      } catch (err) {
        setError('Errore nel caricamento dei dati');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [compitoId]);

  // Gestisce l'invio della valutazione
  const handleValuta = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // Recupera il gruppoId associato alla risposta
      const risposte = await API.getRispostaCompitoDocente(compitoId);
      const gruppoId = risposte[0]?.gruppoId;
      // Invia la valutazione tramite API
      await API.inserisciValutazione(compitoId, gruppoId, voto);
      setSuccess('Valutazione inserita con successo!');
      // Disabilita tutto dopo il successo, rimane sulla pagina
      setValutato(true);
    } catch (err) {
      setError('Errore durante l’inserimento della valutazione');
    } finally {
      setSaving(false);
    }
  };

  // Se il caricamento è in corso o c'è un errore, mostra rispettivamente uno spinner o un messaggio di errore
  if (loading) return <div className="text-center my-4"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!compito) return <Alert variant="warning">Compito non trovato</Alert>;

  // Render principale del componente
  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body>
          {/* Titolo e pulsante per tornare all'area docente */}
          <Row className="align-items-center mb-4">
            <Col>
              <h3 className="mb-0 text-primary">
                <i className="bi bi-pencil-square me-2"></i>
                Compiti Aperti Da Valutare
              </h3>
            </Col>
            <Col xs="auto">
              <Button variant="info" onClick={() => navigate('/docente')}>
                La tua area
              </Button>
            </Col>
          </Row>
          {/* Messaggio di successo */}
          {success && <Alert variant="success">{success}</Alert>}
          {/* Mostra la domanda del compito */}
          <div className="mb-3">
            <strong>Domanda:</strong>
            <div className="border rounded p-2 bg-light mt-1">{compito?.descrizione}</div>
          </div>
          {/* Mostra la risposta del gruppo */}
          <div className="mb-3">
            <strong>Risposta:</strong>
            <div className="border rounded p-2 bg-light mt-1">{risposta}</div>
          </div>
          {/* Form per inserire la valutazione */}
          <Form onSubmit={handleValuta}>
            <Form.Group className="mb-3" controlId="voto">
              <Form.Label>Voto (0-30)</Form.Label>
              <Form.Control
                type="number"
                min={0}
                max={30}
                value={voto}
                onChange={e => setVoto(e.target.value)}
                required
                disabled={saving || valutato || risposta === 'Nessuna risposta inviata'}
              />
            </Form.Group>
            <div className="d-flex gap-2">
              <Button type="submit" variant="success" disabled={saving || valutato || risposta === 'Nessuna risposta inviata'}>
                {saving ? 'Salvataggio...' : 'Conferma Valutazione'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/docente/compiti-aperti')} disabled={saving || valutato}>
                Annulla
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ValutaCompito;