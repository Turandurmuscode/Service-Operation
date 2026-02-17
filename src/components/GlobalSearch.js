import React, { useState, useEffect, useRef } from 'react';
import './GlobalSearch.css';

function GlobalSearch({ incidents, clients, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState({ incidents: [], clients: [] });
  const searchRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K ile arama aç
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      // ESC ile kapat
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults({ incidents: [], clients: [] });
      return;
    }

    const term = searchTerm.toLowerCase();

    const filteredIncidents = incidents
      .filter(inc => 
        inc.description.toLowerCase().includes(term) ||
        inc.category.toLowerCase().includes(term) ||
        inc.status.toLowerCase().includes(term)
      )
      .slice(0, 5);

    const filteredClients = clients
      .filter(client =>
        client.name.toLowerCase().includes(term) ||
        client.city.toLowerCase().includes(term)
      )
      .slice(0, 5);

    setResults({ incidents: filteredIncidents, clients: filteredClients });
  }, [searchTerm, incidents, clients]);

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
    setResults({ incidents: [], clients: [] });
  };

  const handleIncidentClick = (incident) => {
    onNavigate('incidents');
    handleClose();
  };

  const handleClientClick = (client) => {
    onNavigate('clients');
    handleClose();
  };

  if (!isOpen) {
    return (
      <button className="search-trigger" onClick={() => setIsOpen(true)}>
        <span className="search-icon">🔍</span>
        <span className="search-text">Ara...</span>
        <span className="search-shortcut">⌘K</span>
      </button>
    );
  }

  return (
    <>
      <div className="search-overlay" onClick={handleClose} />
      <div className="search-modal" ref={searchRef}>
        <div className="search-input-wrapper">
          <span className="search-modal-icon">🔍</span>
          <input
            type="text"
            className="search-modal-input"
            placeholder="Arıza veya müşteri ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <button className="search-close" onClick={handleClose}>ESC</button>
        </div>

        <div className="search-results">
          {searchTerm && (results.incidents.length > 0 || results.clients.length > 0) ? (
            <>
              {results.incidents.length > 0 && (
                <div className="search-section">
                  <div className="search-section-title">🔧 Arızalar</div>
                  {results.incidents.map(incident => {
                    const client = clients.find(c => c.id === incident.clientId);
                    return (
                      <div
                        key={incident.id}
                        className="search-result-item"
                        onClick={() => handleIncidentClick(incident)}
                      >
                        <div className="search-result-icon">
                          {incident.priority === 'critical' ? '🔴' : 
                           incident.priority === 'medium' ? '🟡' : '🟢'}
                        </div>
                        <div className="search-result-content">
                          <div className="search-result-title">{incident.description}</div>
                          <div className="search-result-subtitle">
                            {client?.name} • {incident.status === 'resolved' ? 'Çözüldü' : 'Aktif'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {results.clients.length > 0 && (
                <div className="search-section">
                  <div className="search-section-title">👥 Müşteriler</div>
                  {results.clients.map(client => {
                    const clientIncidents = incidents.filter(inc => inc.clientId === client.id);
                    return (
                      <div
                        key={client.id}
                        className="search-result-item"
                        onClick={() => handleClientClick(client)}
                      >
                        <div className="search-result-icon">
                          <div className="client-avatar-mini">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="search-result-content">
                          <div className="search-result-title">{client.name}</div>
                          <div className="search-result-subtitle">
                            {client.city} • {clientIncidents.length} arıza
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : searchTerm ? (
            <div className="search-empty">
              <span style={{ fontSize: '48px' }}>🔍</span>
              <p>Sonuç bulunamadı</p>
            </div>
          ) : (
            <div className="search-empty">
              <span style={{ fontSize: '48px' }}>💡</span>
              <p>Arıza veya müşteri aramaya başlayın</p>
              <div className="search-tips">
                <div className="search-tip">💻 Yazılım, donanım, network</div>
                <div className="search-tip">🔴 Kritik, orta, düşük</div>
                <div className="search-tip">👥 Müşteri isimleri</div>
              </div>
            </div>
          )}
        </div>

        <div className="search-footer">
          <div className="search-shortcuts">
            <span>↑↓ Gezin</span>
            <span>↵ Seç</span>
            <span>ESC Kapat</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default GlobalSearch;