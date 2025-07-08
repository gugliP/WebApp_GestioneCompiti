import { useEffect, useState } from 'react';
import { Container, Card, Table, Spinner, Alert, Button, Row, Col } from 'react-bootstrap';
import API from '../../../API/API.mjs';
import { useNavigate } from 'react-router-dom';

// Componente che mostra la lista dei compiti aperti da valutare per il docente
function VisualizzaCompitiAperti() {
  // Stato per la lista dei compiti aperti
  const [compiti, setCompiti] = useState([]);
  // Stato per mostrare lo spinner di caricamento
  const [loading, setLoading] = useState(true);
  // Stato per eventuali errori
  const [error, setError] = useState('');
  // Hook per navigare tra le pagine
  const navigate = useNavigate();

  // Effetto che carica i compiti aperti al montaggio del componente
  useEffect(() => {
    const fetchCompiti = async () => {
      try {
        const result = await API.getCompitiApertiDocente();
        setCompiti(result);
      } catch (err) {
        setError('Errore nel caricamento dei compiti aperti');
      } finally {
        setLoading(false);
      }
    };
    fetchCompiti();
  }, []);

  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body>
          {/* Titolo e pulsante per tornare all'area docente */}
          <Row className="align-items-center mb-4">
            <Col>
              <h2 className="mb-0 text-success">
                <i className="bi bi-journal-text me-2"></i>
                Compiti Aperti da Valutare
              </h2>
            </Col>
            <Col xs="auto">
              <Button variant="info" onClick={() => navigate('/docente')}>
                La tua area
              </Button>
            </Col>
          </Row>
          {loading && <div className="text-center my-4"><Spinner animation="border" /></div>}
          {/* Messaggio di errore */}
          {error && <Alert variant="danger">{error}</Alert>}
          {/* Messaggio se non ci sono compiti */}
          {!loading && !error && compiti.length === 0 && (
            <Alert variant="info">Nessun compito aperto trovato.</Alert>
          )}
          {/* Tabella dei compiti se presenti */}
          {!loading && !error && compiti.length > 0 && (
            <Table bordered hover>
              <thead>
                <tr className="table-success">
                  <th>Titolo</th>
                  <th>Descrizione</th>
                  <th>Stato</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {compiti.map(c => (
                  <tr key={c.compitoId}>
                    <td>{c.titolo}</td>
                    <td>{c.descrizione}</td>
                    <td>{c.stato}</td>
                    <td>
                      {/* Pulsante per andare alla pagina di valutazione del compito */}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/docente/compiti/${c.compitoId}/valuta`)}
                      >
                        Valuta
                      </Button>
                    </td>
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

export default VisualizzaCompitiAperti;