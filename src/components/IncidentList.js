import React, { useState } from 'react';
import IncidentNotes from './IncidentNotes';

function IncidentList({ incidents, clients, resolveIncident, updateIncidentStatus, addIncidentNote }) {
  const [expandedIncident, setExpandedIncident] = useState(null);
  
  const sortedIncidents = [...incidents].sort((a, b) => 
    new Date(b.startTime) - new Date(a.startTime)
  );

  const getClientById = (clientId) => {
    return clients.find(c => c.id === clientId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Basit risk kontrolü
  const isRiskyClient = (clientId) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentIncidents = incidents.filter(inc => 
      inc.clientId === clientId && 
      new Date(inc.startTime) > thirtyDaysAgo
    );
    
    return recentIncidents.length > 5;
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'new': { label: '🆕 Yeni', color: '#3b82f6' },
      'in_progress': { label: '🔄 Devam Ediyor', color: '#f59e0b' },
      'on_hold': { label: '⏸️ Beklemede', color: '#a855f7' },
      'resolved': { label: '✅ Çözüldü', color: '#10b981' },
      'cancelled': { label: '❌ İptal', color: '#6b7280' },
      'active': { label: '🟡 Aktif', color: '#f59e0b' }
    };
    return statusMap[status] || { label: status, color: '#94a3b8' };
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      'critical': '#ef4444',
      'medium': '#f59e0b',
      'low': '#10b981'
    };
    return colorMap[priority] || '#94a3b8';
  };

  if (sortedIncidents.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', fontSize: '14px' }}>
        {incidents.length === 0 
          ? 'Henüz arıza kaydı bulunmuyor.'
          : 'Filtreye uygun kayıt bulunamadı.'}
      </p>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Müşteri</th>
            <th>Kategori</th>
            <th>Sorun</th>
            <th>Öncelik</th>
            <th>Durum</th>
            <th>Başlangıç</th>
            <th>Süre</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {sortedIncidents.map(incident => {
            const client = getClientById(incident.clientId);
            const isRisky = isRiskyClient(incident.clientId);
            const statusInfo = getStatusInfo(incident.status);
            const priorityColor = getPriorityColor(incident.priority);
            const isExpanded = expandedIncident === incident.id;
            
            return (
              <React.Fragment key={incident.id}>
                <tr style={{ 
                  borderLeft: `4px solid ${priorityColor}`,
                  background: incident.priority === 'critical' ? 'rgba(239, 68, 68, 0.03)' : 'transparent'
                }}>
                  <td>
                    <strong style={{ fontSize: '13px' }}>{client?.name || 'Bilinmiyor'}</strong>
                    <br />
                    <small style={{ fontSize: '11px', color: '#94a3b8' }}>{client?.city}</small>
                    {isRisky && (
                      <span className="badge risky" style={{ marginLeft: '6px' }}>RİSKLİ</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '20px' }}>
                      {incident.category === 'software' && '💻'}
                      {incident.category === 'hardware' && '🖥️'}
                      {incident.category === 'network' && '🌐'}
                      {incident.category === 'other' && '📦'}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', maxWidth: '250px' }}>
                    {incident.description}
                  </td>
                  <td>
                    <span className={`badge ${incident.priority}`} style={{ background: `${priorityColor}20`, color: priorityColor }}>
                      {incident.priority === 'low' && '🟢 Düşük'}
                      {incident.priority === 'medium' && '🟡 Orta'}
                      {incident.priority === 'critical' && '🔴 Kritik'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge`} style={{ background: `${statusInfo.color}20`, color: statusInfo.color }}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px' }}>{formatDate(incident.startTime)}</td>
                  <td style={{ fontSize: '13px', fontWeight: '600' }}>
                    {incident.duration 
                      ? `${incident.duration} dk` 
                      : '-'
                    }
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {incident.status !== 'resolved' && incident.status !== 'cancelled' && (
                        <>
                          <select 
                            onChange={(e) => updateIncidentStatus(incident.id, e.target.value)}
                            value={incident.status}
                            style={{ 
                              padding: '4px 6px', 
                              fontSize: '11px',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0'
                            }}
                          >
                            <option value="new">🆕 Yeni</option>
                            <option value="in_progress">🔄 Devam</option>
                            <option value="on_hold">⏸️ Beklemede</option>
                          </select>
                          
                          <button 
                            onClick={() => resolveIncident(incident.id)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                          >
                            ✓ Çöz
                          </button>
                        </>
                      )}
                      
                      <button 
                        onClick={() => setExpandedIncident(isExpanded ? null : incident.id)}
                        className="btn btn-primary"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                      >
                        {isExpanded ? '▲' : '📝'}
                      </button>
                    </div>
                  </td>
                </tr>
                
                {isExpanded && (
                  <tr>
                    <td colSpan="8" style={{ padding: '14px', background: '#f8fafc' }}>
                      <IncidentNotes 
                        incident={incident}
                        onAddNote={addIncidentNote}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default IncidentList;