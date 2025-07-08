import { useEffect, useState } from 'react';
import { Container, Card, Table, Spinner, Alert, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../../../API/API.mjs';

// Componente che mostra le valutazioni dello studente
function ValutazioniStudente() {
  // Stato per le valutazioni ricevute
  const [valutazioni, setValutazioni] = useState([]);
  // Stato per la media pesata delle valutazioni
  const [media, setMedia] = useState(null);
  // Stato per mostrare il caricamento
  const [loading, setLoading] = useState(true);
  // Stato per eventuali errori
  const [error, setError] = useState('');
  // Hook per navigare tra le pagine
  const navigate = useNavigate();

  // Effetto che carica le valutazioni al montaggio del componente
  useEffect(() => {
    const fetchValutazioni = async () => {
      try {
        // Chiamata API per ottenere valutazioni e media
        const result = await API.getValutazioni();
        setValutazioni(result.valutazioni);
        setMedia(result.media);
      } catch (err) {
        setError('Errore nel caricamento delle valutazioni');
      } finally {
        setLoading(false);
      }
    };
    fetchValutazioni();
  }, []); // Array vuoto: effetto eseguito solo al montaggio

  // Se il caricamento è in corso o c'è un errore, mostra rispettivamente uno spinner o un messaggio di errore
  if (loading) return <div className="text-center my-4"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  // Render principale del componente
  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body>
          {/* Titolo e pulsante indietro */}
          <Row className="align-items-center mb-4">
            <Col>
              <h2 className="mb-0 text-info">
                <i className="bi bi-bar-chart-fill me-2"></i>
                Valutazioni e Media
              </h2>
            </Col>
            <Col xs="auto">
              <Button variant="secondary" onClick={() => navigate(-1)}>
                &larr; Indietro
              </Button>
            </Col>
          </Row>
          {/* Se non ci sono valutazioni mostro un messaggio */}
          {valutazioni.length === 0 ? (
            <Alert variant="info">Non hai ancora ricevuto valutazioni.</Alert>
          ) : (
            <>
              {/* Tabella delle valutazioni */}
              <Table bordered hover>
                <thead>
                  <tr className="table-info">
                    <th>Compito</th>
                    <th>Punteggio</th>
                    <th>Email Docente</th>
                  </tr>
                </thead>
                <tbody>
                  {valutazioni.map((v, idx) => (
                    <tr key={idx}>
                      <td>{v.compitoId}</td>
                      <td>{v.voto}</td>
                      <td>{v.docenteEmail}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {/* Media pesata dei punteggi */}
              <div className="mt-3">
                <strong>Media pesata dei punteggi: </strong>
                {media !== null ? media.toFixed(2) : 'N/A'}
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ValutazioniStudente;