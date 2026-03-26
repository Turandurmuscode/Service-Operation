import React, { useState, useEffect, useCallback } from 'react';
import './InvoicePage.css';

/* ════════════════════════════════════════════════════════════
   ICONS
   ════════════════════════════════════════════════════════════ */
const Icons = {
  invoice: (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
  plus: (s=15) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>,
  x: (s=16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>,
  eye: (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z"/><circle cx="8" cy="8" r="2"/></svg>,
  edit: (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3.5l3.5 3.5M3 10.5V14h3.5L14 6.5 10.5 3 3 10.5Z"/></svg>,
  send: (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2L7 9M14 2l-4 12-3-5-5-3 12-4Z"/></svg>,
  check: (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8.5l3 3 6-6"/></svg>,
  trash: (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2.5 4h11M5.5 4V2.5h5V4M6.5 7v4M9.5 7v4M3.5 4l.5 9h8l.5-9"/></svg>,
  download: (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 2v9M5 8l3 3 3-3M3 13h10"/></svg>,
  search: (s=15) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14" strokeLinecap="round"/></svg>,
  money: (s=20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  wrench: (s=13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2a4 4 0 0 1 1 7.9L6 14.5a1.5 1.5 0 0 1-2-2l4.6-4.9A4 4 0 0 1 10 2Z"/></svg>,
  file: (s=13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 1.5h6.5L13 5v9.5H3V1.5Z" strokeLinejoin="round"/></svg>,
  print: (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6V2h8v4M3 6h10a1 1 0 0 1 1 1v5H2V7a1 1 0 0 1 1-1Z" strokeLinejoin="round"/><path d="M5 11h6v3H5z"/><circle cx="12" cy="9" r="0.75" fill="currentColor"/></svg>,
};

/* ════════════════════════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════════════════════════ */
const INV_STATUSES = [
  { id: 'all',      label: 'Tümü',        color: '#64748b' },
  { id: 'draft',    label: 'Taslak',      color: '#94a3b8' },
  { id: 'sent',     label: 'Gönderildi',  color: '#6366f1' },
  { id: 'paid',     label: 'Ödendi',      color: '#10b981' },
  { id: 'overdue',  label: 'Gecikmiş',    color: '#f05252' },
  { id: 'cancelled',label: 'İptal',       color: '#78716c' },
];

const TAX_RATE = 20;
const fmtMoney = (n) => '₺' + (n || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('tr-TR') : '—';
const uid = () => 'INV-' + Date.now().toString(36).toUpperCase().slice(-6);

function badgeStyle(id) {
  const s = INV_STATUSES.find(x => x.id === id);
  if (!s) return {};
  return { background: s.color + '1a', borderColor: s.color + '4d', color: s.color };
}

function calcTotals(items, taxRate = TAX_RATE, discount = 0) {
  const sub = items.reduce((acc, i) => acc + (parseFloat(i.qty) || 0) * (parseFloat(i.unitPrice) || 0), 0);
  const disc = sub * (discount / 100);
  const taxable = sub - disc;
  const tax = taxable * (taxRate / 100);
  return { subtotal: sub, discountAmount: disc, taxable, tax, total: taxable + tax };
}

/* ════════════════════════════════════════════════════════════
   INVOICE MODAL
   ════════════════════════════════════════════════════════════ */
function InvoiceModal({ inv, workOrders, onSave, onClose }) {
  const emptyForm = {
    client: '', description: '', status: 'draft', dueDate: '', taxRate: TAX_RATE,
    discount: 0, notes: '', woRef: '',
    items: [{ name: '', qty: 1, unit: 'Adet', unitPrice: 0 }],
  };
  const [form, setForm] = useState(inv ? { ...inv } : emptyForm);
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setItem = (idx, k, v) => {
    const items = form.items.map((it, i) => i === idx ? { ...it, [k]: v } : it);
    setF('items', items);
  };
  const addItem = () => setF('items', [...form.items, { name: '', qty: 1, unit: 'Adet', unitPrice: 0 }]);
  const removeItem = (idx) => setF('items', form.items.filter((_, i) => i !== idx));

  const totals = calcTotals(form.items, parseFloat(form.taxRate) || 0, parseFloat(form.discount) || 0);

  // Auto-fill from work order
  const handleWOChange = (woId) => {
    setF('woRef', woId);
    const wo = workOrders.find(w => w.id === parseInt(woId) || w.number === woId);
    if (wo) {
      setF('client', wo.client || '');
      setF('description', wo.title || '');
      if (wo.amount) {
        setF('items', [{ name: wo.title || 'Servis Hizmeti', qty: 1, unit: 'Adet', unitPrice: parseFloat(wo.amount) || 0 }]);
      }
    }
  };

  return (
    <div className="inv-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="inv-modal">
        <div className="inv-modal-header">
          <h2>{Icons.invoice(16)} {inv ? 'Fatura Düzenle' : 'Yeni Fatura'}</h2>
          <button className="inv-modal-close" onClick={onClose}>{Icons.x(18)}</button>
        </div>

        {workOrders.length > 0 && !inv && (
          <div className="inv-form-row full">
            <div className="inv-form-group">
              <label className="inv-form-label">İş Emrinden Oluştur (opsiyonel)</label>
              <select className="inv-form-select" value={form.woRef} onChange={e => handleWOChange(e.target.value)}>
                <option value="">— İş Emri Seç —</option>
                {workOrders.filter(w => w.status === 'completed' || w.status === 'invoiced').map(w => (
                  <option key={w.id} value={w.id}>{w.number} – {w.client}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="inv-form-row">
          <div className="inv-form-group">
            <label className="inv-form-label">Müşteri *</label>
            <input className="inv-form-input" value={form.client} onChange={e => setF('client', e.target.value)} placeholder="Müşteri adı..." />
          </div>
          <div className="inv-form-group">
            <label className="inv-form-label">Vade Tarihi</label>
            <input className="inv-form-input" type="date" value={form.dueDate} onChange={e => setF('dueDate', e.target.value)} />
          </div>
        </div>

        <div className="inv-form-row full">
          <div className="inv-form-group">
            <label className="inv-form-label">Açıklama</label>
            <input className="inv-form-input" value={form.description} onChange={e => setF('description', e.target.value)} placeholder="Fatura açıklaması..." />
          </div>
        </div>

        {/* Line Items */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <label className="inv-form-label" style={{ margin: 0 }}>Kalemler</label>
            <button className="inv-btn inv-btn-secondary inv-btn-sm" onClick={addItem}>{Icons.plus()} Kalem Ekle</button>
          </div>
          <table className="inv-items-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Açıklama</th>
                <th style={{ width: '10%' }}>Miktar</th>
                <th style={{ width: '12%' }}>Birim</th>
                <th style={{ width: '18%' }}>Birim Fiyat</th>
                <th style={{ width: '14%' }}>Toplam</th>
                <th style={{ width: '6%' }}></th>
              </tr>
            </thead>
            <tbody>
              {form.items.map((item, idx) => (
                <tr key={idx}>
                  <td><input className="inv-item-input" value={item.name} onChange={e => setItem(idx, 'name', e.target.value)} placeholder="Ürün/Hizmet" /></td>
                  <td><input className="inv-item-input" type="number" value={item.qty} onChange={e => setItem(idx, 'qty', e.target.value)} /></td>
                  <td><input className="inv-item-input" value={item.unit} onChange={e => setItem(idx, 'unit', e.target.value)} /></td>
                  <td><input className="inv-item-input" type="number" value={item.unitPrice} onChange={e => setItem(idx, 'unitPrice', e.target.value)} /></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-primary,#e8e8ec)', fontWeight: 600 }}>{fmtMoney((item.qty || 0) * (item.unitPrice || 0))}</td>
                  <td><button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted,#6a6a7e)', padding: 4 }} onClick={() => removeItem(idx)}>{Icons.x(12)}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="inv-totals">
            <div>Ara Toplam: <strong>{fmtMoney(totals.subtotal)}</strong></div>
            {parseFloat(form.discount) > 0 && <div>İskonto ({form.discount}%): <strong>-{fmtMoney(totals.discountAmount)}</strong></div>}
            {parseFloat(form.taxRate) > 0 && <div>KDV ({form.taxRate}%): <strong>+{fmtMoney(totals.tax)}</strong></div>}
            <div className="total-row">TOPLAM: {fmtMoney(totals.total)}</div>
          </div>
        </div>

        <div className="inv-form-row">
          <div className="inv-form-group">
            <label className="inv-form-label">KDV (%)</label>
            <input className="inv-form-input" type="number" value={form.taxRate} onChange={e => setF('taxRate', e.target.value)} />
          </div>
          <div className="inv-form-group">
            <label className="inv-form-label">İskonto (%)</label>
            <input className="inv-form-input" type="number" value={form.discount} onChange={e => setF('discount', e.target.value)} />
          </div>
        </div>

        <div className="inv-form-row">
          <div className="inv-form-group">
            <label className="inv-form-label">Durum</label>
            <select className="inv-form-select" value={form.status} onChange={e => setF('status', e.target.value)}>
              {INV_STATUSES.filter(s => s.id !== 'all').map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div className="inv-form-group">
            <label className="inv-form-label">Notlar</label>
            <input className="inv-form-input" value={form.notes} onChange={e => setF('notes', e.target.value)} placeholder="İç notlar..." />
          </div>
        </div>

        <div className="inv-modal-footer">
          <button className="inv-btn inv-btn-secondary inv-btn-sm" onClick={onClose}>İptal</button>
          <button className="inv-btn inv-btn-primary inv-btn-sm" onClick={() => {
            if (!form.client.trim()) return;
            const t = calcTotals(form.items, parseFloat(form.taxRate) || 0, parseFloat(form.discount) || 0);
            onSave({ ...form, ...t });
          }}>Kaydet</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PREVIEW MODAL
   ════════════════════════════════════════════════════════════ */
function InvoicePreview({ inv, onClose }) {
  const today = new Date().toLocaleDateString('tr-TR');
  return (
    <div className="inv-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="inv-modal" style={{ maxWidth: 680 }}>
        <div className="inv-modal-header">
          <h2>{Icons.eye(16)} Fatura Önizleme</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="inv-btn inv-btn-secondary inv-btn-sm" onClick={() => window.print()}>{Icons.print()} Yazdır</button>
            <button className="inv-modal-close" onClick={onClose}>{Icons.x(18)}</button>
          </div>
        </div>
        <div className="inv-preview">
          <div className="inv-preview-header">
            <div>
              <div className="inv-preview-title">FATURA</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>Scor-Pi Servis Yönetim Sistemi</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.82rem', color: '#334155' }}>
              <div><strong>Fatura No:</strong> {inv.number}</div>
              <div><strong>Tarih:</strong> {today}</div>
              {inv.dueDate && <div><strong>Vade:</strong> {fmtDate(inv.dueDate)}</div>}
              {inv.woRef && <div><strong>İş Emri:</strong> {inv.woRef}</div>}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: '0.88rem', color: '#334155' }}>
            <strong>Faturalanan:</strong> {inv.client}
          </div>

          {inv.description && (
            <div style={{ marginBottom: 16, fontSize: '0.85rem', color: '#475569' }}>{inv.description}</div>
          )}

          <table>
            <thead>
              <tr>
                <th style={{ width: '45%' }}>Açıklama</th>
                <th>Miktar</th>
                <th>Birim</th>
                <th>Birim Fiyat</th>
                <th style={{ textAlign: 'right' }}>Toplam</th>
              </tr>
            </thead>
            <tbody>
              {(inv.items || []).map((item, i) => (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td>{item.qty}</td>
                  <td>{item.unit}</td>
                  <td>{fmtMoney(item.unitPrice)}</td>
                  <td style={{ textAlign: 'right' }}>{fmtMoney((item.qty || 0) * (item.unitPrice || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <div style={{ minWidth: 220, fontSize: '0.85rem', color: '#334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span>Ara Toplam</span><span>{fmtMoney(inv.subtotal)}</span>
              </div>
              {inv.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span>İskonto</span><span>-{fmtMoney(inv.discountAmount)}</span>
                </div>
              )}
              {inv.tax > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span>KDV ({inv.taxRate}%)</span><span>{fmtMoney(inv.tax)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 800, fontSize: '1rem', color: '#6366f1' }}>
                <span>TOPLAM</span><span>{fmtMoney(inv.total)}</span>
              </div>
            </div>
          </div>
          {inv.notes && <div style={{ marginTop: 20, padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: '0.8rem', color: '#64748b' }}><strong>Notlar:</strong> {inv.notes}</div>}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN
   ════════════════════════════════════════════════════════════ */
const STORAGE_KEY = 'sod_invoices';

export default function InvoicePage({ showToast, onNavigate }) {
  const [invoices, setInvoices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingInv, setEditingInv] = useState(null);
  const [previewInv, setPreviewInv] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setInvoices(saved ? JSON.parse(saved) : []);
    } catch { setInvoices([]); }
  }, []);

  const persist = useCallback((data) => {
    setInvoices(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const workOrders = (() => {
    try { return JSON.parse(localStorage.getItem('sod_workorders')) || []; }
    catch { return []; }
  })();

  /* ── Computed stats ─────────────────────────────────────── */
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0);
  const pendingRevenue = invoices.filter(i => i.status === 'sent').reduce((s, i) => s + (i.total || 0), 0);
  const overdueRevenue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + (i.total || 0), 0);

  // Auto-detect overdue
  const enriched = invoices.map(inv => {
    if (inv.status === 'sent' && inv.dueDate && new Date(inv.dueDate) < new Date()) {
      return { ...inv, status: 'overdue' };
    }
    return inv;
  });

  const visible = enriched.filter(inv => {
    if (filterStatus !== 'all' && inv.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!inv.number?.toLowerCase().includes(q) && !inv.client?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  /* ── CRUD ─────────────────────────────────────────────────── */
  const handleSave = useCallback((form) => {
    if (editingInv) {
      persist(invoices.map(i => i.id === editingInv.id ? { ...i, ...form } : i));
    } else {
      const inv = { ...form, id: Date.now(), number: uid(), createdAt: new Date().toISOString() };
      persist([inv, ...invoices]);
    }
    setShowModal(false);
    setEditingInv(null);
    showToast?.(editingInv ? 'Fatura güncellendi' : 'Fatura oluşturuldu', 'success');
  }, [invoices, editingInv, persist, showToast]);

  const handleDelete = useCallback((id) => {
    if (window.confirm('Bu faturayı silmek istediğinizden emin misiniz?')) {
      persist(invoices.filter(i => i.id !== id));
      showToast?.('Fatura silindi', 'success');
    }
  }, [invoices, persist, showToast]);

  const handleStatusChange = useCallback((id, status) => {
    persist(invoices.map(i => i.id === id ? { ...i, status } : i));
    showToast?.('Durum güncellendi', 'success');
  }, [invoices, persist, showToast]);

  return (
    <div className="inv-page page-content">
      <div className="inv-header">
        <div className="inv-header-left">
          <h1>{Icons.invoice(20)} Fatura Yönetimi</h1>
          <p>Teklif → İş Emri → <strong>Fatura</strong> zincirinin son halkası</p>
        </div>
        <button className="inv-btn inv-btn-primary" onClick={() => { setEditingInv(null); setShowModal(true); }}>
          {Icons.plus()} Yeni Fatura
        </button>
      </div>

      {/* Stats */}
      <div className="inv-stats">
        <div className="inv-stat-card">
          <div className="inv-stat-val" style={{ color: '#10b981' }}>{fmtMoney(totalRevenue)}</div>
          <div className="inv-stat-lbl">Tahsil Edilen</div>
        </div>
        <div className="inv-stat-card">
          <div className="inv-stat-val" style={{ color: '#6366f1' }}>{fmtMoney(pendingRevenue)}</div>
          <div className="inv-stat-lbl">Bekleyen</div>
        </div>
        <div className="inv-stat-card">
          <div className="inv-stat-val" style={{ color: '#f05252' }}>{fmtMoney(overdueRevenue)}</div>
          <div className="inv-stat-lbl">Gecikmiş</div>
        </div>
        <div className="inv-stat-card">
          <div className="inv-stat-val" style={{ color: 'var(--text-primary,#e8e8ec)' }}>{invoices.length}</div>
          <div className="inv-stat-lbl">Toplam Fatura</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="inv-toolbar">
        <div className="inv-search">
          {Icons.search()}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Fatura no, müşteri ara..." />
          {search && <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSearch('')}>{Icons.x(12)}</button>}
        </div>
        <select className="inv-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          {INV_STATUSES.map(s => {
            const cnt = s.id === 'all' ? enriched.length : enriched.filter(i => i.status === s.id).length;
            return <option key={s.id} value={s.id}>{s.label} ({cnt})</option>;
          })}
        </select>
      </div>

      {/* Table */}
      {visible.length === 0 ? (
        <div className="inv-empty">
          {Icons.invoice(48)}
          <p>Fatura bulunamadı.</p>
          <button className="inv-btn inv-btn-primary" onClick={() => setShowModal(true)}>{Icons.plus()} İlk Faturayı Oluştur</button>
        </div>
      ) : (
        <div className="inv-table-wrap">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Fatura No</th>
                <th>Müşteri</th>
                <th>Açıklama</th>
                <th>Tutar</th>
                <th>Vade</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(inv => (
                <tr key={inv.id}>
                  <td>
                    <div className="inv-num">{inv.number}</div>
                    {inv.woRef && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted,#6a6a7e)', marginTop: 2 }}>{Icons.wrench(10)} {inv.woRef}</div>}
                  </td>
                  <td><span className="inv-client">{inv.client}</span></td>
                  <td style={{ color: 'var(--text-secondary,#9a9aaa)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.description || '—'}</td>
                  <td>
                    <span className={`inv-amount ${inv.status === 'overdue' ? 'inv-overdue-amount' : ''}`}>
                      {fmtMoney(inv.total || inv.amount)}
                    </span>
                  </td>
                  <td style={{ color: inv.status === 'overdue' ? '#f05252' : 'var(--text-secondary,#9a9aaa)' }}>{fmtDate(inv.dueDate)}</td>
                  <td>
                    <span className="inv-badge" style={badgeStyle(inv.status)}>
                      {INV_STATUSES.find(s => s.id === inv.status)?.label || inv.status}
                    </span>
                  </td>
                  <td>
                    <div className="inv-td-actions">
                      <button className="inv-btn inv-btn-secondary inv-btn-sm" title="Önizle" onClick={() => setPreviewInv(inv)}>{Icons.eye()}</button>
                      <button className="inv-btn inv-btn-secondary inv-btn-sm" title="Düzenle" onClick={() => { setEditingInv(inv); setShowModal(true); }}>{Icons.edit()}</button>
                      {inv.status === 'draft' && (
                        <button className="inv-btn inv-btn-secondary inv-btn-sm" title="Gönder" style={{ color: '#6366f1' }}
                          onClick={() => handleStatusChange(inv.id, 'sent')}>{Icons.send()}</button>
                      )}
                      {inv.status === 'sent' && (
                        <button className="inv-btn inv-btn-secondary inv-btn-sm" title="Ödendi İşaretle" style={{ color: '#10b981' }}
                          onClick={() => handleStatusChange(inv.id, 'paid')}>{Icons.check()}</button>
                      )}
                      <button className="inv-btn inv-btn-secondary inv-btn-sm" title="Sil" style={{ color: '#f05252' }}
                        onClick={() => handleDelete(inv.id)}>{Icons.trash()}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <InvoiceModal
          inv={editingInv}
          workOrders={workOrders}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingInv(null); }}
        />
      )}

      {previewInv && (
        <InvoicePreview inv={previewInv} onClose={() => setPreviewInv(null)} />
      )}
    </div>
  );
}
