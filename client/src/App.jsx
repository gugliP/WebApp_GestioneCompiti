import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// API
import API from './API/API.mjs';

// Modelli
import { Utente as User } from './Models.mjs';

// Componenti principali dell'applicazione
import ValutazioniStudente from './components/pagine/studente/ValutazioniStudente.jsx';
import PageDocente from './components/pagine/docente/PageDocente.jsx';
import PageStudente from './components/pagine/studente/PageStudente.jsx';
import UserContext from './components/context/UserContext.jsx';
import NavbarComponent from './components/layout/Navbar.jsx';
import Homepage from './components/pagine/homepage/homePage.jsx';
import LoginStudente from './components/pagine/login/LoginStudente.jsx';
import LoginDocente from './components/pagine/login/LoginDocente.jsx';
import VisualizzaCompitiAperti from './components/pagine/docente/VisualizzaCompitiAperti.jsx';
import ValutaCompito from './components/pagine/docente/ValutaCompito.jsx';
import Classi from './components/pagine/docente/Classi.jsx';
import CreaCompito from './components/pagine/docente/CreaCompito.jsx';
import InviaModificaRisposta from './components/pagine/studente/InviaModificaRisposta.jsx';

// Bootstrap e icone CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


function App() {

  // Stato per gestire l'utente autenticato e i messaggi globali
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');

  // All'avvio dell'app, controlla se l'utente è già autenticato tramite cookie/sessione
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userInfo = await API.getUserInfo();
        setUser(new User(userInfo.utenteId, userInfo.email, userInfo.username, userInfo.ruolo));
        setLoggedIn(true);

      } catch (authError) {
        // Utente non autenticato, normale funzionamento all'avvio
        setUser(null);
        setLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  // Funzione per gestire il login: aggiorna stato utente e mostra messaggio di benvenuto
  const handleLogin = async (userInfo) => {
    const newUser = new User(
      userInfo.utenteId,
      userInfo.email,
      userInfo.username,
      '', // password non viene salvata lato client
      userInfo.ruolo,
      ''  // salt non viene salvato lato client 
    );
    setUser(newUser);
    setLoggedIn(true);
    setMessage({ type: 'success', msg: `Benvenuto, ${newUser.username}!` });
  };

   // Funzione per gestire il logout: resetta stato utente e mostra messaggio
  const handleLogout = async () => {
    try {
      await API.logOut();
      setUser(null);
      setLoggedIn(false);
      setMessage({ type: 'info', msg: 'Logout effettuato con successo' });
    } catch (error) {
      setMessage({ type: 'warning', msg: 'Errore durante il logout, ma sei stato disconnesso lo stesso' });
      setUser(null);
      setLoggedIn(false);
    }
  };

  return (
    // UserContext fornisce user, login/logout e messaggi globali a tutti i componenti figli
    <UserContext.Provider value={{
      user, loggedIn, handleLogin, handleLogout, message, setMessage
    }}>
      <Router>
        {/* Navbar visibile su tutte le pagine */}
        <NavbarComponent />
        <Routes>
          {/* Route Homepage */}
          <Route path="/" element={<Homepage />} />
          {/* Route login studente */}
          <Route path="/login-studente" element={<LoginStudente />} />
          {/* Route login docente */}
          <Route path="/login-docente" element={<LoginDocente />} />

          {/* Route protetta: area docente */}
          <Route
            path="/docente"
            element={loggedIn && user?.ruolo === 'docente' ? <PageDocente /> : <Navigate replace to="/login-docente" />}
          />

          {/* Route protetta: area studente */}
          <Route
            path="/studente"
            element={loggedIn && user?.ruolo === 'studente' ? <PageStudente /> : <Navigate replace to="/login-studente" />}
          />

          {/* Route protetta: valutazioni dello studente */}
          <Route
            path="/studente/valutazioni"
            element={loggedIn && user?.ruolo === 'studente' ? <ValutazioniStudente /> : <Navigate replace to="/login-studente" />}
          />

          {/* Route protetta: visualizza compiti aperti del docente */}
          <Route
            path="/docente/compiti-aperti"
            element={loggedIn && user?.ruolo === 'docente' ? <VisualizzaCompitiAperti /> : <Navigate replace to="/login-docente" />}
          />

          {/* Route protetta: valuta compito */}
          <Route
            path="/docente/compiti/:compitoId/valuta"
            element={loggedIn && user?.ruolo === 'docente' ? <ValutaCompito /> : <Navigate replace to="/login-docente" />}
          />

          {/* Route protetta: visualizza classe del docente */}
          <Route
            path="/docente/classi"
            element={loggedIn && user?.ruolo === 'docente' ? <Classi /> : <Navigate replace to="/login-docente" />}
          />

          {/* Route protetta: creare un nuovo compito */}
          <Route
            path="/docente/crea-compito"
            element={loggedIn && user?.ruolo === 'docente' ? <CreaCompito /> : <Navigate replace to="/login-docente" />}
          />

          {/* Route protetta: inviare o modificare una risposta del compito */}
          <Route
            path="/studente/compiti/:compitoId/rispostaStudente"
            element={loggedIn && user?.ruolo === 'studente' ? <InviaModificaRisposta /> : <Navigate replace to="/login-studente" />}
          />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;