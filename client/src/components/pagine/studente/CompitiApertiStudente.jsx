import { useEffect, useState } from 'react';
import { Table, Alert, Spinner } from 'react-bootstrap';
import API from '../../../API/API.mjs';

// Componente che mostra la tabella dei compiti aperti per lo studente
function CompitiApertiStudente({ compitoSelezionato, onSelectCompito }) {
  // Stato per la lista dei compiti aperti
  const [compiti, setCompiti] = useState([]);
  // Stato per mostrare lo spinner di caricamento
  const [loading, setLoading] = useState(true);
  // Stato per eventuali errori
  const [error, setError] = useState('');
  // Stato per evidenziare la riga su cui si passa il mouse
  const [hoveredRow, setHoveredRow] = useState(null);

  // Effetto che carica i compiti aperti al montaggio del componente
  useEffect(() => {
    const fetchCompiti = async () => {
      try {
        const result = await API.getCompitiAperti();
        setCompiti(result);
      } catch (err) {
        setError('Errore nel caricamento dei compiti aperti');
      } finally {
        setLoading(false);
      }
    };
    fetchCompiti();
  }, []); // Array vuoto: effetto eseguito solo al montaggio

  // Se il caricamento è in corso o c'è un errore, mostra rispettivamente uno spinner o un messaggio di errore
  if (loading) return <div className="text-center my-4"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (compiti.length === 0) return <Alert variant="info">Nessun compito aperto trovato.</Alert>;

  // Render principale del componente
  return (
    <Table bordered hover>
      <thead>
        <tr className="table-primary">
          <th>Titolo</th>
          <th>Descrizione</th>
          <th>Stato</th>
        </tr>
      </thead>
      <tbody>
        {(Array.isArray(compiti) ? compiti : []).map(c => {
          let style = {};
          let className = "";
          // Evidenzia la riga se selezionata
          if (compitoSelezionato === c.compitoId) {
            style.background = '#d1e7dd'; // verde chiaro
            style.borderLeft = '6px solid #0d6efd'; // blu Bootstrap
            className = "fw-bold";
          } else if (hoveredRow === c.compitoId) {
             // Evidenzia la riga al passaggio del mouse
            style.background = '#f1f3f4'; // grigio chiaro
          }
          return (
            <tr
              key={c.compitoId}
              style={{ cursor: 'pointer', ...style }}
              className={className}
              onClick={() => onSelectCompito && onSelectCompito(c.compitoId)}
              onMouseEnter={() => setHoveredRow(c.compitoId)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td>{c.titolo}</td>
              <td>{c.descrizione}</td>
              <td>{c.stato}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

export default CompitiApertiStudente;