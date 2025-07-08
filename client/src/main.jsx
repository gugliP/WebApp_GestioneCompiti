// Entry point dell'applicazione React
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Monta l'app React dentro il div #root nel file index.html
createRoot(document.getElementById('root')).render(
  // StrictMode aiuta a trovare bug e pratiche sconsigliate in sviluppo
  <StrictMode>
    <App />
  </StrictMode>,
)
