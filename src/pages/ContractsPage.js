import React, { useState, useEffect, useCallback } from 'react';
import './ContractsPage.css';

const CONTRACT_TYPES = [
  { value: 'maintenance', label: 'Bakım Sözleşmesi', icon: '🔧' },
  { value: 'support', label: 'Destek Sözleşmesi', icon: '🎧' },
  { value: 'license', label: 'Lisans Sözleşmesi', icon: '📋' },
  { value: 'hosting', label: 'Hosting / Barındırma', icon: '☁️' },
  { value: 'security', label: 'Güvenlik Sözleşmesi', icon: '🛡️' },
  { value: 'consulting', label: 'Danışmanlık', icon: '💼' },
  { value: 'other', label: 'Diğer', icon: '📄' },
];

const BILLING_PERIODS = [
  { value: 'monthly', label: 'Aylık' },
  { value: 'quarterly', label: '3 Aylık' },
  { value: 'semiannual', label: '6 Aylık' },
  { value: 'annual', label: 'Yıllık' },
  { value: 'onetime', label: 'Tek Seferlik' },
];

function ContractsPage({ clients, incidents, currentUser, showToast }) {
  const [contracts, setContracts] = useState([]);
  const [activeView, setActiveView] = useState('active'); // active | expiring | expired | all
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('contracts');
      if (saved) setContracts(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const saveContracts = useCallback((data) => {
    setContracts(data);
    localStorage.setItem('contracts', JSON.stringify(data));
  }, []);

  // ── CRUD ──────────────────────────
  const addContract = (formData) => {
    const newContract = {
      id: Date.now(),
      ...formData,
      monthlyFee: parseFloat(formData.monthlyFee) || 0,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Admin',
      renewalHistory: [],
    };
    saveContracts([...contracts, newContract]);
    showToast('Sözleşme eklendi!', 'success');
    setShowForm(false);
  };

  const updateContract = (formData) => {
    const updated = contracts.map(c =>
      c.id === editingContract.id
        ? { ...c, ...formData, monthlyFee: parseFloat(formData.monthlyFee) || 0, lastUpdated: new Date().toISOString() }
        : c
    );
    saveContracts(updated);
    showToast('Sözleşme güncellendi!', 'success');
    setEditingContract(null);
    setShowForm(false);
  };

  const deleteContract = (id) => {
    if (!window.confirm('Bu sözleşmeyi silmek istediğinize emin misiniz?')) return;
    saveContracts(contracts.filter(c => c.id !== id));
    if (selectedContract?.id === id) setSelectedContract(null);
    showToast('Sözleşme silindi!', 'success');
  };

  const renewContract = (contract) => {
    const oldEnd = contract.endDate;
    const start = new Date(contract.endDate);
    start.setDate(start.getDate() + 1);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);

    const updated = contracts.map(c =>
      c.id === contract.id
        ? {
            ...c,
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
            status: 'active',
            renewalHistory: [...(c.renewalHistory || []), {
              renewedAt: new Date().toISOString(),
              previousEnd: oldEnd,
              newEnd: end.toISOString().split('T')[0],
              renewedBy: currentUser?.name || 'Admin',
            }],
            lastUpdated: new Date().toISOString(),
          }
        : c
    );
    saveContracts(updated);
    showToast('Sözleşme yenilendi!', 'success');
  };

  // ── STATUS CALCULATION ────────────
  const getContractStatus = (contract) => {
    if (contract.status === 'cancelled') return 'cancelled';
    const now = new Date();
    const end = new Date(contract.endDate);
    const start = new Date(contract.startDate);
    if (now < start) return 'pending';
    if (now > end) return 'expired';
    const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 30) return 'expiring';
    return 'active';
  };

  const getDaysRemaining = (contract) => {
    const end = new Date(contract.endDate);
    return Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24));
  };

  // ── FILTERS ────────────────────────
  const enrichedContracts = contracts.map(c => ({
    ...c,
    computedStatus: getContractStatus(c),
    daysRemaining: getDaysRemaining(c),
    client: clients.find(cl => cl.id === c.clientId),
  }));

  const filtered = enrichedContracts.filter(c => {
    if (search) {
      const q = search.toLowerCase();
      if (!c.title?.toLowerCase().includes(q) &&
          !c.client?.name?.toLowerCase().includes(q) &&
          !c.contractNo?.toLowerCase().includes(q)) return false;
    }
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (activeView === 'active' && c.computedStatus !== 'active') return false;
    if (activeView === 'expiring' && c.computedStatus !== 'expiring') return false;
    if (activeView === 'expired' && c.computedStatus !== 'expired') return false;
    return true;
  });

  // ── STATS ──────────────────────────
  const activeContracts = enrichedContracts.filter(c => c.computedStatus === 'active');
  const expiringContracts = enrichedContracts.filter(c => c.computedStatus === 'expiring');
  const expiredContracts = enrichedContracts.filter(c => c.computedStatus === 'expired');
  const monthlyRevenue = activeContracts.reduce((sum, c) => {
    const fee = c.monthlyFee || 0;
    switch (c.billingPeriod) {
      case 'quarterly': return sum + fee / 3;
      case 'semiannual': return sum + fee / 6;
      case 'annual': return sum + fee / 12;
      case 'onetime': return sum;
      default: return sum + fee;
    }
  }, 0);
  const annualRevenue = monthlyRevenue * 12;

  return (
    <div className="page-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">📑 Sözleşme Yönetimi</h1>
          <p className="page-subtitle">Müşteri sözleşmeleri, yenileme takibi ve gelir analizi</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingContract(null); setShowForm(true); }}>
          + Sözleşme Ekle
        </button>
      </div>

      {/* Stats */}
      <div className="ct-stats">
        <div className="ct-stat-card">
          <div className="ct-stat-value">{contracts.length}</div>
          <div className="ct-stat-label">Toplam Sözleşme</div>
        </div>
        <div className="ct-stat-card">
          <div className="ct-stat-value" style={{ color: '#22c55e' }}>{activeContracts.length}</div>
          <div className="ct-stat-label">Aktif</div>
        </div>
        <div className={`ct-stat-card ${expiringContracts.length > 0 ? 'warning-card' : ''}`}>
          <div className="ct-stat-value" style={{ color: '#f59e0b' }}>{expiringContracts.length}</div>
          <div className="ct-stat-label">Süresi Dolacak (&lt;30 gün)</div>
        </div>
        <div className={`ct-stat-card ${expiredContracts.length > 0 ? 'danger-card' : ''}`}>
          <div className="ct-stat-value" style={{ color: '#ef4444' }}>{expiredContracts.length}</div>
          <div className="ct-stat-label">Süresi Dolmuş</div>
        </div>
        <div className="ct-stat-card revenue-card">
          <div className="ct-stat-value">{monthlyRevenue.toLocaleString('tr-TR')} ₺</div>
          <div className="ct-stat-label">Aylık Gelir</div>
        </div>
        <div className="ct-stat-card revenue-card">
          <div className="ct-stat-value">{annualRevenue.toLocaleString('tr-TR')} ₺</div>
          <div className="ct-stat-label">Yıllık Gelir (Tahmini)</div>
        </div>
      </div>

      {/* Expiring alert */}
      {expiringContracts.length > 0 && (
        <div className="ct-alert-banner">
          <span>⏰</span>
          <div>
            <strong>{expiringContracts.length} sözleşmenin süresi 30 gün içinde dolacak:</strong>{' '}
            {expiringContracts.map(c => `${c.client?.name || 'Müşteri'} (${c.daysRemaining} gün)`).join(', ')}
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="ct-tabs">
        <button className={`ct-tab ${activeView === 'active' ? 'active' : ''}`}
          onClick={() => setActiveView('active')}>✅ Aktif ({activeContracts.length})</button>
        <button className={`ct-tab ${activeView === 'expiring' ? 'active' : ''}`}
          onClick={() => setActiveView('expiring')}>⚠️ Dolacak ({expiringContracts.length})</button>
        <button className={`ct-tab ${activeView === 'expired' ? 'active' : ''}`}
          onClick={() => setActiveView('expired')}>🔴 Dolmuş ({expiredContracts.length})</button>
        <button className={`ct-tab ${activeView === 'all' ? 'active' : ''}`}
          onClick={() => setActiveView('all')}>📋 Tümü ({contracts.length})</button>
      </div>

      {/* Filters */}
      <div className="ct-filters">
        <input type="text" className="filter-input" placeholder="Sözleşme adı, müşteri, numara ara..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">Tüm Türler</option>
          {CONTRACT_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
        </select>
      </div>

      {/* Contract List */}
      {filtered.length === 0 ? (
        <div className="empty-state"><p>Bu görünümde sözleşme bulunamadı.</p></div>
      ) : (
        <div className="ct-grid">
          {filtered.map(contract => {
            const typeInfo = CONTRACT_TYPES.find(t => t.value === contract.type);
            const billing = BILLING_PERIODS.find(b => b.value === contract.billingPeriod);
            return (
              <div key={contract.id}
                className={`ct-card ct-status-${contract.computedStatus} ${selectedContract?.id === contract.id ? 'selected' : ''}`}
                onClick={() => setSelectedContract(selectedContract?.id === contract.id ? null : contract)}>
                <div className="ct-card-header">
                  <div className="ct-card-type">{typeInfo?.icon || '📄'} {typeInfo?.label || contract.type}</div>
                  <ContractStatusBadge status={contract.computedStatus} days={contract.daysRemaining} />
                </div>
                <h3 className="ct-card-title">{contract.title || contract.contractNo || 'Sözleşme'}</h3>
                <div className="ct-card-client">
                  <span>👤</span> {contract.client?.name || 'Bilinmeyen Müşteri'}
                </div>
                <div className="ct-card-details">
                  <div className="ct-card-row">
                    <span>📅 Başlangıç:</span>
                    <span>{new Date(contract.startDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="ct-card-row">
                    <span>📅 Bitiş:</span>
                    <span>{new Date(contract.endDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="ct-card-row">
                    <span>💰 Ücret:</span>
                    <span>{(contract.monthlyFee || 0).toLocaleString('tr-TR')} ₺ / {billing?.label || '-'}</span>
                  </div>
                  {contract.contractNo && (
                    <div className="ct-card-row">
                      <span>🔢 No:</span>
                      <span style={{ fontFamily: 'monospace' }}>{contract.contractNo}</span>
                    </div>
                  )}
                </div>
                <div className="ct-card-actions" onClick={e => e.stopPropagation()}>
                  {(contract.computedStatus === 'expiring' || contract.computedStatus === 'expired') && (
                    <button className="btn-sm btn-success" onClick={() => renewContract(contract)}>🔄 Yenile</button>
                  )}
                  <button className="btn-sm btn-ghost" onClick={() => { setEditingContract(contract); setShowForm(true); }}>✏️</button>
                  <button className="btn-sm btn-ghost" onClick={() => deleteContract(contract.id)} style={{ color: '#ef4444' }}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contract Detail Panel */}
      {selectedContract && (
        <ContractDetailPanel
          contract={selectedContract}
          client={clients.find(c => c.id === selectedContract.clientId)}
          incidents={incidents.filter(i => i.clientId === selectedContract.clientId)}
          onClose={() => setSelectedContract(null)}
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <ContractFormModal
          contract={editingContract}
          clients={clients}
          onSave={editingContract ? updateContract : addContract}
          onClose={() => { setShowForm(false); setEditingContract(null); }}
        />
      )}
    </div>
  );
}

function ContractStatusBadge({ status, days }) {
  const map = {
    active: { label: 'Aktif', cls: 'badge-success' },
    expiring: { label: `${days} gün`, cls: 'badge-warning' },
    expired: { label: 'Süresi Dolmuş', cls: 'badge-danger' },
    pending: { label: 'Başlamadı', cls: 'badge-info' },
    cancelled: { label: 'İptal', cls: 'badge-muted' },
  };
  const info = map[status] || map.active;
  return <span className={`ct-status-badge ${info.cls}`}>{info.label}</span>;
}

function ContractDetailPanel({ contract, client, incidents, onClose }) {
  const activeIncidents = incidents.filter(i => i.status !== 'resolved' && i.status !== 'cancelled');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved');
  const typeInfo = CONTRACT_TYPES.find(t => t.value === contract.type);

  return (
    <div className="ct-detail-panel">
      <div className="ct-detail-header">
        <h3>{typeInfo?.icon} {contract.title || contract.contractNo}</h3>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="ct-detail-body">
        <div className="ct-detail-section">
          <h4>Sözleşme Bilgileri</h4>
          <div className="ct-detail-grid">
            <div><span className="label">Sözleşme No:</span> {contract.contractNo || '-'}</div>
            <div><span className="label">Tür:</span> {typeInfo?.label || '-'}</div>
            <div><span className="label">Başlangıç:</span> {new Date(contract.startDate).toLocaleDateString('tr-TR')}</div>
            <div><span className="label">Bitiş:</span> {new Date(contract.endDate).toLocaleDateString('tr-TR')}</div>
            <div><span className="label">Ücret:</span> {(contract.monthlyFee || 0).toLocaleString('tr-TR')} ₺</div>
            <div><span className="label">Kapsam:</span> {contract.scope || '-'}</div>
          </div>
        </div>
        <div className="ct-detail-section">
          <h4>Müşteri: {client?.name || '-'}</h4>
          <p>📍 {client?.city || '-'} | 📞 {client?.phone || '-'} | ✉️ {client?.email || '-'}</p>
          <p>Toplam Arıza: {incidents.length} | Aktif: {activeIncidents.length} | Çözülmüş: {resolvedIncidents.length}</p>
        </div>
        {contract.renewalHistory?.length > 0 && (
          <div className="ct-detail-section">
            <h4>Yenileme Geçmişi</h4>
            {contract.renewalHistory.map((r, i) => (
              <div key={i} className="ct-renewal-item">
                <span>{new Date(r.renewedAt).toLocaleDateString('tr-TR')}</span>
                <span>Eski bitiş: {r.previousEnd} → Yeni: {r.newEnd}</span>
                <span>({r.renewedBy})</span>
              </div>
            ))}
          </div>
        )}
        {contract.notes && (
          <div className="ct-detail-section">
            <h4>Notlar</h4>
            <p>{contract.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ContractFormModal({ contract, clients, onSave, onClose }) {
  const [form, setForm] = useState({
    title: contract?.title || '',
    contractNo: contract?.contractNo || `SZL-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    clientId: contract?.clientId || '',
    type: contract?.type || 'maintenance',
    billingPeriod: contract?.billingPeriod || 'monthly',
    monthlyFee: contract?.monthlyFee?.toString() || '0',
    startDate: contract?.startDate || new Date().toISOString().split('T')[0],
    endDate: contract?.endDate || (() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().split('T')[0]; })(),
    scope: contract?.scope || '',
    notes: contract?.notes || '',
    status: contract?.status || 'active',
    contactPerson: contract?.contactPerson || '',
    contactPhone: contract?.contactPhone || '',
  });
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="modal-overlay" onClick={e => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal ct-modal">
        <div className="modal-header">
          <h2>{contract ? 'Sözleşme Düzenle' : 'Yeni Sözleşme'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid-2">
            <div className="form-group">
              <label>Sözleşme Başlığı *</label>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="ör: Yıllık Bakım Sözleşmesi" required />
            </div>
            <div className="form-group">
              <label>Sözleşme No</label>
              <input type="text" value={form.contractNo} onChange={e => set('contractNo', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Müşteri *</label>
              <select value={form.clientId} onChange={e => set('clientId', parseInt(e.target.value) || '')}>
                <option value="">Müşteri Seçin</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} — {c.city}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Sözleşme Türü</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}>
                {CONTRACT_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Faturalama Periyodu</label>
              <select value={form.billingPeriod} onChange={e => set('billingPeriod', e.target.value)}>
                {BILLING_PERIODS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Ücret (₺)</label>
              <input type="number" min="0" step="0.01" value={form.monthlyFee} onChange={e => set('monthlyFee', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Başlangıç Tarihi</label>
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Bitiş Tarihi</label>
              <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label>İlgili Kişi</label>
              <input type="text" value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} />
            </div>
            <div className="form-group">
              <label>İlgili Telefon</label>
              <input type="text" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label>Kapsam</label>
            <textarea value={form.scope} onChange={e => set('scope', e.target.value)} rows="2"
              placeholder="Sözleşme kapsamındaki hizmetler..." />
          </div>
          <div className="form-group">
            <label>Notlar</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows="2" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>İptal</button>
          <button className="btn btn-primary"
            onClick={() => form.title.trim() && form.clientId && onSave(form)}
            disabled={!form.title.trim() || !form.clientId}>
            {contract ? 'Güncelle' : 'Oluştur'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContractsPage;
