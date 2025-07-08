import { useContext } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../context/UserContext.jsx';

// Componente principale della homepage dell'applicazione
function Homepage() {
  // Hook per navigare tra le pagine
  const navigate = useNavigate();
  // Recupera info sull'utente loggato dal contesto globale
  const { loggedIn, user } = useContext(UserContext);

  return (
    <Container>
      {/* Titolo della pagina */}
      <Row className="text-center py-5">
        <Col>
          <h1 className="display-4 fw-bold text-primary mb-4">
            <i className="bi bi-pen-fill me-3"></i>
            Applicazione Compiti
          </h1>
        </Col>
      </Row>
      {/* Sezione con le due aree: docente e studente */}
      <Row className="justify-content-center">
        {/* Area Docente */}
        <Col xs={12} md={5} className="mb-4 mb-md-0">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <h4 className="mb-3 text-secondary text-center">
                Area Docente
              </h4>
              <p className="text-muted text-center mb-4">
                Accedi come docente per creare e valutare i compiti della tua classe.
              </p>
              <Button
                variant="secondary"
                size="lg"
                className="w-100"
                style={{ maxWidth: 220 }}
                onClick={() => navigate('/login-docente')}
              >
                Login Docente
              </Button>
            </Card.Body>
          </Card>
        </Col>
        {/* Area Studente */}
        <Col xs={12} md={5}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <h4 className="mb-3 text-primary text-center">
                Area Studente
              </h4>
              <p className="text-muted text-center mb-4">
                Accedi come studente per svolgere i compiti assegnati e vedere le valutazioni.
              </p>
              <Button
                variant="primary"
                size="lg"
                className="w-100"
                style={{ maxWidth: 220 }}
                onClick={() => navigate('/login-studente')}
              >
                Login Studente
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Se l'utente è già loggato, mostra un pulsante per tornare alla propria area */}
      {loggedIn && user && (
        <Row className="justify-content-center mt-4">
          <Col xs={12} md={6} className="d-flex justify-content-center">
            <Button
              variant="success"
              size="lg"
              className="w-100"
              style={{ maxWidth: 300 }}
              onClick={() => navigate(user.ruolo === 'studente' ? '/studente' : '/docente')}
            >
              Torna alla tua area
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default Homepage;