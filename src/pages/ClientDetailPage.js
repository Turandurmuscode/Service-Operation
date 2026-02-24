import React, { useState } from 'react';

function ClientDetailPage({ client, incidents, clients, onBack, addClientNote, showToast }) {
  const [noteText, setNoteText] = useState('');
  const [activeTab, setActiveTab] = useState('incidents');

  if (!client) return null;

  const clientIncidents = incidents.filter(i => i.clientId === client.id);
  const resolved  = clientIncidents.filter(i => i.status === 'resolved');
  const active    = clientIncidents.filter(i => i.status !== 'resolved' && i.status !== 'cancelled');
  const overdue   = clientIncidents.filter(i =>
    i.deadline && i.status !== 'resolved' && i.status !== 'cancelled' && new Date(i.deadline) < new Date()
  );
  const avgDuration = resolved.length
    ? Math.round(resolved.reduce((sum, i) => sum + (i.duration || 0), 0) / resolved.length)
    : null;

  const getStatusInfo = (status) => {
    const map = {
      new:         { label: '🆕 Yeni',         color: '#3b82f6' },
      in_progress: { label: '🔄 Devam Ediyor',  color: '#f59e0b' },
      on_hold:     { label: '⏸️ Beklemede',     color: '#a855f7' },
      resolved:    { label: '✅ Çözüldü',       color: '#10b981' },
      cancelled:   { label: '❌ İptal',         color: '#6b7280' },
    };
    return map[status] || { label: status, color: '#94a3b8' };
  };

  const getPriorityColor = (p) => ({ critical: '#ef4444', medium: '#f59e0b', low: '#10b981' }[p] || '#94a3b8');
  const getPriorityLabel = (p) => ({ critical: '🔴 Kritik', medium: '🟡 Orta', low: '🟢 Düşük' }[p] || p);

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    addClientNote(client.id, noteText.trim());
    setNoteText('');
    if (showToast) showToast('✅ Not eklendi!', 'success');
  };

  const statCard = (label, value, color = 'var(--text-primary)') => (
    <div style={{
      flex: 1, minWidth: '120px', padding: '16px', borderRadius: '12px',
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '26px', fontWeight: '700', color }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{label}</div>
    </div>
  );

  const tabBtn = (id, label) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
        fontWeight: '600', fontSize: '13px',
        background: activeTab === id ? 'var(--accent)' : 'transparent',
        color: activeTab === id ? '#000' : 'var(--text-secondary)',
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="page-content">
      {/* Geri butonu */}
      <div style={{ marginBottom: '16px' }}>
        <button className="btn btn-secondary" onClick={onBack} style={{ fontSize: '13px' }}>
          ← Müşteri Listesine Dön
        </button>
      </div>

      {/* Müşteri başlık kartı */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
            background: 'var(--accent-dim)', border: '2px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: '700', color: 'var(--accent)',
          }}>
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {client.name}
              {client.favorite && <span title="Favori">⭐</span>}
            </h1>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {client.city && <span>📍 {client.city}</span>}
              {client.phone && <span>📞 {client.phone}</span>}
              {client.email && <span>✉️ {client.email}</span>}
              {client.createdAt && <span>📅 Kayıt: {new Date(client.createdAt).toLocaleDateString('tr-TR')}</span>}
            </div>
          </div>
          {overdue.length > 0 && (
            <div style={{ padding: '8px 14px', borderRadius: '10px', background: '#ef444415', border: '1px solid #ef444430', color: '#ef4444', fontSize: '13px', fontWeight: '600' }}>
              ⚠️ {overdue.length} gecikmiş arıza
            </div>
          )}
        </div>
      </div>

      {/* İstatistik kartları */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {statCard('Toplam Arıza', clientIncidents.length)}
        {statCard('Aktif', active.length, active.length > 0 ? '#f59e0b' : 'var(--text-primary)')}
        {statCard('Çözülen', resolved.length, '#10b981')}
        {statCard('Gecikmiş', overdue.length, overdue.length > 0 ? '#ef4444' : 'var(--text-primary)')}
        {avgDuration !== null && statCard('Ort. Çözüm', `${avgDuration}dk`)}
      </div>

      {/* Sekmeler */}
      <div className="card">
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
          {tabBtn('incidents', `🔧 Arızalar (${clientIncidents.length})`)}
          {tabBtn('notes',     `📝 Notlar (${(client.notes || []).length})`)}
          {tabBtn('info',      'ℹ️ Bilgiler')}
        </div>

        {/* Arıza sekmesi */}
        {activeTab === 'incidents' && (
          <div>
            {clientIncidents.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>Bu müşteriye ait arıza kaydı yok.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Tarih</th>
                      <th>Kategori</th>
                      <th>Açıklama</th>
                      <th>Öncelik</th>
                      <th>Durum</th>
                      <th>Son Tarih</th>
                      <th>Süre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...clientIncidents].sort((a, b) => new Date(b.startTime) - new Date(a.startTime)).map(inc => {
                      const statusInfo = getStatusInfo(inc.status);
                      const isOverdue  = inc.deadline && inc.status !== 'resolved' && inc.status !== 'cancelled' && new Date(inc.deadline) < new Date();
                      return (
                        <tr key={inc.id} style={{
                          borderLeft: `4px solid ${getPriorityColor(inc.priority)}`,
                          background: isOverdue ? 'rgba(239,68,68,0.05)' : 'transparent',
                        }}>
                          <td style={{ fontSize: '12px' }}>{new Date(inc.startTime).toLocaleDateString('tr-TR')}</td>
                          <td style={{ textAlign: 'center', fontSize: '18px' }}>
                            {inc.category === 'software' && '💻'}
                            {inc.category === 'hardware' && '🖥️'}
                            {inc.category === 'network'  && '🌐'}
                            {inc.category === 'other'    && '📦'}
                          </td>
                          <td style={{ fontSize: '13px', maxWidth: '240px' }}>{inc.description}</td>
                          <td>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: getPriorityColor(inc.priority) }}>
                              {getPriorityLabel(inc.priority)}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '8px', background: `${statusInfo.color}15`, color: statusInfo.color }}>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td style={{ fontSize: '12px', color: isOverdue ? '#ef4444' : 'var(--text-secondary)' }}>
                            {inc.deadline ? new Date(inc.deadline).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                            {isOverdue && ' ⚠️'}
                          </td>
                          <td style={{ fontSize: '13px' }}>{inc.duration ? `${inc.duration}dk` : '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Notlar sekmesi */}
        {activeTab === 'notes' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: '8px', fontSize: '13px',
                  border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                }}
                placeholder="Yeni not ekle..."
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddNote()}
              />
              <button className="btn btn-primary" onClick={handleAddNote}>+ Ekle</button>
            </div>

            {(client.notes || []).length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>Henüz not eklenmedi.</p>
            ) : (
              [...(client.notes || [])].reverse().map((note, idx) => (
                <div key={idx} style={{
                  padding: '12px 14px', borderRadius: '10px', marginBottom: '8px',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: '13px', marginBottom: '6px' }}>{note.text}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(note.timestamp).toLocaleString('tr-TR')}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Bilgiler sekmesi */}
        {activeTab === 'info' && (
          <div style={{ fontSize: '13px', lineHeight: '2' }}>
            {[
              ['Ad Soyad', client.name],
              ['Şehir', client.city],
              ['Telefon', client.phone],
              ['E-posta', client.email],
              ['Kayıt Tarihi', client.createdAt ? new Date(client.createdAt).toLocaleString('tr-TR') : '-'],
              ['Favori', client.favorite ? 'Evet ⭐' : 'Hayır'],
            ].map(([label, value]) => value ? (
              <div key={label} style={{ display: 'flex', gap: '12px', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ width: '120px', color: 'var(--text-secondary)', flexShrink: 0 }}>{label}</span>
                <span style={{ fontWeight: '500' }}>{value}</span>
              </div>
            ) : null)}
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientDetailPage;