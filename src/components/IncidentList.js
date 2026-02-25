import React, { useState, useEffect } from 'react';
import IncidentNotes from './IncidentNotes';
import Icon from './Icon';

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
  const label = isOverdue
    ? `${hours}s ${minutes}dk gecikti`
    : hours < 1
    ? `${minutes}dk kaldı`
    : `${hours}s ${minutes}dk kaldı`;
  const color = isOverdue ? '#ef4444' : hours < 1 ? '#f97316' : hours < 3 ? '#f59e0b' : '#10b981';
  const bg = isOverdue
    ? 'rgba(239,68,68,0.15)'
    : hours < 1
    ? 'rgba(249,115,22,0.15)'
    : hours < 3
    ? 'rgba(245,158,11,0.15)'
    : 'rgba(16,185,129,0.12)';
  return (
    <span style={{
      padding: '2px 7px', borderRadius: '10px', fontSize: '11px',
      fontWeight: '600', background: bg, color, whiteSpace: 'nowrap',
    }}>
      <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 10, background: isOverdue ? '#ef4444' : hours < 1 ? '#f97316' : hours < 3 ? '#f59e0b' : '#10b981', marginRight: 8, verticalAlign: 'middle' }} /> {label}
    </span>
  );
}

// ── DÜZENLEME MODALI ──────────────────────────────────────────────
function EditIncidentModal({ incident, clients, technicians, onSave, onClose }) {
  const [priority,     setPriority]     = useState(incident.priority || 'low');
  const [technicianId, setTechnicianId] = useState(incident.technicianId ? String(incident.technicianId) : '');
  const [deadline,     setDeadline]     = useState(() => {
    if (!incident.deadline) return '';
    const d = new Date(incident.deadline);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [description, setDescription] = useState(incident.description || '');
  const [category,    setCategory]    = useState(incident.category || 'software');

  const client = clients.find(c => c.id === incident.clientId);

  const handleSave = () => {
    if (!description.trim()) return;
    onSave({
      ...incident,
      description: description.trim(),
      category,
      priority,
      technicianId: technicianId ? parseInt(technicianId) : null,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      slaDeadline: { critical: 120, medium: 480, low: 1440 }[priority],
    });
  };

  const inp = {
    width: '100%', padding: '9px 12px', borderRadius: '8px', fontSize: '13px',
    border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)',
    color: 'var(--text-primary)', boxSizing: 'border-box', marginTop: '5px',
  };
  const label = { fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', display: 'block' };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
          borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px' }}>Arıza Düzenle</h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
              {client?.name} · {new Date(incident.startTime).toLocaleDateString('tr-TR')}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--text-secondary)', lineHeight: 1, padding: 0 }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={label}>Açıklama</label>
            <textarea
              style={{ ...inp, minHeight: '80px', resize: 'vertical' }}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label style={label}>Kategori</label>
            <select style={inp} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="software">Yazılım</option>
              <option value="hardware">Donanım</option>
              <option value="network">Network</option>
              <option value="other">Diğer</option>
            </select>
          </div>

          <div>
            <label style={label}>Öncelik</label>
            <select style={inp} value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="low">Düşük — 24 saat SLA</option>
              <option value="medium">Orta — 8 saat SLA</option>
              <option value="critical">Kritik — 2 saat SLA</option>
            </select>
          </div>

          <div>
            <label style={label}>Teknisyen</label>
            {technicians.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>
                Ayarlar sayfasından teknisyen ekleyebilirsiniz.
              </p>
            ) : (
              <select style={inp} value={technicianId} onChange={e => setTechnicianId(e.target.value)}>
                <option value="">Atanmamış</option>
                {technicians.map(t => (
                  <option key={t.id} value={String(t.id)}>{t.name} — {t.role}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label style={label}>Deadline</label>
            <input
              type="datetime-local"
              style={inp}
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>İptal</button>
          <button onClick={handleSave} className="btn btn-primary" style={{ flex: 2 }}>Kaydet</button>
        </div>
      </div>
    </div>
  );
}

// ── KART GÖRÜNÜMÜ ─────────────────────────────────────────────────
function IncidentCard({ incident, client, technician, resolveIncident, updateIncidentStatus, addIncidentNote, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const priColor = { critical: '#ef4444', medium: '#f59e0b', low: '#10b981' }[incident.priority] || '#94a3b8';
  const priLabel = { critical: 'Kritik', medium: 'Orta', low: 'Düşük' }[incident.priority] || incident.priority;
  const statusMap = {
    new:         { label: 'Yeni',         color: '#3b82f6' },
    in_progress: { label: 'Devam Ediyor', color: '#f59e0b' },
    on_hold:     { label: 'Beklemede',    color: '#a855f7' },
    resolved:    { label: 'Çözüldü',      color: '#10b981' },
    cancelled:   { label: 'İptal',        color: '#6b7280' },
  };
  const statusInfo = statusMap[incident.status] || { label: incident.status, color: '#94a3b8' };
  const isOverdue = incident.deadline
    && incident.status !== 'resolved'
    && incident.status !== 'cancelled'
    && new Date(incident.deadline) < new Date();
  const catIcon = { software: 'laptop', hardware: 'desktop', network: 'network', other: 'box' }[incident.category] || 'box';

  return (
    <div style={{
      borderRadius: '12px', border: '1px solid var(--border)',
      borderLeft: `4px solid ${isOverdue ? '#ef4444' : priColor}`,
      background: isOverdue ? 'rgba(239,68,68,0.04)' : 'var(--bg-surface)',
      padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px', lineHeight: '1.4' }}>
            {incident.description}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            <strong>{client?.name || 'Bilinmiyor'}</strong>
            {client?.city && ` · ${client.city}`}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: `${priColor}20`, color: priColor }}>
            {priLabel}
          </span>
          <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: `${statusInfo.color}15`, color: statusInfo.color }}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Icon name={catIcon} size={14} /> {new Date(incident.startTime).toLocaleDateString('tr-TR')}
        </span>
        {technician && (
          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: '#3b82f615', color: '#3b82f6', fontWeight: '600' }}>
            {technician.name}
          </span>
        )}
        {incident.deadline && (
          <CountdownBadge deadline={incident.deadline} status={incident.status} />
        )}
        {incident.duration && (
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{incident.duration}dk</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {incident.status !== 'resolved' && incident.status !== 'cancelled' && (
          <>
            <select
              value={incident.status}
              onChange={e => updateIncidentStatus(incident.id, e.target.value)}
              style={{
                padding: '4px 8px', fontSize: '11px', borderRadius: '6px',
                border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                color: 'var(--text-primary)', flex: 1,
              }}
            >
              <option value="new">Yeni</option>
              <option value="in_progress">Devam</option>
              <option value="on_hold">Bekle</option>
            </select>
            <button
              onClick={() => resolveIncident(incident.id)}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '11px' }}
            >
              Çöz
            </button>
          </>
        )}
        <button
          onClick={() => onEdit(incident)}
          className="btn btn-secondary"
          style={{ padding: '4px 10px', fontSize: '11px' }}
        >
          Düzenle
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="btn btn-primary"
          style={{ padding: '4px 10px', fontSize: '11px' }}
        >
          {expanded ? 'Gizle' : 'Notlar'}
        </button>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          <IncidentNotes incident={incident} onAddNote={addIncidentNote} />
        </div>
      )}
    </div>
  );
}

// ── ANA BİLEŞEN ──────────────────────────────────────────────────
function IncidentList({ incidents, clients, resolveIncident, updateIncidentStatus, addIncidentNote, updateIncident }) {
  const [expandedIncident, setExpandedIncident] = useState(null);
  const [viewMode,         setViewMode]         = useState('table');
  const [editingIncident,  setEditingIncident]  = useState(null);
  const [technicians]                           = useState(() => loadJSON('technicians', []));

  const sorted            = [...incidents].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  const getClient         = id => clients.find(c => c.id === id);
  const getTechnician     = id => technicians.find(t => t.id === id);

  const formatDate = ds => new Date(ds).toLocaleString('tr-TR', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });

  const isRiskyClient = clientId => {
    const ago30 = new Date(); ago30.setDate(ago30.getDate() - 30);
    return incidents.filter(i => i.clientId === clientId && new Date(i.startTime) > ago30).length > 5;
  };

  const statusInfo = s => ({
    new:         { label: 'Yeni',      color: '#3b82f6' },
    in_progress: { label: 'Devam',     color: '#f59e0b' },
    on_hold:     { label: 'Beklemede', color: '#a855f7' },
    resolved:    { label: 'Çözüldü',   color: '#10b981' },
    cancelled:   { label: 'İptal',     color: '#6b7280' },
  }[s] || { label: s, color: '#94a3b8' });

  const priColor = p => ({ critical: '#ef4444', medium: '#f59e0b', low: '#10b981' }[p] || '#94a3b8');

  const rowBg = inc => {
    if (inc.status === 'resolved' || inc.status === 'cancelled') return 'transparent';
    if (!inc.deadline) return inc.priority === 'critical' ? 'rgba(239,68,68,0.03)' : 'transparent';
    const diff = new Date(inc.deadline) - new Date();
    if (diff < 0)                   return 'rgba(239,68,68,0.07)';
    if (diff < 3600000)             return 'rgba(249,115,22,0.06)';
    if (diff < 3 * 3600000)        return 'rgba(245,158,11,0.05)';
    return 'transparent';
  };

  const handleSave = updated => {
    if (updateIncident) updateIncident(updated);
    setEditingIncident(null);
  };

  const toggleBtn = active => ({
    padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    fontSize: '12px', fontWeight: '600',
    background: active ? 'var(--accent)' : 'var(--bg-elevated)',
    color: active ? '#000' : 'var(--text-secondary)',
  });

  if (sorted.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', fontSize: '14px' }}>
        {incidents.length === 0 ? 'Henüz arıza kaydı bulunmuyor.' : 'Filtreye uygun kayıt bulunamadı.'}
      </p>
    );
  }

  return (
    <div>
      {editingIncident && (
        <EditIncidentModal
          incident={editingIncident}
          clients={clients}
          technicians={technicians}
          onSave={handleSave}
          onClose={() => setEditingIncident(null)}
        />
      )}

      {/* Görünüm toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginBottom: '12px' }}>
        <button style={toggleBtn(viewMode === 'table')} onClick={() => setViewMode('table')}>Tablo</button>
        <button style={toggleBtn(viewMode === 'cards')} onClick={() => setViewMode('cards')}>Kartlar</button>
      </div>

      {/* KART GÖRÜNÜMÜ */}
      {viewMode === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
          {sorted.map(inc => (
            <IncidentCard
              key={inc.id}
              incident={inc}
              client={getClient(inc.clientId)}
              technician={getTechnician(inc.technicianId)}
              resolveIncident={resolveIncident}
              updateIncidentStatus={updateIncidentStatus}
              addIncidentNote={addIncidentNote}
              onEdit={setEditingIncident}
            />
          ))}
        </div>
      )}

      {/* TABLO GÖRÜNÜMÜ */}
      {viewMode === 'table' && (
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
              {sorted.map(inc => {
                const client     = getClient(inc.clientId);
                const tech       = getTechnician(inc.technicianId);
                const si         = statusInfo(inc.status);
                const pc         = priColor(inc.priority);
                const isExpanded = expandedIncident === inc.id;
                const catIcon    = { software: 'laptop', hardware: 'desktop', network: 'network', other: 'box' }[inc.category] || 'box';

                return (
                  <React.Fragment key={inc.id}>
                    <tr style={{ borderLeft: `4px solid ${pc}`, background: rowBg(inc) }}>
                      <td>
                        <strong style={{ fontSize: '13px' }}>{client?.name || 'Bilinmiyor'}</strong>
                        <br />
                        <small style={{ fontSize: '11px', color: '#94a3b8' }}>{client?.city}</small>
                        {isRiskyClient(inc.clientId) && (
                          <span className="badge risky" style={{ marginLeft: '6px' }}>RİSKLİ</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '18px' }}><Icon name={catIcon} size={18} /></td>
                      <td style={{ fontSize: '13px', maxWidth: '220px' }}>{inc.description}</td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '3px 9px', borderRadius: '8px',
                          fontSize: '11px', fontWeight: '700', background: `${pc}20`, color: pc,
                        }}>
                          {inc.priority === 'critical' && 'Kritik'}
                          {inc.priority === 'medium'   && 'Orta'}
                          {inc.priority === 'low'      && 'Düşük'}
                        </span>
                      </td>
                      <td>
                        {tech ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                              width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                              background: '#3b82f620', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#3b82f6',
                            }}>
                              {tech.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: '600' }}>{tech.name}</div>
                              <div style={{ fontSize: '10px', color: '#94a3b8' }}>{tech.role}</div>
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 8px', borderRadius: '8px', fontSize: '12px',
                          background: `${si.color}20`, color: si.color,
                        }}>
                          {si.label}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px' }}>{formatDate(inc.startTime)}</td>
                      <td style={{ fontSize: '12px' }}>
                        {inc.status === 'resolved' || inc.status === 'cancelled' ? (
                          <span style={{ fontWeight: '600' }}>{inc.duration ? `${inc.duration} dk` : '-'}</span>
                        ) : inc.deadline ? (
                          <div>
                            <div style={{ color: '#94a3b8', fontSize: '11px' }}>{formatDate(inc.deadline)}</div>
                            <CountdownBadge deadline={inc.deadline} status={inc.status} />
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {inc.status !== 'resolved' && inc.status !== 'cancelled' && (
                            <>
                              <select
                                value={inc.status}
                                onChange={e => updateIncidentStatus(inc.id, e.target.value)}
                                style={{
                                  padding: '4px 6px', fontSize: '11px', borderRadius: '4px',
                                  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                                  color: 'var(--text-primary)',
                                }}
                              >
                                <option value="new">Yeni</option>
                                <option value="in_progress">Devam</option>
                                <option value="on_hold">Bekle</option>
                              </select>
                              <button
                                onClick={() => resolveIncident(inc.id)}
                                className="btn btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                              >
                                Çöz
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setEditingIncident(inc)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => setExpandedIncident(isExpanded ? null : inc.id)}
                            className="btn btn-primary"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                          >
                            {isExpanded ? '▲' : 'Notlar'}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan="9" style={{ padding: '14px', background: 'var(--bg-elevated)' }}>
                          <IncidentNotes incident={inc} onAddNote={addIncidentNote} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default IncidentList;