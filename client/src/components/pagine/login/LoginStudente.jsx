import { useContext } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../context/UserContext.jsx';
import API from '../../../API/API.mjs';
import LoginForm from './LoginForm.jsx';

// Componente per la pagina di login dello studente
function LoginStudente() {
  // Recupera la funzione di login dal contesto globale
  const { handleLogin } = useContext(UserContext);
  // Hook per navigare tra le pagine
  const navigate = useNavigate();

  // Funzione chiamata quando l'utente invia il form di login
  const onLogin = async (credentials, setError) => {
    // Prova a fare login tramite API
    const user = await API.logIn(credentials);
    // Controlla che l'utente sia uno studente
    if (user.ruolo !== 'studente') {
      setError('Non sei autorizzato come studente.');
      return;
    }
    // Aggiorna lo stato globale con l'utente loggato
    await handleLogin(user);
    // Naviga alla homepage studente
    navigate('/studente');
  };

  // Render della pagina di login
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              {/* Form di login riutilizzabile, configurato per lo studente */}
              <LoginForm onLogin={onLogin} ruolo="studente" colore="primary" icona="bi-person" />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginStudente;