import { useEffect, useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import API from '../../../API/API.mjs';
import { useNavigate } from 'react-router-dom';

// Componente per la creazione di un nuovo compito da parte del docente
function CreaCompito() {
  // Stato per la lista degli studenti disponibili
  const [studenti, setStudenti] = useState([]);
  // Stato per gli studenti selezionati per il gruppo
  const [selezionati, setSelezionati] = useState([]);
  // Stato per il testo della domanda/compito
  const [domanda, setDomanda] = useState('');
  // Stato per mostrare lo spinner di caricamento iniziale
  const [loading, setLoading] = useState(true);
  // Stato per mostrare lo spinner durante il salvataggio
  const [saving, setSaving] = useState(false);
  // Stato per eventuali errori
  const [error, setError] = useState('');
  // Stato per il messaggio di successo
  const [success, setSuccess] = useState('');
  // Hook per navigare tra le pagine
  const navigate = useNavigate();

  // Effetto che carica la lista degli studenti al montaggio del componente
  useEffect(() => {
    const fetchStudenti = async () => {
      try {
        const lista = await API.getStudenti();
        setStudenti(lista);
      } catch (err) {
        setError('Errore nel caricamento degli studenti');
      } finally {
        setLoading(false);
      }
    };
    fetchStudenti();
  }, []);

  // Gestisce il submit del form per creare il compito
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // Controlla che il gruppo abbia tra 2 e 6 studenti
    if (selezionati.length < 2 || selezionati.length > 6) {
      setError('Il gruppo deve avere tra 2 e 6 studenti.');
      return;
    }
    setSaving(true);
    try {
      // Crea il compito tramite API
      await API.creaCompito({
        titolo: domanda,
        descrizione: domanda,
        gruppo: selezionati
      });
      setSuccess('Compito creato con successo!');
      // Non viene effettuato il redirect automatico
    } catch (err) {
      setError(err.message || 'Errore nella creazione del compito');
    } finally {
      setSaving(false);
    }
  };

  // Gestisce la selezione/deselezione degli studenti
  const handleCheck = (studenteId) => {
    setSelezionati(prev =>
      prev.includes(studenteId)
        ? prev.filter(id => id !== studenteId)
        : [...prev, studenteId]
    );
  };

  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body>
          {/* Titolo e pulsante per tornare all'area docente */}
          <Row className="align-items-center mb-4">
            <Col>
              <h2 className="mb-0 text-primary">
                <i className="bi bi-plus-circle me-2"></i>
                Crea Nuovo Compito
              </h2>
            </Col>
            <Col xs="auto">
              <Button variant="info" onClick={() => navigate('/docente')}>
                La tua area
              </Button>
            </Col>
          </Row>
          {loading && <Spinner animation="border" />}
          {/* Messaggio di errore */}
          {error && <Alert variant="danger">{error}</Alert>}
          {/* Messaggio di successo */}
          {success && <Alert variant="success">{success}</Alert>}
          {/* Form per la creazione del compito */}
          {!loading && (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Domanda (testo del compito)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={domanda}
                  onChange={e => setDomanda(e.target.value)}
                  required
                  disabled={saving}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Seleziona tra 2 e 6 studenti</Form.Label>
                <div style={{ maxHeight: 250, overflowY: 'auto', border: '1px solid #eee', borderRadius: 4, padding: 8 }}>
                  {studenti.map(s => (
                    <Form.Check
                      key={s.utenteId}
                      type="checkbox"
                      label={s.username || s.email}
                      checked={selezionati.includes(s.utenteId)}
                      onChange={() => handleCheck(s.utenteId)}
                      disabled={saving}
                    />
                  ))}
                </div>
              </Form.Group>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Creazione...' : 'Crea Compito'}
              </Button>
              <Button variant="secondary" className="ms-2" onClick={() => navigate('/docente')} disabled={saving}>
                Annulla
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default CreaCompito;