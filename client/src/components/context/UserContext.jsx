import { createContext } from 'react';

const UserContext = createContext();
/**
 * UserContext per gestire lo stato di autenticazione e utente in tutta l'app.
 * Da usare con <UserContext.Provider value={...}> nel componente App.
 * Esempio di valore:
 * {
 *   user,         -- oggetto utente autenticato
 *   loggedIn,     -- booleano
 *   handleLogin,  -- funzione per login
 *   handleLogout, -- funzione per logout
 *   message,      -- messaggio di feedback
 *   setMessage    -- funzione per aggiornare il messaggio
 * }
 */

export default UserContext;