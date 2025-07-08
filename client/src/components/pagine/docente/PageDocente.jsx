import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// Componente principale della homepage docente
function PageDocente() {
  // Hook per navigare tra le pagine
  const navigate = useNavigate();

  // Render della pagina principale del docente
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="shadow-sm">
            <Card.Body>
              {/* Titolo della pagina */}
              <h2 className="mb-4 text-secondary">
                <i className="bi bi-people-fill me-2"></i>
                Homepage Docente
              </h2>
              {/* Descrizione introduttiva */}
              <p>
                Benvenuto nell’area dedicata ai docenti.<br />
                Qui potrai vedere lo stato della classe, creare nuovi compiti, valutare risposte e consultare le statistiche degli studenti.
              </p>
              {/* Pulsanti principali per le azioni del docente */}
              <div className="d-flex flex-wrap gap-3 my-4 justify-content-center">
                {/* Pulsante per creare un nuovo compito */}
                <Button variant="primary" size="lg" onClick={() => navigate('/docente/crea-compito')}>
                  Crea nuovo compito
                </Button>
                {/* Pulsante per visualizzare e valutare i compiti aperti */}
                <Button
                  variant="success"
                  size="lg"
                  onClick={() => navigate('/docente/compiti-aperti')}
                >
                  Visualizza e Valuta compiti aperti
                </Button>
              </div>
              {/* Pulsante per accedere alla pagina delle classi */}
              <div className="d-flex justify-content-center mt-4">
                <Button variant="info" size="lg" onClick={() => navigate('/docente/classi')}>
                  La mia classe
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default PageDocente;