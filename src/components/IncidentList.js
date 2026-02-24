import React, { useState, useEffect } from 'react';
import IncidentNotes from './IncidentNotes';
import IncidentAttachments from '../components/IncidentAttachments';


const loadJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
};

function useCountdown(targetDate) {
  const [remaining, setRemaining] = useState(null);
  useEffect(() => {
    if (!targetDate) return;
    const update = () => setRemaining(new Date(targetDate) - new Date());
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [targetDate]);
  return remaining;
}

function CountdownBadge({ deadline, status }) {
  const remaining = useCountdown(deadline);
  if (!deadline || status === 'resolved' || status === 'cancelled' || remaining === null) return null;
  const isOverdue = remaining < 0;
  const absMs = Math.abs(remaining);
  const hours = Math.floor(absMs / 1000 / 60 / 60);
  const minutes = Math.floor((absMs / 1000 / 60) % 60);
  const label = isOverdue ? `🔴 ${hours}s ${minutes}dk gecikti` : hours < 1 ? `🟠 ${minutes}dk kaldı` : hours < 3 ? `🟡 ${hours}s ${minutes}dk kaldı` : `🟢 ${hours}s ${minutes}dk kaldı`;
  const color = isOverdue ? '#ef4444' : hours < 1 ? '#f97316' : hours < 3 ? '#f59e0b' : '#10b981';
  const bg    = isOverdue ? 'rgba(239,68,68,0.15)' : hours < 1 ? 'rgba(249,115,22,0.15)' : hours < 3 ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.12)';
  return (
    <span style={{ display: 'inline-block', marginTop: '4px', padding: '2px 7px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', background: bg, color, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

function IncidentList({ incidents, clients, resolveIncident, updateIncidentStatus, addIncidentNote }) {
  const [expandedIncident, setExpandedIncident] = useState(null);
  const [technicians] = useState(() => loadJSON('technicians', []));

  const sortedIncidents = [...incidents].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  const getClientById = (id) => clients.find(c => c.id === id);
  const getTechnicianById = (id) => technicians.find(t => t.id === id);

  const formatDate = (dateString) => new Date(dateString).toLocaleString('tr-TR', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  });

  const isRiskyClient = (clientId) => {
    const ago30 = new Date(); ago30.setDate(ago30.getDate() - 30);
    return incidents.filter(inc => inc.clientId === clientId && new Date(inc.startTime) > ago30).length > 5;
  };

  const getStatusInfo = (status) => {
    const map = {
      new:         { label: '🆕 Yeni',         color: '#3b82f6' },
      in_progress: { label: '🔄 Devam',         color: '#f59e0b' },
      on_hold:     { label: '⏸️ Beklemede',     color: '#a855f7' },
      resolved:    { label: '✅ Çözüldü',       color: '#10b981' },
      cancelled:   { label: '❌ İptal',         color: '#6b7280' },
      active:      { label: '🟡 Aktif',         color: '#f59e0b' },
    };
    return map[status] || { label: status, color: '#94a3b8' };
  };

  const getPriorityColor = (p) => ({ critical: '#ef4444', medium: '#f59e0b', low: '#10b981' }[p] || '#94a3b8');

  const getRowBg = (inc) => {
    if (inc.status === 'resolved' || inc.status === 'cancelled') return 'transparent';
    if (!inc.deadline) return inc.priority === 'critical' ? 'rgba(239,68,68,0.03)' : 'transparent';
    const diff = new Date(inc.deadline) - new Date();
    if (diff < 0) return 'rgba(239,68,68,0.07)';
    if (diff < 60 * 60 * 1000) return 'rgba(249,115,22,0.06)';
    if (diff < 3 * 60 * 60 * 1000) return 'rgba(245,158,11,0.05)';
    return 'transparent';
  };

  if (sortedIncidents.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', fontSize: '14px' }}>
        {incidents.length === 0 ? 'Henüz arıza kaydı bulunmuyor.' : 'Filtreye uygun kayıt bulunamadı.'}
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
            <th>Teknisyen</th>
            <th>Durum</th>
            <th>Başlangıç</th>
            <th>Son Tarih / Süre</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {sortedIncidents.map(incident => {
            const client     = getClientById(incident.clientId);
            const technician = getTechnicianById(incident.technicianId);
            const isRisky    = isRiskyClient(incident.clientId);
            const statusInfo = getStatusInfo(incident.status);
            const priColor   = getPriorityColor(incident.priority);
            const isExpanded = expandedIncident === incident.id;

            return (
              <React.Fragment key={incident.id}>
                <tr style={{ borderLeft: `4px solid ${priColor}`, background: getRowBg(incident) }}>
                  <td>
                    <strong style={{ fontSize: '13px' }}>{client?.name || 'Bilinmiyor'}</strong>
                    <br />
                    <small style={{ fontSize: '11px', color: '#94a3b8' }}>{client?.city}</small>
                    {isRisky && <span className="badge risky" style={{ marginLeft: '6px' }}>RİSKLİ</span>}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '20px' }}>
                      {incident.category === 'software' && '💻'}
                      {incident.category === 'hardware' && '🖥️'}
                      {incident.category === 'network'  && '🌐'}
                      {incident.category === 'other'    && '📦'}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', maxWidth: '220px' }}>{incident.description}</td>
                  <td>
                    <span className={`badge ${incident.priority}`} style={{ background: `${priColor}20`, color: priColor }}>
                      {incident.priority === 'low' && '🟢 Düşük'}
                      {incident.priority === 'medium' && '🟡 Orta'}
                      {incident.priority === 'critical' && '🔴 Kritik'}
                    </span>
                  </td>

                  {/* Teknisyen kolonu */}
                  <td>
                    {technician ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                          width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                          background: '#3b82f620', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: '700', color: '#3b82f6',
                        }}>
                          {technician.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '600' }}>{technician.name}</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>{technician.role}</div>
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>—</span>
                    )}
                  </td>

                  <td>
                    <span className="badge" style={{ background: `${statusInfo.color}20`, color: statusInfo.color }}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px' }}>{formatDate(incident.startTime)}</td>
                  <td style={{ fontSize: '12px' }}>
                    {incident.status === 'resolved' || incident.status === 'cancelled' ? (
                      <span style={{ fontWeight: '600' }}>{incident.duration ? `${incident.duration} dk` : '-'}</span>
                    ) : incident.deadline ? (
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: '11px' }}>{formatDate(incident.deadline)}</div>
                        <CountdownBadge deadline={incident.deadline} status={incident.status} />
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>-</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {incident.status !== 'resolved' && incident.status !== 'cancelled' && (
                        <>
                          <select
                            onChange={(e) => updateIncidentStatus(incident.id, e.target.value)}
                            value={incident.status}
                            style={{ padding: '4px 6px', fontSize: '11px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                          >
                            <option value="new">🆕 Yeni</option>
                            <option value="in_progress">🔄 Devam</option>
                            <option value="on_hold">⏸️ Bekle</option>
                          </select>
                          <button onClick={() => resolveIncident(incident.id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                            ✓ Çöz
                          </button>
                        </>
                      )}
                      <button onClick={() => setExpandedIncident(isExpanded ? null : incident.id)} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                        {isExpanded ? '▲' : '📝'}
                      </button>
                    </div>
                  </td>
                </tr>

                {isExpanded && (
                  <tr>
                    <td colSpan="9" style={{ padding: '14px', background: '#f8fafc' }}>
                      <IncidentNotes incident={incident} onAddNote={addIncidentNote} />
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