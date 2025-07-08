import { useContext } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../context/UserContext.jsx';
import API from '../../../API/API.mjs';
import LoginForm from './LoginForm.jsx';

// Componente per la pagina di login del docente
function LoginDocente() {
  // Recupera la funzione di login dal contesto globale
  const { handleLogin } = useContext(UserContext);
  // Hook per navigare tra le pagine
  const navigate = useNavigate();

  // Funzione chiamata quando l'utente invia il form di login
  const onLogin = async (credentials, setError) => {
    try {
      // Prova a fare login tramite API
      const user = await API.logIn(credentials);
      // Controlla che l'utente sia un docente
      if (user.ruolo !== 'docente') {
        setError('Non sei autorizzato come docente.');
        return;
      }
      // Aggiorna lo stato globale con l'utente loggato
      await handleLogin(user);
      // Naviga alla homepage docente
      navigate('/docente');
    } catch (err) {
      setError('Credenziali non valide');
    }
  };

  // Render della pagina di login
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              {/* Form di login riutilizzabile, configurato per il docente */}
              <LoginForm onLogin={onLogin} ruolo="docente" colore="secondary" icona="bi-person-badge" />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginDocente;