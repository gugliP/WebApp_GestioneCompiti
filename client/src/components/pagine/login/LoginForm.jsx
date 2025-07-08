import { useState, useContext } from 'react';
import { Alert, Form, Button } from 'react-bootstrap';
import UserContext from '../../context/UserContext.jsx';

// Componente riutilizzabile per il login (sia studente che docente)
function LoginForm({ onLogin, ruolo, colore, icona }) {
    // Stato per username e password inseriti dall'utente
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // Stato per mostrare spinner/bottone disabilitato durante il login
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Stato per eventuali errori di login
    const [error, setError] = useState('');
    // Recupera info dal contesto globale (utente loggato e funzione di logout)
    const { loggedIn, handleLogout } = useContext(UserContext);

    // Funzione chiamata al submit del form di login
    const doLogin = async (e) => {
        e.preventDefault();
        // Se già loggato, mostra alert e blocca il login
        if (loggedIn) {
            setError('Effettua prima il logout per cambiare utente.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            // Chiama la funzione di login passata come prop
            await onLogin({ username, password }, setError);
        } catch (err) {
            setError(err.message || 'Credenziali non valide.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Form di login con titolo e icona */}
            <Form onSubmit={doLogin}>
                <h3 className={`mb-3 text-center text-${colore}`}>
                    <i className={`bi ${icona} me-2`}></i>
                    Login {ruolo.charAt(0).toUpperCase() + ruolo.slice(1)}
                </h3>
                {/* Mostra errore se presente */}
                {error && <Alert variant="danger" className="text-center">{error}</Alert>}
                {/* Campo username */}
                <Form.Group className="mb-3" controlId="username">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                        autoFocus
                        disabled={isSubmitting}
                        autoComplete="username"
                    />
                </Form.Group>
                {/* Campo password */}
                <Form.Group className="mb-4" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        disabled={isSubmitting}
                        autoComplete="current-password"
                    />
                </Form.Group>
                {/* Bottone di login */}
                <div className="d-grid">
                    <Button type="submit" variant={colore} disabled={isSubmitting}>
                        {isSubmitting ? 'Accesso...' : 'Accedi'}
                    </Button>
                </div>
            </Form>
            {/* Se già loggato, mostra bottone di logout */}
            {loggedIn && (
                <div className="d-grid mt-3">
                    <Button variant="outline-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-1"></i>
                        Logout
                    </Button>
                </div>
            )}
        </>
    );
}

export default LoginForm;