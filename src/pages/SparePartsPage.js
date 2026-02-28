import React, { useState, useEffect, useCallback } from 'react';
import './SparePartsPage.css';

const CATEGORIES = [
  { value: 'hardware', label: 'Donanım', icon: '🖥️' },
  { value: 'network', label: 'Ağ Ekipmanı', icon: '🌐' },
  { value: 'printer', label: 'Yazıcı Parçası', icon: '🖨️' },
  { value: 'cable', label: 'Kablo & Bağlantı', icon: '🔌' },
  { value: 'storage', label: 'Depolama', icon: '💾' },
  { value: 'peripheral', label: 'Çevre Birimi', icon: '🖱️' },
  { value: 'power', label: 'Güç & UPS', icon: '🔋' },
  { value: 'other', label: 'Diğer', icon: '📦' },
];

const UNITS = ['Adet', 'Metre', 'Kutu', 'Paket', 'Set'];

function SparePartsPage({ incidents, clients, currentUser, showToast }) {
  const [parts, setParts] = useState([]);
  const [usageLog, setUsageLog] = useState([]);
  const [activeView, setActiveView] = useState('inventory'); // inventory | usage | alerts
  const [showForm, setShowForm] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [showUsageForm, setShowUsageForm] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all'); // all | low | out

  // Load data
  useEffect(() => {
    try {
      const saved = localStorage.getItem('spareParts');
      if (saved) setParts(JSON.parse(saved));
      const savedLog = localStorage.getItem('sparePartsLog');
      if (savedLog) setUsageLog(JSON.parse(savedLog));
    } catch { /* ignore */ }
  }, []);

  // Save helpers
  const saveParts = useCallback((data) => {
    setParts(data);
    localStorage.setItem('spareParts', JSON.stringify(data));
  }, []);

  const saveUsageLog = useCallback((data) => {
    setUsageLog(data);
    localStorage.setItem('sparePartsLog', JSON.stringify(data));
  }, []);

  // ── CRUD ──────────────────────────────
  const addPart = (formData) => {
    const newPart = {
      id: Date.now(),
      ...formData,
      currentStock: parseInt(formData.currentStock) || 0,
      minStock: parseInt(formData.minStock) || 0,
      unitPrice: parseFloat(formData.unitPrice) || 0,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Admin',
      lastUpdated: new Date().toISOString(),
    };
    saveParts([...parts, newPart]);
    showToast('Yedek parça eklendi!', 'success');
    setShowForm(false);
  };

  const updatePart = (formData) => {
    const updated = parts.map(p =>
      p.id === editingPart.id
        ? {
            ...p,
            ...formData,
            currentStock: parseInt(formData.currentStock) || 0,
            minStock: parseInt(formData.minStock) || 0,
            unitPrice: parseFloat(formData.unitPrice) || 0,
            lastUpdated: new Date().toISOString(),
          }
        : p
    );
    saveParts(updated);
    showToast('Parça güncellendi!', 'success');
    setEditingPart(null);
    setShowForm(false);
  };

  const deletePart = (id) => {
    if (!window.confirm('Bu parçayı silmek istediğinize emin misiniz?')) return;
    saveParts(parts.filter(p => p.id !== id));
    showToast('Parça silindi!', 'success');
  };

  // ── KULLANIM KAYDI ─────────────────────
  const recordUsage = (partId, formData) => {
    const part = parts.find(p => p.id === partId);
    if (!part) return;
    const qty = parseInt(formData.quantity) || 1;
    if (qty > part.currentStock) {
      showToast('Stokta yeterli parça yok!', 'error');
      return;
    }
    // Stok düş
    const updatedParts = parts.map(p =>
      p.id === partId
        ? { ...p, currentStock: p.currentStock - qty, lastUpdated: new Date().toISOString() }
        : p
    );
    saveParts(updatedParts);

    // Log kaydı
    const logEntry = {
      id: Date.now(),
      partId,
      partName: part.name,
      quantity: qty,
      incidentId: formData.incidentId || null,
      clientId: formData.clientId || null,
      technician: formData.technician || currentUser?.name || '',
      notes: formData.notes || '',
      unitPrice: part.unitPrice,
      totalCost: qty * part.unitPrice,
      date: new Date().toISOString(),
    };
    saveUsageLog([logEntry, ...usageLog]);
    showToast(`${qty} ${part.unit} ${part.name} kullanıldı`, 'success');
    setShowUsageForm(null);
  };

  const addStock = (partId, quantity) => {
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) return;
    const updatedParts = parts.map(p =>
      p.id === partId
        ? { ...p, currentStock: p.currentStock + qty, lastUpdated: new Date().toISOString() }
        : p
    );
    saveParts(updatedParts);
    showToast(`Stok güncellendi! +${qty}`, 'success');
  };

  // ── FILTERS ────────────────────────────
  const filteredParts = parts.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.code?.toLowerCase().includes(search.toLowerCase()) &&
        !p.brand?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    if (filterStock === 'low' && p.currentStock > p.minStock) return false;
    if (filterStock === 'out' && p.currentStock > 0) return false;
    return true;
  });

  // ── STATS ──────────────────────────────
  const totalParts = parts.length;
  const totalValue = parts.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);
  const lowStockParts = parts.filter(p => p.currentStock > 0 && p.currentStock <= p.minStock);
  const outOfStockParts = parts.filter(p => p.currentStock === 0);
  const thisMonthUsage = usageLog.filter(l => {
    const d = new Date(l.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthCost = thisMonthUsage.reduce((sum, l) => sum + (l.totalCost || 0), 0);

  return (
    <div className="page-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">🔧 Yedek Parça & Stok Yönetimi</h1>
          <p className="page-subtitle">Envanter takibi, stok seviyeleri ve kullanım geçmişi</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingPart(null); setShowForm(true); }}>
          + Parça Ekle
        </button>
      </div>

      {/* Stats */}
      <div className="sp-stats">
        <div className="sp-stat-card">
          <div className="sp-stat-value">{totalParts}</div>
          <div className="sp-stat-label">Toplam Parça Çeşidi</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{totalValue.toLocaleString('tr-TR')} ₺</div>
          <div className="sp-stat-label">Stok Değeri</div>
        </div>
        <div className={`sp-stat-card ${lowStockParts.length > 0 ? 'warning-card' : ''}`}>
          <div className="sp-stat-value">{lowStockParts.length}</div>
          <div className="sp-stat-label">Düşük Stok</div>
        </div>
        <div className={`sp-stat-card ${outOfStockParts.length > 0 ? 'danger-card' : ''}`}>
          <div className="sp-stat-value">{outOfStockParts.length}</div>
          <div className="sp-stat-label">Stokta Yok</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{thisMonthUsage.length}</div>
          <div className="sp-stat-label">Bu Ay Kullanım</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{thisMonthCost.toLocaleString('tr-TR')} ₺</div>
          <div className="sp-stat-label">Bu Ay Maliyet</div>
        </div>
      </div>

      {/* Low stock alert banner */}
      {(lowStockParts.length > 0 || outOfStockParts.length > 0) && (
        <div className="sp-alert-banner">
          <span className="sp-alert-icon">⚠️</span>
          <div>
            {outOfStockParts.length > 0 && (
              <div className="sp-alert-critical">
                <strong>{outOfStockParts.length} parça stokta tükendi:</strong>{' '}
                {outOfStockParts.map(p => p.name).join(', ')}
              </div>
            )}
            {lowStockParts.length > 0 && (
              <div className="sp-alert-warning">
                <strong>{lowStockParts.length} parça minimum seviyede:</strong>{' '}
                {lowStockParts.map(p => `${p.name} (${p.currentStock}/${p.minStock})`).join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="sp-tabs">
        <button className={`sp-tab ${activeView === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveView('inventory')}>📦 Envanter ({parts.length})</button>
        <button className={`sp-tab ${activeView === 'usage' ? 'active' : ''}`}
          onClick={() => setActiveView('usage')}>📋 Kullanım Geçmişi ({usageLog.length})</button>
        <button className={`sp-tab ${activeView === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveView('alerts')}>🔔 Stok Uyarıları ({lowStockParts.length + outOfStockParts.length})</button>
      </div>

      {/* ── INVENTORY VIEW ─────────────── */}
      {activeView === 'inventory' && (
        <>
          <div className="sp-filters">
            <input
              type="text" className="filter-input" placeholder="Parça adı, kodu, marka ara..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
            <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="all">Tüm Kategoriler</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
            </select>
            <select className="filter-select" value={filterStock} onChange={e => setFilterStock(e.target.value)}>
              <option value="all">Tüm Stok</option>
              <option value="low">⚠️ Düşük Stok</option>
              <option value="out">🔴 Stokta Yok</option>
            </select>
          </div>

          {filteredParts.length === 0 ? (
            <div className="empty-state">
              <p>Henüz yedek parça eklenmemiş.</p>
            </div>
          ) : (
            <div className="sp-table-wrapper">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Parça</th>
                    <th>Kod</th>
                    <th>Kategori</th>
                    <th>Marka</th>
                    <th style={{ textAlign: 'center' }}>Stok</th>
                    <th style={{ textAlign: 'center' }}>Min</th>
                    <th style={{ textAlign: 'right' }}>Birim Fiyat</th>
                    <th style={{ textAlign: 'right' }}>Stok Değeri</th>
                    <th>Durum</th>
                    <th style={{ textAlign: 'center' }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.map(part => {
                    const cat = CATEGORIES.find(c => c.value === part.category);
                    const isOut = part.currentStock === 0;
                    const isLow = !isOut && part.currentStock <= part.minStock;
                    return (
                      <tr key={part.id} className={isOut ? 'row-danger' : isLow ? 'row-warning' : ''}>
                        <td>
                          <div className="sp-part-name">{part.name}</div>
                          {part.location && <div className="sp-part-location">📍 {part.location}</div>}
                        </td>
                        <td><code className="sp-code">{part.code || '-'}</code></td>
                        <td>{cat ? `${cat.icon} ${cat.label}` : part.category}</td>
                        <td>{part.brand || '-'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`sp-stock-badge ${isOut ? 'out' : isLow ? 'low' : 'ok'}`}>
                            {part.currentStock} {part.unit}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>{part.minStock}</td>
                        <td style={{ textAlign: 'right' }}>{part.unitPrice.toLocaleString('tr-TR')} ₺</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          {(part.currentStock * part.unitPrice).toLocaleString('tr-TR')} ₺
                        </td>
                        <td>
                          {isOut ? (
                            <span className="status-badge badge-danger">Tükendi</span>
                          ) : isLow ? (
                            <span className="status-badge badge-warning">Düşük</span>
                          ) : (
                            <span className="status-badge badge-success">Yeterli</span>
                          )}
                        </td>
                        <td>
                          <div className="sp-actions">
                            <button className="btn-icon" title="Kullanım Kaydet"
                              onClick={() => setShowUsageForm(part)} disabled={isOut}>
                              📤
                            </button>
                            <StockAddButton part={part} onAdd={addStock} />
                            <button className="btn-icon" title="Düzenle"
                              onClick={() => { setEditingPart(part); setShowForm(true); }}>
                              ✏️
                            </button>
                            <button className="btn-icon" title="Sil" onClick={() => deletePart(part.id)}>
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── USAGE LOG VIEW ────────────── */}
      {activeView === 'usage' && (
        <div className="sp-usage-log">
          {usageLog.length === 0 ? (
            <div className="empty-state"><p>Henüz kullanım kaydı yok.</p></div>
          ) : (
            <div className="sp-table-wrapper">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>Parça</th>
                    <th style={{ textAlign: 'center' }}>Miktar</th>
                    <th style={{ textAlign: 'right' }}>Maliyet</th>
                    <th>Teknisyen</th>
                    <th>Arıza</th>
                    <th>Müşteri</th>
                    <th>Notlar</th>
                  </tr>
                </thead>
                <tbody>
                  {usageLog.map(log => {
                    const inc = incidents.find(i => i.id === log.incidentId);
                    const client = clients.find(c => c.id === log.clientId);
                    return (
                      <tr key={log.id}>
                        <td>{new Date(log.date).toLocaleString('tr-TR')}</td>
                        <td><strong>{log.partName}</strong></td>
                        <td style={{ textAlign: 'center' }}>{log.quantity}</td>
                        <td style={{ textAlign: 'right' }}>{(log.totalCost || 0).toLocaleString('tr-TR')} ₺</td>
                        <td>{log.technician || '-'}</td>
                        <td>{inc ? `#${inc.id} - ${inc.description?.substring(0, 30)}` : '-'}</td>
                        <td>{client?.name || '-'}</td>
                        <td>{log.notes || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── ALERTS VIEW ───────────────── */}
      {activeView === 'alerts' && (
        <div className="sp-alerts-list">
          {[...outOfStockParts, ...lowStockParts].length === 0 ? (
            <div className="empty-state">
              <p>✅ Tüm stok seviyeleri yeterli.</p>
            </div>
          ) : (
            <div className="sp-alert-cards">
              {outOfStockParts.map(p => (
                <div key={p.id} className="sp-alert-card danger">
                  <div className="sp-alert-card-header">
                    <span className="sp-alert-level">🔴 STOKTA YOK</span>
                    <StockAddButton part={p} onAdd={addStock} />
                  </div>
                  <h4>{p.name}</h4>
                  <p>Kod: {p.code || '-'} | Kategori: {CATEGORIES.find(c => c.value === p.category)?.label || p.category}</p>
                  <p>Min. seviye: {p.minStock} {p.unit} | Fiyat: {p.unitPrice.toLocaleString('tr-TR')} ₺</p>
                </div>
              ))}
              {lowStockParts.map(p => (
                <div key={p.id} className="sp-alert-card warning">
                  <div className="sp-alert-card-header">
                    <span className="sp-alert-level">⚠️ DÜŞÜK STOK ({p.currentStock}/{p.minStock})</span>
                    <StockAddButton part={p} onAdd={addStock} />
                  </div>
                  <h4>{p.name}</h4>
                  <p>Kod: {p.code || '-'} | Kategori: {CATEGORIES.find(c => c.value === p.category)?.label || p.category}</p>
                  <p>Mevcut: {p.currentStock} {p.unit} | Fiyat: {p.unitPrice.toLocaleString('tr-TR')} ₺</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PART FORM MODAL ────────────── */}
      {showForm && (
        <PartFormModal
          part={editingPart}
          onSave={editingPart ? updatePart : addPart}
          onClose={() => { setShowForm(false); setEditingPart(null); }}
        />
      )}

      {/* ── USAGE FORM MODAL ──────────── */}
      {showUsageForm && (
        <UsageFormModal
          part={showUsageForm}
          incidents={incidents}
          clients={clients}
          currentUser={currentUser}
          onSave={(formData) => recordUsage(showUsageForm.id, formData)}
          onClose={() => setShowUsageForm(null)}
        />
      )}
    </div>
  );
}

// ── Inline stock add button ────────
function StockAddButton({ part, onAdd }) {
  const [show, setShow] = useState(false);
  const [qty, setQty] = useState('');
  if (show) {
    return (
      <div className="sp-inline-add">
        <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)}
          placeholder="Adet" className="sp-inline-input" autoFocus />
        <button className="btn-sm btn-success" onClick={() => { onAdd(part.id, qty); setShow(false); setQty(''); }}>✓</button>
        <button className="btn-sm btn-ghost" onClick={() => { setShow(false); setQty(''); }}>✕</button>
      </div>
    );
  }
  return <button className="btn-icon" title="Stok Ekle" onClick={() => setShow(true)}>📥</button>;
}

// ── Part Form Modal ────────────────
function PartFormModal({ part, onSave, onClose }) {
  const [form, setForm] = useState({
    name: part?.name || '',
    code: part?.code || '',
    category: part?.category || 'hardware',
    brand: part?.brand || '',
    model: part?.model || '',
    unit: part?.unit || 'Adet',
    currentStock: part?.currentStock?.toString() || '0',
    minStock: part?.minStock?.toString() || '5',
    unitPrice: part?.unitPrice?.toString() || '0',
    location: part?.location || '',
    supplier: part?.supplier || '',
    notes: part?.notes || '',
  });
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="modal-overlay" onClick={e => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal sp-modal">
        <div className="modal-header">
          <h2>{part ? 'Parça Düzenle' : 'Yeni Parça Ekle'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid-2">
            <div className="form-group">
              <label>Parça Adı *</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Parça Kodu</label>
              <input type="text" value={form.code} onChange={e => set('code', e.target.value)} placeholder="ör: HDD-256-SSD" />
            </div>
            <div className="form-group">
              <label>Kategori</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Marka</label>
              <input type="text" value={form.brand} onChange={e => set('brand', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Model</label>
              <input type="text" value={form.model} onChange={e => set('model', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Birim</label>
              <select value={form.unit} onChange={e => set('unit', e.target.value)}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Mevcut Stok</label>
              <input type="number" min="0" value={form.currentStock} onChange={e => set('currentStock', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Minimum Stok Seviyesi</label>
              <input type="number" min="0" value={form.minStock} onChange={e => set('minStock', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Birim Fiyat (₺)</label>
              <input type="number" min="0" step="0.01" value={form.unitPrice} onChange={e => set('unitPrice', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Depo Lokasyonu</label>
              <input type="text" value={form.location} onChange={e => set('location', e.target.value)} placeholder="ör: Raf A-3" />
            </div>
            <div className="form-group">
              <label>Tedarikçi</label>
              <input type="text" value={form.supplier} onChange={e => set('supplier', e.target.value)} />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label>Notlar</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows="2" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>İptal</button>
          <button className="btn btn-primary" onClick={() => form.name.trim() && onSave(form)}
            disabled={!form.name.trim()}>
            {part ? 'Güncelle' : 'Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Usage Form Modal ───────────────
function UsageFormModal({ part, incidents, clients, currentUser, onSave, onClose }) {
  const [form, setForm] = useState({
    quantity: '1',
    incidentId: '',
    clientId: '',
    technician: currentUser?.name || '',
    notes: '',
  });
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const activeIncidents = incidents.filter(i => i.status !== 'resolved' && i.status !== 'cancelled');

  return (
    <div className="modal-overlay" onClick={e => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal sp-modal">
        <div className="modal-header">
          <h2>📤 Kullanım Kaydet — {part.name}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="sp-usage-info">
            Mevcut stok: <strong>{part.currentStock} {part.unit}</strong> | Birim fiyat: <strong>{part.unitPrice.toLocaleString('tr-TR')} ₺</strong>
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Miktar *</label>
              <input type="number" min="1" max={part.currentStock} value={form.quantity}
                onChange={e => set('quantity', e.target.value)} />
              <small>Tahmini maliyet: {((parseInt(form.quantity) || 0) * part.unitPrice).toLocaleString('tr-TR')} ₺</small>
            </div>
            <div className="form-group">
              <label>Teknisyen</label>
              <input type="text" value={form.technician} onChange={e => set('technician', e.target.value)} />
            </div>
            <div className="form-group">
              <label>İlgili Arıza</label>
              <select value={form.incidentId} onChange={e => set('incidentId', e.target.value ? parseInt(e.target.value) : '')}>
                <option value="">Arıza seçin (opsiyonel)</option>
                {activeIncidents.map(inc => {
                  const cl = clients.find(c => c.id === inc.clientId);
                  return (
                    <option key={inc.id} value={inc.id}>
                      #{inc.id} — {cl?.name || 'Müşteri'}: {inc.description?.substring(0, 40)}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="form-group">
              <label>Müşteri</label>
              <select value={form.clientId} onChange={e => set('clientId', e.target.value ? parseInt(e.target.value) : '')}>
                <option value="">Müşteri seçin (opsiyonel)</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label>Notlar</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows="2"
              placeholder="Kullanım sebebi, detay..." />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>İptal</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>
            Kullanım Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

export default SparePartsPage;
