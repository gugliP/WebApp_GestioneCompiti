import { useEffect, useState } from 'react';
import { Container, Card, Table, Spinner, Alert, Button, Form, Row, Col } from 'react-bootstrap';
import API from '../../../API/API.mjs';
import { useNavigate } from 'react-router-dom';

// Componente che mostra lo stato generale della classe per il docente
function Classi() {
  // Stato per la lista degli studenti e i loro dati
  const [statoClasse, setStatoClasse] = useState([]);
  // Stato per mostrare lo spinner di caricamento
  const [loading, setLoading] = useState(true);
  // Stato per eventuali errori
  const [error, setError] = useState('');
  // Stato per il criterio di ordinamento selezionato
  const [ordine, setOrdine] = useState('alfabetico');
  // Hook per navigare tra le pagine
  const navigate = useNavigate();

  // Effetto che carica lo stato della classe ogni volta che cambia il criterio di ordinamento
  useEffect(() => {
    const fetchStatoClasse = async () => {
      try {
        // Chiamata API per ottenere lo stato della classe secondo l'ordine scelto
        const result = await API.getStatoClasse(ordine);
        setStatoClasse(result);
      } catch (err) {
        setError('Errore nel caricamento dello stato della classe');
      } finally {
        setLoading(false);
      }
    };
    fetchStatoClasse();
  }, [ordine]);

  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body>
          {/* Titolo e pulsante indietro */}
          <Row className="align-items-center mb-4">
            <Col>
              <h2 className="text-info mb-0">
                <i className="bi bi-people-fill me-2"></i>
                Stato Generale della Classe
              </h2>
            </Col>
            <Col xs="auto">
              <Button variant="secondary" onClick={() => navigate(-1)}>
                &larr; Indietro
              </Button>
            </Col>
          </Row>
          {/* Selettore per il criterio di ordinamento */}
          <Form className="mb-3">
            <Form.Label>Ordina per:</Form.Label>
            <Form.Select
              value={ordine}
              onChange={e => setOrdine(e.target.value)}
              style={{ maxWidth: 300 }}
            >
              <option value="alfabetico">Alfabetico</option>
              <option value="compiti">Numero totale compiti</option>
              <option value="media">Media punteggi</option>
            </Form.Select>
          </Form>
          {loading && <div className="text-center my-4"><Spinner animation="border" /></div>}
          {/* Messaggio di errore */}
          {error && <Alert variant="danger">{error}</Alert>}
          {/* Messaggio se non ci sono studenti */}
          {!loading && !error && statoClasse.length === 0 && (
            <Alert variant="info">Nessuno studente trovato.</Alert>
          )}
          {/* Tabella con lo stato della classe */}
          {!loading && !error && statoClasse.length > 0 && (
            <Table bordered hover>
              <thead>
                <tr className="table-info">
                  <th>Studente</th>
                  <th>Compiti Aperti</th>
                  <th>Compiti Chiusi</th>
                  <th>Media Punteggi</th>
                </tr>
              </thead>
              <tbody>
                {statoClasse.map((s, idx) => (
                  <tr key={idx}>
                    <td>{s.nome || s.username || s.email}</td>
                    <td>{s.aperti}</td>
                    <td>{s.chiusi}</td>
                    <td>{s.media !== null ? Number(s.media).toFixed(2) : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Classi;