import React, { useState, useEffect, useCallback } from 'react';
import './AssetsPage.css';

const CATEGORIES = [
  { id: 'computer', label: 'Bilgisayar', icon: '' },
  { id: 'printer', label: 'Yazıcı', icon: '' },
  { id: 'network', label: 'Ağ Cihazı', icon: '' },
  { id: 'server', label: 'Sunucu', icon: '' },
  { id: 'phone', label: 'Telefon', icon: '' },
  { id: 'other', label: 'Diğer', icon: '' },
];

const STATUS_OPTIONS = [
  { id: 'active', label: 'Aktif', color: '#10b981' },
  { id: 'maintenance', label: 'Bakımda', color: '#f59e0b' },
  { id: 'retired', label: 'Kullanım Dışı', color: '#94a3b8' },
  { id: 'broken', label: 'Arızalı', color: '#ef4444' },
];

const emptyAsset = {
  name: '', serialNumber: '', category: 'computer', status: 'active',
  clientId: '', location: '', purchaseDate: '', warrantyEnd: '', notes: '',
};

function AssetsPage({ clients, incidents, showToast, currentUser }) {
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [form, setForm] = useState({ ...emptyAsset });
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Load assets
  useEffect(() => {
    const saved = localStorage.getItem('assets');
    if (saved) setAssets(JSON.parse(saved));
  }, []);

  const saveAssets = useCallback((updated) => {
    setAssets(updated);
    localStorage.setItem('assets', JSON.stringify(updated));
  }, []);

  // Add / Update
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.serialNumber.trim()) {
      showToast('İsim ve seri numarası zorunludur.', 'error');
      return;
    }
    if (editingAsset) {
      const updated = assets.map(a => a.id === editingAsset.id ? { ...a, ...form, updatedAt: new Date().toISOString() } : a);
      saveAssets(updated);
      showToast('Varlık güncellendi!', 'success');
    } else {
      const newAsset = {
        id: Date.now(), ...form,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.name || 'System',
      };
      saveAssets([...assets, newAsset]);
      showToast('Varlık eklendi!', 'success');
    }
    setForm({ ...emptyAsset });
    setEditingAsset(null);
    setShowForm(false);
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setForm({
      name: asset.name, serialNumber: asset.serialNumber, category: asset.category,
      status: asset.status, clientId: asset.clientId || '', location: asset.location || '',
      purchaseDate: asset.purchaseDate || '', warrantyEnd: asset.warrantyEnd || '', notes: asset.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Bu varlığı silmek istediğinize emin misiniz?')) return;
    saveAssets(assets.filter(a => a.id !== id));
    if (selectedAsset?.id === id) setSelectedAsset(null);
    showToast('Varlık silindi.', 'warning');
  };

  // Filter
  const filtered = assets.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      (a.location || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || a.category === filterCategory;
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  // Get related incidents for an asset
  const getAssetIncidents = (asset) => {
    if (!asset.clientId) return [];
    return incidents.filter(inc => inc.clientId === parseInt(asset.clientId));
  };

  const getClientName = (clientId) => {
    if (!clientId) return '—';
    const client = clients.find(c => c.id === parseInt(clientId));
    return client?.name || '—';
  };

  const getWarrantyStatus = (warrantyEnd) => {
    if (!warrantyEnd) return null;
    const diff = new Date(warrantyEnd) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return { label: 'Garanti Süresi Dolmuş', color: '#ef4444', days };
    if (days < 30) return { label: `${days} gün kaldı`, color: '#f59e0b', days };
    if (days < 90) return { label: `${days} gün kaldı`, color: '#3b82f6', days };
    return { label: `${days} gün kaldı`, color: '#10b981', days };
  };

  const stats = {
    total: assets.length,
    active: assets.filter(a => a.status === 'active').length,
    maintenance: assets.filter(a => a.status === 'maintenance').length,
    broken: assets.filter(a => a.status === 'broken').length,
    warrantyExpiring: assets.filter(a => {
      const w = getWarrantyStatus(a.warrantyEnd);
      return w && w.days >= 0 && w.days < 30;
    }).length,
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Varlık / Envanter Yönetimi</h1>
          <p className="page-subtitle">Cihaz ve ekipman envanterini takip edin</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingAsset(null); setForm({ ...emptyAsset }); }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
            <path d="M8 3v10M3 8h10" strokeLinecap="round" />
          </svg>
          Yeni Varlık
        </button>
      </div>

      {/* Stat Cards */}
      <div className="asset-stats">
        <div className="asset-stat-card">
          <div className="asset-stat-value">{stats.total}</div>
          <div className="asset-stat-label">Toplam Varlık</div>
        </div>
        <div className="asset-stat-card">
          <div className="asset-stat-value" style={{ color: '#10b981' }}>{stats.active}</div>
          <div className="asset-stat-label">Aktif</div>
        </div>
        <div className="asset-stat-card">
          <div className="asset-stat-value" style={{ color: '#f59e0b' }}>{stats.maintenance}</div>
          <div className="asset-stat-label">Bakımda</div>
        </div>
        <div className="asset-stat-card">
          <div className="asset-stat-value" style={{ color: '#ef4444' }}>{stats.broken}</div>
          <div className="asset-stat-label">Arızalı</div>
        </div>
        {stats.warrantyExpiring > 0 && (
          <div className="asset-stat-card warning-card">
            <div className="asset-stat-value" style={{ color: '#f59e0b' }}>{stats.warrantyExpiring}</div>
            <div className="asset-stat-label">Garanti Bitiyor</div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="asset-filters">
        <input
          type="text" placeholder="Varlık ara (isim, seri no, lokasyon)..."
          className="filter-input" value={search} onChange={e => setSearch(e.target.value)}
        />
        <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="all">Tüm Kategoriler</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </select>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Tüm Durumlar</option>
          {STATUS_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {/* Asset Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content asset-form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAsset ? 'Varlık Düzenle' : 'Yeni Varlık Ekle'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}></button>
            </div>
            <form onSubmit={handleSubmit} className="asset-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Varlık Adı *</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="ör: Dell Latitude 5520" required />
                </div>
                <div className="form-group">
                  <label>Seri Numarası *</label>
                  <input type="text" value={form.serialNumber} onChange={e => setForm({ ...form, serialNumber: e.target.value })} placeholder="ör: SN-2024-001" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Kategori</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Durum</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {STATUS_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Müşteri / Firma</label>
                  <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })}>
                    <option value="">Seçiniz</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Lokasyon</label>
                  <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="ör: 2. Kat, BT Odası" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Satın Alma Tarihi</label>
                  <input type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Garanti Bitiş Tarihi</label>
                  <input type="date" value={form.warrantyEnd} onChange={e => setForm({ ...form, warrantyEnd: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Notlar</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Ek bilgiler..." />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">{editingAsset ? 'Güncelle' : 'Ekle'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Detail Panel */}
      {selectedAsset && (
        <div className="asset-detail-panel">
          <div className="asset-detail-header">
            <h3>{CATEGORIES.find(c => c.id === selectedAsset.category)?.icon} {selectedAsset.name}</h3>
            <button className="modal-close" onClick={() => setSelectedAsset(null)}></button>
          </div>
          <div className="asset-detail-body">
            <div className="detail-grid">
              <div className="detail-item"><span className="detail-label">Seri No</span><span className="detail-value">{selectedAsset.serialNumber}</span></div>
              <div className="detail-item"><span className="detail-label">Kategori</span><span className="detail-value">{CATEGORIES.find(c => c.id === selectedAsset.category)?.label}</span></div>
              <div className="detail-item"><span className="detail-label">Durum</span>
                <span className="status-badge" style={{ background: STATUS_OPTIONS.find(s => s.id === selectedAsset.status)?.color + '22', color: STATUS_OPTIONS.find(s => s.id === selectedAsset.status)?.color }}>
                  {STATUS_OPTIONS.find(s => s.id === selectedAsset.status)?.label}
                </span>
              </div>
              <div className="detail-item"><span className="detail-label">Müşteri</span><span className="detail-value">{getClientName(selectedAsset.clientId)}</span></div>
              <div className="detail-item"><span className="detail-label">Lokasyon</span><span className="detail-value">{selectedAsset.location || '—'}</span></div>
              <div className="detail-item"><span className="detail-label">Satın Alma</span><span className="detail-value">{selectedAsset.purchaseDate ? new Date(selectedAsset.purchaseDate).toLocaleDateString('tr-TR') : '—'}</span></div>
              {selectedAsset.warrantyEnd && (
                <div className="detail-item">
                  <span className="detail-label">Garanti</span>
                  <span className="detail-value">
                    {(() => { const w = getWarrantyStatus(selectedAsset.warrantyEnd); return w ? <span style={{ color: w.color, fontWeight: 600 }}>{w.label}</span> : '—'; })()}
                  </span>
                </div>
              )}
            </div>
            {selectedAsset.notes && (
              <div className="detail-notes">
                <h4>Notlar</h4>
                <p>{selectedAsset.notes}</p>
              </div>
            )}
            {/* Related Incidents */}
            <div className="detail-incidents">
              <h4>İlişkili Arızalar ({getAssetIncidents(selectedAsset).length})</h4>
              {getAssetIncidents(selectedAsset).length === 0 ? (
                <p className="empty-text">Bu varlıkla ilişkili arıza kaydı yok.</p>
              ) : (
                <div className="incident-mini-list">
                  {getAssetIncidents(selectedAsset).slice(0, 5).map(inc => (
                    <div key={inc.id} className="incident-mini-item">
                      <span className="status-dot" style={{ background: inc.status === 'resolved' ? '#10b981' : inc.status === 'new' ? '#3b82f6' : '#f59e0b' }} />
                      <span className="incident-mini-desc">{inc.description}</span>
                      <span className="incident-mini-status">{inc.status === 'resolved' ? 'Çözüldü' : inc.status === 'new' ? 'Yeni' : 'Devam'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Asset Table */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{ opacity: 0.25 }}>
            <rect x="2" y="3" width="20" height="18" rx="2" /><path d="M8 7h8M8 11h5" strokeLinecap="round" />
          </svg>
          <p>Varlık bulunamadı. Yeni eklemek için yukarıdaki butonu kullanın.</p>
        </div>
      ) : (
        <div className="asset-table-wrapper">
          <table className="asset-table">
            <thead>
              <tr>
                <th>Varlık</th>
                <th>Seri No</th>
                <th>Kategori</th>
                <th>Durum</th>
                <th>Müşteri</th>
                <th>Lokasyon</th>
                <th>Garanti</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(asset => {
                const warranty = getWarrantyStatus(asset.warrantyEnd);
                const catInfo = CATEGORIES.find(c => c.id === asset.category);
                const statusInfo = STATUS_OPTIONS.find(s => s.id === asset.status);
                return (
                  <tr key={asset.id} className={selectedAsset?.id === asset.id ? 'selected' : ''} onClick={() => setSelectedAsset(asset)}>
                    <td className="asset-name-cell">
                      <span className="cat-icon">{catInfo?.icon}</span>
                      <span>{asset.name}</span>
                    </td>
                    <td><code>{asset.serialNumber}</code></td>
                    <td>{catInfo?.label}</td>
                    <td>
                      <span className="status-badge" style={{ background: statusInfo?.color + '22', color: statusInfo?.color }}>
                        {statusInfo?.label}
                      </span>
                    </td>
                    <td>{getClientName(asset.clientId)}</td>
                    <td>{asset.location || '—'}</td>
                    <td>
                      {warranty ? (
                        <span style={{ color: warranty.color, fontSize: '12px', fontWeight: 600 }}>{warranty.label}</span>
                      ) : '—'}
                    </td>
                    <td className="action-cell" onClick={e => e.stopPropagation()}>
                      <button className="btn-icon" title="Düzenle" onClick={() => handleEdit(asset)}>
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M11 2l3 3-8 8H3v-3l8-8z" strokeLinejoin="round" /></svg>
                      </button>
                      <button className="btn-icon delete" title="Sil" onClick={() => handleDelete(asset.id)}>
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M3 4h10M6 4V3h4v1M5 4v9h6V4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AssetsPage;
