import { useContext } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import UserContext from '../context/UserContext.jsx';
import API from '../../API/API.mjs';

// Componente Navbar personalizzato per l'applicazione
function NavbarComponent() {
  // Recupera info sull'utente loggato e funzione di logout dal contesto globale
  const { user, loggedIn, handleLogout } = useContext(UserContext);
  // Hook per navigare tra le pagine
  const navigate = useNavigate();
  // Hook per sapere la pagina attuale (per evidenziare la voce attiva)
  const location = useLocation();

  // Funzione per verificare se una route è attiva
  const isActivePath = (path) => location.pathname === path;

  // Funzione per gestire il logout
  const doLogout = async () => {
    await handleLogout();
    navigate('/');
  };

  // Navbar per la homepage: mostra icona libro e username se loggato
  if (location.pathname === '/') {
    return (
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <i className="bi bi-book" style={{ fontSize: '1.8rem' }}></i>
            {loggedIn && user && (
              <span className="ms-3 fw-bold text-light" style={{ fontSize: '1.1rem' }}>
                {user.username}
              </span>
            )}
          </Navbar.Brand>
          <Nav className="ms-auto align-items-center">
            <Nav.Link
              as={Link}
              to="/"
              active={isActivePath('/')}
              className="fw-bold text-white"
            >
              Home
            </Nav.Link>
            {/* Mostra il pulsante di logout se l'utente è loggato */}
            {loggedIn && (
              <Button variant="outline-danger" className="ms-2" onClick={doLogout}>
                <i className="bi bi-box-arrow-right me-1"></i> Logout
              </Button>
            )}
          </Nav>
        </Container>
      </Navbar>
    );
  }

  // Navbar per le pagine di login: solo "Home" e username se loggato
  if (location.pathname === '/login-studente' || location.pathname === '/login-docente') {
    return (
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <i className="bi bi-book" style={{ fontSize: '1.8rem' }}></i>
            {loggedIn && user && (
              <span className="ms-3 fw-bold text-light" style={{ fontSize: '1.1rem' }}>
                {user.username}
              </span>
            )}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-navbar" />
          <Navbar.Collapse id="main-navbar">
            <Nav className="ms-auto align-items-center">
              <Nav.Link
                as={Link}
                to="/"
                active={isActivePath('/')}
                className="fw-bold text-white"
              >
                Home
              </Nav.Link>
              {/* Mostra il pulsante di logout se l'utente è loggato */}
              {loggedIn && (
                <Button variant="outline-danger" className="ms-2" onClick={doLogout}>
                  <i className="bi bi-box-arrow-right me-1"></i> Logout
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }

  // Navbar base per tutte le altre pagine dell'applicazione
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <i className="bi bi-book" style={{ fontSize: '1.8rem' }}></i>
          {loggedIn && user && (
            <span className="ms-3 fw-bold text-light" style={{ fontSize: '1.1rem' }}>
              {user.username}
            </span>
          )}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto align-items-center">
            <Nav.Link
              as={Link}
              to="/"
              active={isActivePath('/')}
              className="fw-bold text-white"
            >
              Home
            </Nav.Link>
            {/* Mostra il pulsante di logout se l'utente è loggato */}
            {loggedIn && (
              <Button variant="outline-danger" className="ms-2" onClick={doLogout}>
                <i className="bi bi-box-arrow-right me-1"></i> Logout
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;