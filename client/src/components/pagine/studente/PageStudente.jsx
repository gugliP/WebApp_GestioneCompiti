import { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import CompitiApertiStudente from './CompitiApertiStudente.jsx';
import { useNavigate } from 'react-router-dom';

// Componente principale della homepage studente
function PageStudente() {
  // Stato per mostrare/nascondere la tabella dei compiti aperti
  const [showCompiti, setShowCompiti] = useState(false);
  // Stato per tenere traccia del compito selezionato nella tabella
  const [compitoSelezionato, setCompitoSelezionato] = useState(null);
  // Hook per navigare tra le pagine
  const navigate = useNavigate();

  // Render principale del componente
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="shadow-sm">
            <Card.Body>
              {/* Titolo della pagina */}
              <h2 className="mb-4 text-primary">
                <i className="bi bi-person me-2"></i>
                Homepage Studente
              </h2>
              {/* Descrizione introduttiva */}
              <p>
                Benvenuto nell’area dedicata agli studenti.<br />
                Qui potrai vedere i compiti aperti a cui partecipi, inviare o modificare le risposte e consultare le valutazioni ricevute.
              </p>
              {/* Pulsanti principali */}
              <div className="d-flex flex-wrap gap-3 my-4 justify-content-center">
                {/* Mostra/Nascondi compiti aperti */}
                <Button variant="primary" size="lg" onClick={() => setShowCompiti(!showCompiti)}>
                  {showCompiti ? 'Nascondi Compiti Aperti' : 'Visualizza Compiti Aperti'}
                </Button>
                {/* Vai alla pagina delle valutazioni */}
                <Button
                  variant="info"
                  size="lg"
                  onClick={() => navigate('/studente/valutazioni')}
                >
                  Visualizza Valutazioni e Media
                </Button>
              </div>
              {/* Mostra la tabella solo se showCompiti è true */}
              {showCompiti && (
                <div className="mt-4">
                  {/* Tabella dei compiti aperti */}
                  <CompitiApertiStudente
                    compitoSelezionato={compitoSelezionato}
                    onSelectCompito={setCompitoSelezionato}
                  />
                  {/* Pulsante sotto la tabella, visibile solo se si seleziona un compito aperto */}
                  {compitoSelezionato && (
                    <div className="d-flex justify-content-center mt-4">
                      <Button
                        variant="success"
                        size="lg"
                        onClick={() => navigate(`/studente/compiti/${compitoSelezionato}/rispostaStudente`)}
                      >
                        Invia/Modifica Risposta
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default PageStudente;