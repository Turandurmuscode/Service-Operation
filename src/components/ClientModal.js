import React, { useState } from 'react';
import './ClientModal.css';
import Icon from './Icon';

function ClientModal({ client, incidents, onClose, onAddNote }) {
  const [note, setNote] = useState('');
  
  if (!client) return null;

  // Bu müşterinin arızaları
  const clientIncidents = incidents.filter(inc => inc.clientId === client.id);

  // İstatistikler
  const totalIncidents = clientIncidents.length;
  const activeIncidents = clientIncidents.filter(inc => 
    inc.status === 'active' || inc.status === 'new' || inc.status === 'in_progress'
  ).length;
  const criticalIncidents = clientIncidents.filter(inc => inc.priority === 'critical').length;
  
  const resolvedIncidents = clientIncidents.filter(inc => inc.duration);
  const avgResolution = resolvedIncidents.length > 0
    ? Math.round(resolvedIncidents.reduce((sum, inc) => sum + inc.duration, 0) / resolvedIncidents.length)
    : 0;

  // Basit risk kontrolü
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentIncidents = clientIncidents.filter(inc => 
    new Date(inc.startTime) > thirtyDaysAgo
  );
  const isRisky = recentIncidents.length > 5 || criticalIncidents > 2;

  const handleAddNote = () => {
    if (!note.trim()) return;
    
    onAddNote(client.id, note);
    setNote('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="client-header-info">
            <div className="client-avatar">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2>{client.name}</h2>
              <p className="client-city"><Icon name="pin" size={14} /> {client.city}</p>
              {isRisky && (
                <span className="badge risky" style={{ marginTop: '4px' }}><Icon name="alert" size={14} style={{ marginRight: 6 }} /> RİSKLİ MÜŞTERİ</span>
              )}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* İstatistikler */}
          <div className="client-stats">
            <div className="client-stat-item">
              <div className="stat-value">{totalIncidents}</div>
              <div className="stat-label">Toplam Arıza</div>
            </div>
            <div className="client-stat-item">
              <div className="stat-value" style={{ color: '#f59e0b' }}>{activeIncidents}</div>
              <div className="stat-label">Aktif Arıza</div>
            </div>
            <div className="client-stat-item">
              <div className="stat-value" style={{ color: '#ef4444' }}>{criticalIncidents}</div>
              <div className="stat-label">Kritik Arıza</div>
            </div>
            <div className="client-stat-item">
              <div className="stat-value" style={{ color: '#10b981' }}>{avgResolution} dk</div>
              <div className="stat-label">Ort. Çözüm</div>
            </div>
          </div>

          {/* Arıza Geçmişi */}
          <div className="incident-history">
            <h3>Arıza Geçmişi ({clientIncidents.length})</h3>
            {clientIncidents.length === 0 ? (
              <p className="empty-state">Henüz arıza kaydı yok.</p>
            ) : (
              <div className="incident-history-list">
                {clientIncidents.slice(0, 5).map(inc => (
                  <div key={inc.id} className="incident-history-item">
                    <div className="incident-history-header">
                      <span className={`badge ${inc.priority}`}></span>
                      <span className={`badge ${inc.status}`}>
                        {inc.status === 'resolved' ? 'Çözüldü' : 'Aktif'}
                      </span>
                      <span className="incident-date">
                        {new Date(inc.startTime).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <div className="incident-description">{inc.description}</div>
                    {inc.duration && (
                      <div className="incident-duration"><Icon name="clock" size={14} /> {inc.duration} dakika</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notlar */}
          <div className="client-notes">
            <h3>Müşteri Notları</h3>
            <div className="note-input">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Müşteri hakkında not ekleyin..."
                rows="3"
              />
              <button onClick={handleAddNote} className="btn btn-primary">
                Not Ekle
              </button>
            </div>
            
            {client.notes && client.notes.length > 0 && (
              <div className="notes-list">
                {client.notes.map((n, idx) => (
                  <div key={idx} className="note-item">
                    <div className="note-text">{n.text}</div>
                    <div className="note-date">
                      {new Date(n.timestamp).toLocaleString('tr-TR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientModal;