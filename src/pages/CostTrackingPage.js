import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './CostTrackingPage.css';

const LABOR_RATE_KEY = 'costTracking_laborRate';
const COST_ENTRIES_KEY = 'costTrackingEntries';
const INVOICES_KEY = 'costTrackingInvoices';

const COST_TYPES = [
  { id: 'labor', label: 'İşçilik', icon: '👷', color: '#6366f1' },
  { id: 'part', label: 'Yedek Parça', icon: '🔧', color: '#f59e0b' },
  { id: 'travel', label: 'Ulaşım', icon: '🚗', color: '#10b981' },
  { id: 'external', label: 'Dış Hizmet', icon: '🏢', color: '#ef4444' },
  { id: 'other', label: 'Diğer', icon: '📦', color: '#8b5cf6' },
];

const emptyCostEntry = {
  incidentId: '', clientId: '', type: 'labor', description: '', amount: '', quantity: 1,
};

function CostTrackingPage({ incidents, clients, currentUser, showToast }) {
  const [entries, setEntries] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [laborRate, setLaborRate] = useState(150); // ₺/saat
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [form, setForm] = useState({ ...emptyCostEntry });
  const [activeTab, setActiveTab] = useState('costs'); // costs | invoices | analysis
  const [filterClient, setFilterClient] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all'); // all | month | week
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ clientId: '', startDate: '', endDate: '', notes: '' });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [search, setSearch] = useState('');

  // Load
  useEffect(() => {
    const savedEntries = localStorage.getItem(COST_ENTRIES_KEY);
    const savedInvoices = localStorage.getItem(INVOICES_KEY);
    const savedRate = localStorage.getItem(LABOR_RATE_KEY);
    if (savedEntries) setEntries(JSON.parse(savedEntries));
    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
    if (savedRate) setLaborRate(parseFloat(savedRate));
  }, []);

  const saveEntries = useCallback((updated) => {
    setEntries(updated);
    localStorage.setItem(COST_ENTRIES_KEY, JSON.stringify(updated));
  }, []);

  const saveInvoices = useCallback((updated) => {
    setInvoices(updated);
    localStorage.setItem(INVOICES_KEY, JSON.stringify(updated));
  }, []);

  const handleSaveLaborRate = (rate) => {
    const r = parseFloat(rate) || 0;
    setLaborRate(r);
    localStorage.setItem(LABOR_RATE_KEY, r.toString());
  };

  // Add / Edit Cost Entry
  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(form.amount) || 0;
    const quantity = parseInt(form.quantity) || 1;
    if (amount <= 0) {
      showToast('Geçerli bir tutar girin.', 'error');
      return;
    }

    if (editingEntry) {
      const updated = entries.map(en => en.id === editingEntry.id ? {
        ...en, ...form, amount, quantity, total: amount * quantity,
        updatedAt: new Date().toISOString(),
      } : en);
      saveEntries(updated);
      showToast('Maliyet kaydı güncellendi!', 'success');
    } else {
      const newEntry = {
        id: Date.now(), ...form, amount, quantity, total: amount * quantity,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.name || 'System',
      };
      saveEntries([...entries, newEntry]);
      showToast('Maliyet kaydı eklendi!', 'success');
    }
    setForm({ ...emptyCostEntry });
    setEditingEntry(null);
    setShowForm(false);
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setForm({
      incidentId: entry.incidentId || '', clientId: entry.clientId || '',
      type: entry.type, description: entry.description,
      amount: entry.amount, quantity: entry.quantity || 1,
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Bu maliyet kaydını silmek istediğinize emin misiniz?')) return;
    saveEntries(entries.filter(e => e.id !== id));
    showToast('Kayıt silindi.', 'warning');
  };

  // Auto-calculate labor cost from timesheet
  const autoAddLabor = () => {
    const timesheetEntries = JSON.parse(localStorage.getItem('timesheetEntries') || '[]');
    if (timesheetEntries.length === 0) {
      showToast('Saat takibi kaydı bulunamadı.', 'error');
      return;
    }
    // Find timesheet entries not yet added
    const existingLabor = entries.filter(e => e.type === 'labor' && e.sourceType === 'timesheet');
    const existingIds = new Set(existingLabor.map(e => e.sourceId));
    const newTimeEntries = timesheetEntries.filter(te => !existingIds.has(te.id));

    if (newTimeEntries.length === 0) {
      showToast('Tüm saat kayıtları zaten maliyet olarak eklenmiş.', 'info');
      return;
    }

    const newCosts = newTimeEntries.map(te => {
      const hours = (te.totalMinutes || 0) / 60;
      const inc = incidents.find(i => i.id === parseInt(te.incidentId));
      return {
        id: Date.now() + Math.random(),
        incidentId: te.incidentId || '',
        clientId: inc ? String(inc.clientId) : '',
        type: 'labor',
        description: `İşçilik: ${te.description || te.technician} (${hours.toFixed(1)} saat)`,
        amount: laborRate * hours,
        quantity: 1,
        total: laborRate * hours,
        sourceType: 'timesheet',
        sourceId: te.id,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.name || 'System',
      };
    });

    saveEntries([...entries, ...newCosts]);
    showToast(`${newCosts.length} işçilik maliyeti otomatik eklendi!`, 'success');
  };

  // Auto-add parts from spare parts usage log
  const autoAddParts = () => {
    const usageLog = JSON.parse(localStorage.getItem('sparePartsLog') || '[]');
    if (usageLog.length === 0) {
      showToast('Yedek parça kullanım kaydı bulunamadı.', 'error');
      return;
    }
    const existingParts = entries.filter(e => e.type === 'part' && e.sourceType === 'sparepart');
    const existingIds = new Set(existingParts.map(e => e.sourceId));
    const newUsages = usageLog.filter(u => !existingIds.has(u.id));

    if (newUsages.length === 0) {
      showToast('Tüm parça kullanımları zaten maliyet olarak eklenmiş.', 'info');
      return;
    }

    const spareParts = JSON.parse(localStorage.getItem('spareParts') || '[]');
    const newCosts = newUsages.map(u => {
      const part = spareParts.find(p => p.id === u.partId);
      const unitPrice = part?.unitPrice || 0;
      const inc = u.incidentId ? incidents.find(i => i.id === parseInt(u.incidentId)) : null;
      return {
        id: Date.now() + Math.random(),
        incidentId: u.incidentId || '',
        clientId: inc ? String(inc.clientId) : '',
        type: 'part',
        description: `Parça: ${u.partName} ${u.partNumber ? `(${u.partNumber})` : ''} x${u.quantity}`,
        amount: unitPrice * u.quantity,
        quantity: 1,
        total: unitPrice * u.quantity,
        sourceType: 'sparepart',
        sourceId: u.id,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.name || 'System',
      };
    });

    saveEntries([...entries, ...newCosts]);
    showToast(`${newCosts.length} parça maliyeti otomatik eklendi!`, 'success');
  };

  // Generate Invoice
  const handleGenerateInvoice = (e) => {
    e.preventDefault();
    if (!invoiceForm.clientId) {
      showToast('Müşteri seçiniz.', 'error');
      return;
    }

    const clientEntries = entries.filter(en => {
      if (String(en.clientId) !== String(invoiceForm.clientId)) return false;
      if (invoiceForm.startDate && en.createdAt < invoiceForm.startDate) return false;
      if (invoiceForm.endDate && en.createdAt > invoiceForm.endDate + 'T23:59:59') return false;
      return true;
    });

    if (clientEntries.length === 0) {
      showToast('Bu müşteri ve tarih aralığında maliyet kaydı bulunamadı.', 'error');
      return;
    }

    const client = clients.find(c => c.id === parseInt(invoiceForm.clientId));
    const subtotal = clientEntries.reduce((sum, en) => sum + (en.total || 0), 0);
    const tax = subtotal * 0.20; // %20 KDV
    const grandTotal = subtotal + tax;

    const invoice = {
      id: Date.now(),
      invoiceNo: `FTR-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`,
      clientId: invoiceForm.clientId,
      clientName: client?.name || 'Bilinmiyor',
      startDate: invoiceForm.startDate || null,
      endDate: invoiceForm.endDate || null,
      items: clientEntries.map(en => ({
        description: en.description,
        type: en.type,
        amount: en.total || en.amount,
      })),
      subtotal,
      taxRate: 20,
      tax,
      grandTotal,
      notes: invoiceForm.notes,
      status: 'draft', // draft | sent | paid
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'System',
    };

    saveInvoices([invoice, ...invoices]);
    setShowInvoiceForm(false);
    setInvoiceForm({ clientId: '', startDate: '', endDate: '', notes: '' });
    showToast(`Fatura ${invoice.invoiceNo} oluşturuldu!`, 'success');
  };

  const updateInvoiceStatus = (invoiceId, newStatus) => {
    const updated = invoices.map(inv =>
      inv.id === invoiceId ? { ...inv, status: newStatus, updatedAt: new Date().toISOString() } : inv
    );
    saveInvoices(updated);
    const statusLabels = { draft: 'Taslak', sent: 'Gönderildi', paid: 'Ödendi' };
    showToast(`Fatura durumu: ${statusLabels[newStatus]}`, 'success');
  };

  const deleteInvoice = (id) => {
    if (!window.confirm('Bu faturayı silmek istediğinize emin misiniz?')) return;
    saveInvoices(invoices.filter(inv => inv.id !== id));
    if (selectedInvoice?.id === id) setSelectedInvoice(null);
    showToast('Fatura silindi.', 'warning');
  };

  // Helpers
  const getClientName = useCallback((clientId) => {
    if (!clientId) return '—';
    const c = clients.find(cl => cl.id === parseInt(clientId));
    return c?.name || 'Bilinmiyor';
  }, [clients]);

  const getIncidentLabel = (incidentId) => {
    if (!incidentId) return '—';
    const inc = incidents.find(i => i.id === parseInt(incidentId));
    if (!inc) return `#${incidentId}`;
    return `#${inc.id}: ${inc.description?.slice(0, 30)}`;
  };

  // Filter entries
  const filteredEntries = useMemo(() => {
    const now = new Date();
    return entries.filter(en => {
      if (filterClient !== 'all' && String(en.clientId) !== filterClient) return false;
      if (filterType !== 'all' && en.type !== filterType) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!(en.description || '').toLowerCase().includes(s) &&
          !getClientName(en.clientId).toLowerCase().includes(s)) return false;
      }
      if (filterPeriod === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (new Date(en.createdAt) < weekAgo) return false;
      } else if (filterPeriod === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (new Date(en.createdAt) < monthAgo) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [entries, filterClient, filterType, filterPeriod, search, getClientName]);

  // Stats
  const totalCost = entries.reduce((sum, e) => sum + (e.total || 0), 0);
  const costByType = COST_TYPES.map(ct => ({
    ...ct,
    total: entries.filter(e => e.type === ct.id).reduce((sum, e) => sum + (e.total || 0), 0),
    count: entries.filter(e => e.type === ct.id).length,
  }));
  const thisMonthCost = entries
    .filter(e => {
      const d = new Date(e.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + (e.total || 0), 0);

  // Client cost ranking
  const clientCosts = useMemo(() => {
    const map = {};
    entries.forEach(e => {
      const cid = e.clientId || 'unknown';
      if (!map[cid]) map[cid] = { clientId: cid, total: 0, count: 0 };
      map[cid].total += e.total || 0;
      map[cid].count += 1;
    });
    return Object.values(map)
      .map(c => ({ ...c, name: getClientName(c.clientId) }))
      .sort((a, b) => b.total - a.total);
  }, [entries, getClientName]);

  const invoiceStatusColors = { draft: '#64748b', sent: '#f59e0b', paid: '#10b981' };
  const invoiceStatusLabels = { draft: 'Taslak', sent: 'Gönderildi', paid: 'Ödendi' };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Maliyet / Fatura Takibi</h1>
          <p className="page-subtitle">Arıza maliyetlerini takip edin, müşteri bazlı raporlar ve faturalar oluşturun</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={autoAddLabor} title="Saat Takibi kayıtlarından işçilik maliyetlerini otomatik ekle">
            ⏱️ İşçilik Aktar
          </button>
          <button className="btn btn-secondary" onClick={autoAddParts} title="Yedek Parça kullanım kayıtlarından maliyetleri otomatik ekle">
            🔧 Parça Aktar
          </button>
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingEntry(null); setForm({ ...emptyCostEntry }); }}>
            + Maliyet Ekle
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="ct-stats">
        <div className="ct-stat-card primary">
          <div className="ct-stat-value">₺{totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
          <div className="ct-stat-label">Toplam Maliyet</div>
        </div>
        <div className="ct-stat-card">
          <div className="ct-stat-value">₺{thisMonthCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
          <div className="ct-stat-label">Bu Ay</div>
        </div>
        <div className="ct-stat-card">
          <div className="ct-stat-value">{entries.length}</div>
          <div className="ct-stat-label">Toplam Kayıt</div>
        </div>
        <div className="ct-stat-card">
          <div className="ct-stat-value">{invoices.filter(i => i.status === 'paid').length}/{invoices.length}</div>
          <div className="ct-stat-label">Ödenen Fatura</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="ct-tabs">
        {[
          { id: 'costs', label: 'Maliyet Kayıtları', icon: '💰' },
          { id: 'invoices', label: 'Faturalar', icon: '🧾' },
          { id: 'analysis', label: 'Analiz', icon: '📊' },
        ].map(tab => (
          <button key={tab.id} className={`ct-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════ COSTS TAB ═══════════ */}
      {activeTab === 'costs' && (
        <>
          <div className="ct-filters">
            <input type="text" placeholder="Ara..." className="filter-input" value={search}
              onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 160 }} />
            <select className="filter-select" value={filterClient} onChange={e => setFilterClient(e.target.value)}>
              <option value="all">Tüm Müşteriler</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">Tüm Türler</option>
              {COST_TYPES.map(ct => <option key={ct.id} value={ct.id}>{ct.icon} {ct.label}</option>)}
            </select>
            <select className="filter-select" value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
              <option value="all">Tüm Zamanlar</option>
              <option value="week">Son 7 Gün</option>
              <option value="month">Son 30 Gün</option>
            </select>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💰</div>
              <p>Maliyet kaydı bulunamadı. Manuel ekleyin veya otomatik aktarım kullanın.</p>
            </div>
          ) : (
            <div className="ct-table-wrapper">
              <table className="ct-table">
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>Tür</th>
                    <th>Açıklama</th>
                    <th>Müşteri</th>
                    <th>Arıza</th>
                    <th style={{ textAlign: 'right' }}>Tutar</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map(entry => {
                    const typeInfo = COST_TYPES.find(ct => ct.id === entry.type);
                    return (
                      <tr key={entry.id}>
                        <td className="ct-date">{new Date(entry.createdAt).toLocaleDateString('tr-TR')}</td>
                        <td>
                          <span className="ct-type-badge" style={{ background: typeInfo?.color + '18', color: typeInfo?.color }}>
                            {typeInfo?.icon} {typeInfo?.label}
                          </span>
                        </td>
                        <td className="ct-desc">{entry.description}</td>
                        <td>{getClientName(entry.clientId)}</td>
                        <td className="ct-incident">{getIncidentLabel(entry.incidentId)}</td>
                        <td className="ct-amount">₺{(entry.total || entry.amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                        <td className="ct-actions">
                          <button className="btn-icon" title="Düzenle" onClick={() => handleEdit(entry)}>
                            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13">
                              <path d="M11 2l3 3-8 8H3v-3l8-8z" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <button className="btn-icon delete" title="Sil" onClick={() => handleDelete(entry.id)}>
                            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13">
                              <path d="M3 4h10M6 4V3h4v1M5 4v9h6V4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'right', fontWeight: 700 }}>Toplam:</td>
                    <td className="ct-amount" style={{ fontWeight: 800, fontSize: 15 }}>
                      ₺{filteredEntries.reduce((s, e) => s + (e.total || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}

      {/* ═══════════ INVOICES TAB ═══════════ */}
      {activeTab === 'invoices' && (
        <>
          <div className="ct-invoice-header">
            <button className="btn btn-primary" onClick={() => setShowInvoiceForm(true)}>
              🧾 Yeni Fatura Oluştur
            </button>
          </div>

          {invoices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🧾</div>
              <p>Henüz fatura oluşturulmamış. Maliyet kayıtlarından otomatik fatura oluşturabilirsiniz.</p>
            </div>
          ) : (
            <div className="ct-invoice-grid">
              {invoices.map(inv => (
                <div key={inv.id} className={`ct-invoice-card ${selectedInvoice?.id === inv.id ? 'selected' : ''}`}
                  onClick={() => setSelectedInvoice(selectedInvoice?.id === inv.id ? null : inv)}>
                  <div className="ct-inv-top">
                    <code className="ct-inv-no">{inv.invoiceNo}</code>
                    <span className="ct-inv-status" style={{ background: invoiceStatusColors[inv.status] + '18', color: invoiceStatusColors[inv.status] }}>
                      {invoiceStatusLabels[inv.status]}
                    </span>
                  </div>
                  <div className="ct-inv-client">{inv.clientName}</div>
                  <div className="ct-inv-total">₺{inv.grandTotal?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                  <div className="ct-inv-meta">
                    <span>{new Date(inv.createdAt).toLocaleDateString('tr-TR')}</span>
                    <span>{inv.items?.length || 0} kalem</span>
                  </div>
                  <div className="ct-inv-actions" onClick={e => e.stopPropagation()}>
                    {inv.status === 'draft' && (
                      <button className="btn btn-xs" onClick={() => updateInvoiceStatus(inv.id, 'sent')}>Gönder</button>
                    )}
                    {inv.status === 'sent' && (
                      <button className="btn btn-xs success" onClick={() => updateInvoiceStatus(inv.id, 'paid')}>Ödendi</button>
                    )}
                    <button className="btn btn-xs danger" onClick={() => deleteInvoice(inv.id)}>Sil</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Invoice Detail */}
          {selectedInvoice && (
            <div className="ct-inv-detail">
              <div className="ct-inv-detail-header">
                <div>
                  <h3>{selectedInvoice.invoiceNo}</h3>
                  <span className="ct-inv-status" style={{ background: invoiceStatusColors[selectedInvoice.status] + '18', color: invoiceStatusColors[selectedInvoice.status] }}>
                    {invoiceStatusLabels[selectedInvoice.status]}
                  </span>
                </div>
                <button className="modal-close" onClick={() => setSelectedInvoice(null)}>✕</button>
              </div>
              <div className="ct-inv-detail-body">
                <div className="ct-inv-info-grid">
                  <div><span className="label">Müşteri</span><span className="value">{selectedInvoice.clientName}</span></div>
                  <div><span className="label">Tarih</span><span className="value">{new Date(selectedInvoice.createdAt).toLocaleDateString('tr-TR')}</span></div>
                  <div><span className="label">Dönem</span><span className="value">{selectedInvoice.startDate ? `${selectedInvoice.startDate} — ${selectedInvoice.endDate}` : 'Tüm zamanlar'}</span></div>
                  <div><span className="label">Oluşturan</span><span className="value">{selectedInvoice.createdBy}</span></div>
                </div>

                <table className="ct-inv-items-table">
                  <thead>
                    <tr><th>Açıklama</th><th>Tür</th><th style={{ textAlign: 'right' }}>Tutar</th></tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items?.map((item, i) => {
                      const typeInfo = COST_TYPES.find(ct => ct.id === item.type);
                      return (
                        <tr key={i}>
                          <td>{item.description}</td>
                          <td>{typeInfo?.icon} {typeInfo?.label}</td>
                          <td style={{ textAlign: 'right' }}>₺{(item.amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="ct-inv-totals">
                  <div className="ct-inv-total-row"><span>Ara Toplam</span><span>₺{selectedInvoice.subtotal?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span></div>
                  <div className="ct-inv-total-row"><span>KDV (%{selectedInvoice.taxRate})</span><span>₺{selectedInvoice.tax?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span></div>
                  <div className="ct-inv-total-row grand"><span>Genel Toplam</span><span>₺{selectedInvoice.grandTotal?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span></div>
                </div>
                {selectedInvoice.notes && <div className="ct-inv-notes"><strong>Notlar:</strong> {selectedInvoice.notes}</div>}
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════ ANALYSIS TAB ═══════════ */}
      {activeTab === 'analysis' && (
        <div className="ct-analysis">
          {/* Labor Rate Setting */}
          <div className="ct-rate-bar">
            <label>İşçilik Saatlik Ücreti:</label>
            <div className="ct-rate-input-group">
              <span>₺</span>
              <input type="number" min="0" value={laborRate}
                onChange={e => handleSaveLaborRate(e.target.value)} className="ct-rate-input" />
              <span>/ saat</span>
            </div>
          </div>

          {/* Cost by Type */}
          <div className="ct-analysis-section">
            <h3>Maliyet Türlerine Göre Dağılım</h3>
            <div className="ct-type-bars">
              {costByType.filter(ct => ct.total > 0).map(ct => (
                <div key={ct.id} className="ct-type-bar-item">
                  <div className="ct-type-bar-label">
                    <span>{ct.icon} {ct.label}</span>
                    <span className="ct-type-bar-amount">₺{ct.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ({ct.count} kayıt)</span>
                  </div>
                  <div className="ct-type-bar-track">
                    <div className="ct-type-bar-fill" style={{
                      width: `${totalCost > 0 ? (ct.total / totalCost * 100) : 0}%`,
                      background: ct.color,
                    }} />
                  </div>
                </div>
              ))}
              {costByType.every(ct => ct.total === 0) && (
                <p className="empty-text">Henüz maliyet verisi yok.</p>
              )}
            </div>
          </div>

          {/* Top Clients */}
          <div className="ct-analysis-section">
            <h3>Müşteri Bazlı Maliyet Sıralaması</h3>
            {clientCosts.length === 0 ? (
              <p className="empty-text">Henüz maliyet verisi yok.</p>
            ) : (
              <div className="ct-client-ranking">
                {clientCosts.slice(0, 10).map((cc, idx) => (
                  <div key={cc.clientId} className="ct-rank-item">
                    <span className="ct-rank-num">{idx + 1}</span>
                    <span className="ct-rank-name">{cc.name}</span>
                    <span className="ct-rank-count">{cc.count} kayıt</span>
                    <div className="ct-rank-bar-wrapper">
                      <div className="ct-rank-bar" style={{
                        width: `${clientCosts[0]?.total > 0 ? (cc.total / clientCosts[0].total * 100) : 0}%`,
                      }} />
                    </div>
                    <span className="ct-rank-total">₺{cc.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ COST FORM MODAL ═══════════ */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content ct-form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEntry ? 'Maliyet Düzenle' : 'Yeni Maliyet Kaydı'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="ct-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Maliyet Türü</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {COST_TYPES.map(ct => <option key={ct.id} value={ct.id}>{ct.icon} {ct.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tutar (₺) *</label>
                  <input type="number" min="0" step="0.01" value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Müşteri</label>
                  <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })}>
                    <option value="">Seçiniz (opsiyonel)</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>İlişkili Arıza</label>
                  <select value={form.incidentId} onChange={e => setForm({ ...form, incidentId: e.target.value })}>
                    <option value="">Seçiniz (opsiyonel)</option>
                    {incidents.map(inc => {
                      const cl = clients.find(c => c.id === inc.clientId);
                      return <option key={inc.id} value={inc.id}>{cl?.name}: {inc.description?.slice(0, 40)}</option>;
                    })}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Adet</label>
                  <input type="number" min="1" value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Toplam</label>
                  <div className="ct-total-preview">
                    ₺{((parseFloat(form.amount) || 0) * (parseInt(form.quantity) || 1)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Açıklama</label>
                <input type="text" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Maliyet açıklaması..." />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">{editingEntry ? 'Güncelle' : 'Ekle'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ INVOICE FORM MODAL ═══════════ */}
      {showInvoiceForm && (
        <div className="modal-overlay" onClick={() => setShowInvoiceForm(false)}>
          <div className="modal-content ct-form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🧾 Fatura Oluştur</h2>
              <button className="modal-close" onClick={() => setShowInvoiceForm(false)}>✕</button>
            </div>
            <form onSubmit={handleGenerateInvoice} className="ct-form">
              <div className="form-group">
                <label>Müşteri *</label>
                <select value={invoiceForm.clientId} onChange={e => setInvoiceForm({ ...invoiceForm, clientId: e.target.value })} required>
                  <option value="">Müşteri seçiniz...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Başlangıç Tarihi</label>
                  <input type="date" value={invoiceForm.startDate}
                    onChange={e => setInvoiceForm({ ...invoiceForm, startDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Bitiş Tarihi</label>
                  <input type="date" value={invoiceForm.endDate}
                    onChange={e => setInvoiceForm({ ...invoiceForm, endDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Notlar</label>
                <textarea value={invoiceForm.notes}
                  onChange={e => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                  rows={2} placeholder="Fatura notları..." />
              </div>
              <div className="ct-invoice-preview">
                <small>Seçilen müşteri ve tarih aralığına ait maliyet kayıtları otomatik olarak faturaya eklenecektir. KDV %20 olarak hesaplanır.</small>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInvoiceForm(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Fatura Oluştur</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CostTrackingPage;
