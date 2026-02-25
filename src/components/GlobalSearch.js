import React, { useState, useEffect, useRef } from 'react';
import './GlobalSearch.css';
import Icon from './Icon';

function GlobalSearch({ incidents, clients, onNavigate }) {
  const [isOpen, setIsOpen]       = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults]     = useState({ incidents: [], clients: [] });
  const [cursor, setCursor]       = useState(-1);
  const searchRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setIsOpen(true); }
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) { setResults({ incidents: [], clients: [] }); setCursor(-1); return; }
    const term = searchTerm.toLowerCase();
    const loadJSON = (key) => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } };
    const technicians = loadJSON('technicians');

    const filteredIncidents = incidents.filter(inc => {
      const client = clients.find(c => c.id === inc.clientId);
      return (
        inc.description.toLowerCase().includes(term) ||
        inc.category.toLowerCase().includes(term) ||
        (client?.name || '').toLowerCase().includes(term)
      );
    }).slice(0, 6);

    const filteredClients = clients.filter(c =>
      c.name.toLowerCase().includes(term) || (c.city || '').toLowerCase().includes(term)
    ).slice(0, 4);

    setResults({ incidents: filteredIncidents, clients: filteredClients });
    setCursor(-1);
  }, [searchTerm, incidents, clients]);

  const allResults = [
    ...results.incidents.map(i => ({ type: 'incident', data: i })),
    ...results.clients.map(c => ({ type: 'client', data: c })),
  ];

  const handleClose = () => { setIsOpen(false); setSearchTerm(''); setResults({ incidents: [], clients: [] }); setCursor(-1); };

  const handleSelect = (item) => {
    if (item.type === 'incident') onNavigate('incidents');
    else onNavigate('clients');
    handleClose();
  };

  const handleKeyNav = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, allResults.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c - 1, -1)); }
    if (e.key === 'Enter' && cursor >= 0) handleSelect(allResults[cursor]);
  };

  const getPriorityColor = (p) => ({ critical: '#ef4444', medium: '#f59e0b', low: '#10b981' }[p] || '#94a3b8');
  const getStatusLabel   = (s) => ({ new: 'Yeni', in_progress: 'Devam', on_hold: 'Beklemede', resolved: 'Çözüldü', cancelled: 'İptal' }[s] || s);
  const getStatusColor   = (s) => ({ new: '#3b82f6', in_progress: '#f59e0b', on_hold: '#a855f7', resolved: '#10b981', cancelled: '#6b7280' }[s] || '#94a3b8');
  const getCatIcon       = (c) => ({ software: 'bolt', hardware: 'grid', network: 'grid', other: 'clipboard' }[c] || 'clipboard');

  if (!isOpen) {
    return (
      <button className="search-trigger" onClick={() => setIsOpen(true)}>
        <Icon name="search" size={16} />
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
          <span className="search-modal-icon"><Icon name="search" size={18} /></span>
          <input
            ref={inputRef}
            type="text"
            className="search-modal-input"
            placeholder="Arıza açıklaması, müşteri adı, şehir..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyNav}
            autoFocus
          />
          <button className="search-close" onClick={handleClose}>ESC</button>
        </div>

        <div className="search-results">
          {searchTerm && allResults.length > 0 ? (
            <>
              {results.incidents.length > 0 && (
                <div className="search-section">
                  <div className="search-section-title"><Icon name="bolt" size={14} /> Arızalar ({results.incidents.length})</div>
                  {results.incidents.map((incident, idx) => {
                    const client   = clients.find(c => c.id === incident.clientId);
                    const isCursor = cursor === idx;
                    const isOverdue = incident.deadline && incident.status !== 'resolved' && new Date(incident.deadline) < new Date();
                    return (
                      <div
                        key={incident.id}
                        className="search-result-item"
                        style={{ background: isCursor ? 'var(--bg-hover)' : 'transparent', borderRadius: '8px' }}
                        onClick={() => handleSelect({ type: 'incident', data: incident })}
                      >
                        <div className="search-result-icon" style={{ fontSize: '18px' }}>
                          <Icon name={getCatIcon(incident.category)} size={18} />
                        </div>
                        <div className="search-result-content" style={{ flex: 1, minWidth: 0 }}>
                          <div className="search-result-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {incident.description}
                          </div>
                          <div className="search-result-subtitle" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span>{client?.name || '—'}</span>
                            {client?.city && <span>· {client.city}</span>}
                            {isOverdue && <span style={{ color: '#ef4444', fontWeight: '600' }}>· Gecikmiş</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                          <span style={{
                            fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '8px',
                            background: `${getPriorityColor(incident.priority)}20`,
                            color: getPriorityColor(incident.priority),
                          }}>
                            {incident.priority === 'critical' ? 'KRİTİK' : incident.priority === 'medium' ? 'ORTA' : 'DÜŞÜK'}
                          </span>
                          <span style={{
                            fontSize: '10px', padding: '2px 7px', borderRadius: '8px',
                            background: `${getStatusColor(incident.status)}15`,
                            color: getStatusColor(incident.status),
                          }}>
                            {getStatusLabel(incident.status)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {results.clients.length > 0 && (
                <div className="search-section">
                  <div className="search-section-title"><Icon name="grid" size={14} /> Müşteriler ({results.clients.length})</div>
                  {results.clients.map((client, idx) => {
                    const globalIdx  = results.incidents.length + idx;
                    const isCursor   = cursor === globalIdx;
                    const activeInc  = incidents.filter(i => i.clientId === client.id && i.status !== 'resolved' && i.status !== 'cancelled').length;
                    const totalInc   = incidents.filter(i => i.clientId === client.id).length;
                    return (
                      <div
                        key={client.id}
                        className="search-result-item"
                        style={{ background: isCursor ? 'var(--bg-hover)' : 'transparent', borderRadius: '8px' }}
                        onClick={() => handleSelect({ type: 'client', data: client })}
                      >
                        <div className="search-result-icon">
                          <div className="client-avatar-mini">{client.name.charAt(0).toUpperCase()}</div>
                        </div>
                        <div className="search-result-content" style={{ flex: 1 }}>
                          <div className="search-result-title">{client.name}</div>
                          <div className="search-result-subtitle">
                            {client.city && <span><Icon name="pin" size={12} /> {client.city}</span>}
                            {client.phone && <span style={{ marginLeft: '8px' }}><Icon name="phone" size={12} /> {client.phone}</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: '700' }}>{totalInc}</div>
                          <div style={{ fontSize: '10px', color: activeInc > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
                            {activeInc > 0 ? `${activeInc} aktif` : 'arıza yok'}
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
              <span style={{ fontSize: '40px' }}><Icon name="search" size={40} /></span>
              <p>"{searchTerm}" için sonuç bulunamadı</p>
            </div>
          ) : (
            <div className="search-empty">
              <span style={{ fontSize: '40px' }}><Icon name="clipboard" size={40} /></span>
              <p>Arıza veya müşteri aramaya başlayın</p>
              <div className="search-tips">
                <div className="search-tip">Arıza açıklaması veya kategori</div>
                <div className="search-tip">Müşteri adı veya şehir</div>
              </div>
            </div>
          )}
        </div>

        <div className="search-footer">
          <div className="search-shortcuts">
            <span>↑↓ Gezin</span>
            <span>↵ Git</span>
            <span>ESC Kapat</span>
          </div>
          {allResults.length > 0 && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {allResults.length} sonuç
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export default GlobalSearch;