import React, { useState } from 'react';
import './ClientsGrid.css';
import Icon from './Icon';
import { SLA_TIERS, TIER_KEYS } from '../utils/slaTiers';

function EditModal({ client, onSave, onClose }) {
  const [name,    setName]    = useState(client.name || '');
  const [city,    setCity]    = useState(client.city || '');
  const [phone,   setPhone]   = useState(client.phone || '');
  const [email,   setEmail]   = useState(client.email || '');
  const [slaTier, setSlaTier] = useState(client.slaTier || 'bronze');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ ...client, name: name.trim(), city: city.trim(), phone: phone.trim(), email: email.trim(), slaTier });
  };

  const inp = {
    width: '100%', padding: '9px 12px', borderRadius: '8px', fontSize: '13px',
    border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)',
    color: 'var(--text-primary)', marginTop: '4px', boxSizing: 'border-box',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
        borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '420px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '16px' }}><Icon name="edit" size={18} style={{ marginRight: 8 }} /> Müşteri Düzenle</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-secondary)' }}></button>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Ad Soyad *</label>
          <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Müşteri adı" />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Şehir</label>
          <input style={inp} value={city} onChange={e => setCity(e.target.value)} placeholder="İstanbul" />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Telefon</label>
          <input style={inp} value={phone} onChange={e => setPhone(e.target.value)} placeholder="0532 000 0000" />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>E-posta</label>
          <input style={inp} value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@sirket.com" />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>SLA Paketi</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {TIER_KEYS.map(key => {
              const t = SLA_TIERS[key];
              const s = slaTier === key;
              return (
                <button key={key} type="button" onClick={() => setSlaTier(key)} style={{
                  flex: 1, padding: '8px 4px', borderRadius: '8px', cursor: 'pointer',
                  border: `2px solid ${s ? t.color : t.borderColor}`,
                  background: s ? t.bgColor : 'var(--bg-elevated)',
                  color: s ? t.color : 'var(--text-secondary)',
                  fontWeight: s ? '700' : '500', fontSize: '12px', transition: 'all 0.15s',
                }}>
                  {t.icon} {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>İptal</button>
          <button onClick={handleSave} className="btn btn-primary" style={{ flex: 2 }}><Icon name="save" size={16} /> Kaydet</button>
        </div>
      </div>
    </div>
  );
}

function ClientsGrid({ clients, incidents, onClientClick, onToggleFavorite, onDeleteClient, onEditClient }) {
  const [searchTerm, setSearchTerm]         = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [listView, setListView] = useState(true);
  const [editingClient, setEditingClient]   = useState(null);

  const getClientStats = (clientId) => {
    const clientIncidents = incidents.filter(inc => inc.clientId === clientId);
    const activeCount = clientIncidents.filter(inc => inc.status !== 'resolved' && inc.status !== 'cancelled').length;
    return { activeCount, totalCount: clientIncidents.length };
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (client.city || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (!filterFavorites || client.favorite);
  });

  const handleSaveEdit = (updatedClient) => {
    if (onEditClient) onEditClient(updatedClient);
    setEditingClient(null);
  };

  return (
    <>
      {editingClient && (
        <EditModal
          client={editingClient}
          onSave={handleSaveEdit}
          onClose={() => setEditingClient(null)}
        />
      )}

      <div className="clients-grid-container">
        <div className="clients-grid-header">
          <h2 className="clients-grid-title">
            <Icon name="grid" size={16} /> Müşteri Listesi
            <span className="clients-count-badge">{filteredClients.length}</span>
          </h2>
          <div className="clients-grid-actions">
            <div className="clients-search-wrap">
              <Icon name="search" size={14} />
              <input
                type="text"
                placeholder="İsim veya şehir ara..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="clients-search"
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm('')}></button>
              )}
            </div>
            <button
              className={`clients-action-btn ${filterFavorites ? 'active' : ''}`}
              onClick={() => setFilterFavorites(!filterFavorites)}
              title="Sadece favoriler"
            >
              <Icon name="star" size={14} /> Favoriler
            </button>
            <button
              className="clients-action-btn"
              onClick={() => setListView(!listView)}
              title={listView ? 'Grid görünümü' : 'Liste görünümü'}
            >
              <Icon name={listView ? 'grid' : 'list'} size={14} />
              {listView ? 'Grid' : 'Liste'}
            </button>
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <div className="clients-empty">
            <Icon name="clipboard" size={64} />
            <p>Müşteri bulunamadı</p>
          </div>
        ) : (
          <div className={`clients-grid ${listView ? 'list-view' : ''}`}>
            {filteredClients.map(client => {
              const stats = getClientStats(client.id);
              const tier  = SLA_TIERS[client.slaTier] || SLA_TIERS.bronze;
              // Pick a consistent hue from name for avatar gradient
              const hues  = [220, 260, 180, 30, 340, 150, 290];
              const hue   = hues[(client.name || 'A').charCodeAt(0) % hues.length];
              return (
                <div key={client.id} className="client-card" onClick={() => onClientClick(client)}>
                  {/* ── Avatar + name + actions ── */}
                  <div className="client-card-header">
                    <div className="client-avatar-large" style={{
                      background: `linear-gradient(135deg, hsl(${hue},70%,45%), hsl(${hue + 30},70%,35%))`,
                      color: '#fff',
                    }}>
                      {(client.name || '?').charAt(0).toUpperCase()}
                    </div>

                    <div className="client-info">
                      <div className="client-name">{client.name || <em style={{ opacity: 0.5 }}>İsimsiz</em>}</div>
                      <div className="client-city">
                        {client.city ? <><Icon name="pin" size={11} /> {client.city}</> : <span style={{ opacity: 0.4 }}>Şehir yok</span>}
                      </div>
                    </div>

                    <div className="client-card-actions">
                      <button
                        className={`client-action-btn favorite ${client.favorite ? 'active' : ''}`}
                        onClick={e => { e.stopPropagation(); onToggleFavorite(client.id); }}
                        title="Favorilere ekle"
                      >
                        <Icon name={client.favorite ? 'star' : 'star-outline'} size={14} />
                      </button>
                      <button
                        className="client-action-btn"
                        onClick={e => { e.stopPropagation(); setEditingClient(client); }}
                        title="Düzenle"
                      >
                        <Icon name="edit" size={14} />
                      </button>
                      <button
                        className="client-action-btn delete"
                        onClick={e => {
                          e.stopPropagation();
                          if (window.confirm(`${client.name} müşterisini silmek istediğinize emin misiniz?`)) {
                            onDeleteClient(client.id);
                          }
                        }}
                        title="Sil"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </div>

                  {/* ── Contact info ── */}
                  <div className="client-card-body">
                    {(client.phone || client.email) && (
                      <div className="client-contact-row">
                        {client.phone && <span><Icon name="phone" size={11} /> {client.phone}</span>}
                        {client.email && <span><Icon name="mail"  size={11} /> {client.email}</span>}
                      </div>
                    )}

                    <div className="client-stats-mini">
                      <div className="stat-mini">
                        <span className="stat-mini-value">{stats.totalCount}</span>
                        <span className="stat-mini-label">Toplam</span>
                      </div>
                      <div className="stat-mini">
                        <span className="stat-mini-value" style={{ color: stats.activeCount > 0 ? 'var(--warning)' : 'var(--success)' }}>
                          {stats.activeCount}
                        </span>
                        <span className="stat-mini-label">Aktif</span>
                      </div>
                    </div>
                  </div>

                  {/* ── Footer: status + tier ── */}
                  <div className="client-card-footer">
                    <span className={`client-status-badge ${stats.activeCount > 0 ? 'has-active' : 'all-clear'}`}>
                      {stats.activeCount > 0 ? ` ${stats.activeCount} aktif` : ' Sorun yok'}
                    </span>
                    <span className="client-tier-badge" style={{
                      background: tier.bgColor, color: tier.color, borderColor: tier.borderColor,
                    }}>
                      {tier.icon} {tier.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default ClientsGrid;