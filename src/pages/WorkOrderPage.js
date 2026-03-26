import React, { useState, useEffect, useCallback } from 'react';
import './WorkOrderPage.css';

/* ════════════════════════════════════════════════════════════
   ICONS
   ════════════════════════════════════════════════════════════ */
const Icons = {
  wrench: (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  plus: (s=15) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>,
  x: (s=16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>,
  edit: (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3.5l3.5 3.5M3 10.5V14h3.5L14 6.5 10.5 3 3 10.5Z"/></svg>,
  eye: (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z"/><circle cx="8" cy="8" r="2"/></svg>,
  invoice: (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="1.5" width="12" height="13" rx="1.5"/><path d="M5 5h6M5 7.5h6M5 10h3" strokeLinecap="round"/><path d="M10 10l1 1 2-2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  clock: (s=13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5v4l2.5 1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  user: (s=13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="2.5"/><path d="M2.5 13.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" strokeLinecap="round"/></svg>,
  calendar: (s=13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1.5" y="2.5" width="13" height="12" rx="1.5"/><path d="M5 1.5v2M11 1.5v2M1.5 6.5h13" strokeLinecap="round"/></svg>,
  check: (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8.5l3 3 6-6"/></svg>,
  file: (s=13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 1.5h6.5L13 5v9.5H3V1.5Z" strokeLinejoin="round"/><path d="M9.5 1.5v3.5H13" strokeLinecap="round"/></svg>,
  arrowRight: (s=13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>,
  search: (s=15) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14" strokeLinecap="round"/></svg>,
  send: (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2L7 9M14 2l-4 12-3-5-5-3 12-4Z"/></svg>,
  note: (s=13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 2.5h12v9H6l-3 2.5v-2.5H2v-9Z" strokeLinejoin="round"/></svg>,
  money: (s=13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1v14M5 4c0-1.1 1.3-2 3-2s3 .9 3 2-1.3 2-3 2-3 .9-3 2 1.3 2 3 2 3-.9 3-2" strokeLinecap="round"/></svg>,
};

/* ════════════════════════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════════════════════════ */
const STATUSES = [
  { id: 'all',        label: 'Tümü',        color: '#64748b' },
  { id: 'open',       label: 'Açık',        color: '#6366f1' },
  { id: 'assigned',   label: 'Atandı',      color: '#f59e0b' },
  { id: 'inprogress', label: 'İşlemde',     color: '#06b6d4' },
  { id: 'pending',    label: 'Beklemede',   color: '#a855f7' },
  { id: 'completed',  label: 'Tamamlandı',  color: '#10b981' },
  { id: 'invoiced',   label: 'Faturalandı', color: '#64748b' },
  { id: 'cancelled',  label: 'İptal',       color: '#f05252' },
];

const PRIORITIES = [
  { id: 'low',      label: 'Düşük',    color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  { id: 'medium',   label: 'Orta',     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { id: 'high',     label: 'Yüksek',   color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  { id: 'critical', label: 'Kritik',   color: '#f05252', bg: 'rgba(240,82,82,0.1)' },
];

const DEMO_TECHNICIANS = [
  'Ahmet Yılmaz', 'Mehmet Kaya', 'Ali Demir',
  'Fatma Çelik', 'Ayşe Şahin', 'Hasan Arslan',
];

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
const fmtMoney = (n) => '₺' + (n || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 });
const uid = () => 'WO-' + Date.now().toString(36).toUpperCase().slice(-5);

function statusStyle(id) {
  const s = STATUSES.find(x => x.id === id);
  if (!s) return {};
  let bg = s.color + '1a', border = s.color + '4d';
  return { background: bg, borderColor: border, color: s.color };
}
function priorityStyle(id) {
  const p = PRIORITIES.find(x => x.id === id);
  if (!p) return {};
  return { background: p.bg, color: p.color };
}

/* ════════════════════════════════════════════════════════════
   DETAIL PANEL
   ════════════════════════════════════════════════════════════ */
function WorkOrderDetail({ wo, onClose, onStatusChange, onInvoice, currentUser }) {
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`sod_wo_notes_${wo.id}`)) || []; }
    catch { return []; }
  });

  const addNote = () => {
    if (!noteText.trim()) return;
    const n = { text: noteText, by: currentUser?.name || 'Kullanıcı', at: new Date().toISOString() };
    const updated = [n, ...notes];
    setNotes(updated);
    localStorage.setItem(`sod_wo_notes_${wo.id}`, JSON.stringify(updated));
    setNoteText('');
  };

  const status = STATUSES.find(s => s.id === wo.status) || STATUSES[1];
  const priority = PRIORITIES.find(p => p.id === wo.priority) || PRIORITIES[1];

  return (
    <div className="wo-detail">
      <div className="wo-detail-header">
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{wo.number}</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary,#e8e8ec)', marginTop: 2 }}>{wo.title}</div>
        </div>
        <button className="wo-detail-closer" onClick={onClose}>{Icons.x(18)}</button>
      </div>

      {/* Chain */}
      <div className="wo-chain-banner">
        <span className="wo-chain-step done">{Icons.file(12)} Teklif</span>
        <span className="wo-chain-arrow">{Icons.arrowRight(12)}</span>
        <span className="wo-chain-step current">{Icons.wrench(12)} İş Emri</span>
        <span className="wo-chain-arrow">{Icons.arrowRight(12)}</span>
        <span className={`wo-chain-step ${wo.status === 'invoiced' ? 'done' : ''}`}>{Icons.invoice(12)} Fatura</span>
      </div>

      {/* Info */}
      <div className="wo-detail-section">
        <div className="wo-detail-section-label">Bilgiler</div>
        <div className="wo-detail-field"><span className="wo-detail-field-label">Müşteri</span><span className="wo-detail-field-val">{wo.client}</span></div>
        <div className="wo-detail-field"><span className="wo-detail-field-label">Durum</span>
          <span className="wo-badge" style={statusStyle(wo.status)}>{status.label}</span>
        </div>
        <div className="wo-detail-field"><span className="wo-detail-field-label">Öncelik</span>
          <span className="wo-priority-badge" style={priorityStyle(wo.priority)}>{priority.label}</span>
        </div>
        <div className="wo-detail-field"><span className="wo-detail-field-label">Teknisyen</span><span className="wo-detail-field-val">{wo.technician || '—'}</span></div>
        <div className="wo-detail-field"><span className="wo-detail-field-label">Başlangıç</span><span className="wo-detail-field-val">{fmtDate(wo.startDate)}</span></div>
        <div className="wo-detail-field"><span className="wo-detail-field-label">Bitiş Hedefi</span><span className="wo-detail-field-val">{fmtDate(wo.dueDate)}</span></div>
        <div className="wo-detail-field"><span className="wo-detail-field-label">Tahmini Süre</span><span className="wo-detail-field-val">{wo.estimatedHours ? wo.estimatedHours + ' sa' : '—'}</span></div>
        <div className="wo-detail-field"><span className="wo-detail-field-label">Gerçekleşen Süre</span><span className="wo-detail-field-val">{wo.actualHours ? wo.actualHours + ' sa' : '—'}</span></div>
        <div className="wo-detail-field"><span className="wo-detail-field-label">Tahmini Tutar</span><span className="wo-detail-field-val" style={{ color: '#10b981' }}>{fmtMoney(wo.amount)}</span></div>
        {wo.quoteRef && <div className="wo-detail-field"><span className="wo-detail-field-label">Teklif Ref.</span><span className="wo-detail-field-val">{wo.quoteRef}</span></div>}
      </div>

      {/* Description */}
      {wo.description && (
        <div className="wo-detail-section">
          <div className="wo-detail-section-label">Açıklama</div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary,#9a9aaa)', lineHeight: 1.6 }}>{wo.description}</p>
        </div>
      )}

      {/* Actions */}
      <div className="wo-detail-section">
        <div className="wo-detail-section-label">Durum Değiştir</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUSES.filter(s => s.id !== 'all' && s.id !== wo.status).map(s => (
            <button key={s.id} className="wo-btn wo-btn-secondary wo-btn-sm"
              style={{ borderColor: s.color + '4d', color: s.color }}
              onClick={() => onStatusChange(wo.id, s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {wo.status === 'completed' && wo.status !== 'invoiced' && (
        <button className="wo-btn wo-btn-success" style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }}
          onClick={() => onInvoice(wo)}>
          {Icons.invoice()} Fatura Oluştur
        </button>
      )}

      {/* Notes */}
      <div className="wo-detail-section">
        <div className="wo-detail-section-label">{Icons.note()} Notlar ({notes.length})</div>
        <div className="wo-notes">
          {notes.length === 0 && <div style={{ color: 'var(--text-muted,#6a6a7e)', fontSize: '0.8rem' }}>Henüz not yok</div>}
          {notes.map((n, i) => (
            <div key={i} className="wo-note">
              <div className="wo-note-time">{n.by} — {fmtDate(n.at)}</div>
              {n.text}
            </div>
          ))}
        </div>
        <div className="wo-note-add">
          <input value={noteText} onChange={e => setNoteText(e.target.value)}
            placeholder="Not ekle..." onKeyDown={e => e.key === 'Enter' && addNote()} />
          <button className="wo-btn wo-btn-primary wo-btn-sm" onClick={addNote}>Ekle</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   FORM MODAL
   ════════════════════════════════════════════════════════════ */
function WorkOrderModal({ wo, quotes, onSave, onClose }) {
  const emptyForm = {
    title: '', client: '', description: '', priority: 'medium',
    status: 'open', technician: '', startDate: new Date().toISOString().split('T')[0],
    dueDate: '', estimatedHours: '', actualHours: '', amount: '', quoteRef: '',
  };
  const [form, setForm] = useState(wo ? { ...wo } : emptyForm);
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Auto-fill from quote
  const handleQuoteChange = (qId) => {
    setF('quoteRef', qId);
    const q = quotes.find(x => x.id === qId || x.number === qId);
    if (q) {
      setF('client', q.client || q.clientName || '');
      setF('amount', q.total || q.grandTotal || 0);
      setF('title', `Teklif ${qId} – Servis`);
    }
  };

  return (
    <div className="wo-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="wo-modal">
        <div className="wo-modal-header">
          <h2>{Icons.wrench(16)} {wo ? 'İş Emri Düzenle' : 'Yeni İş Emri'}</h2>
          <button className="wo-modal-close" onClick={onClose}>{Icons.x(18)}</button>
        </div>

        {quotes.length > 0 && !wo && (
          <div className="wo-form-row full">
            <div className="wo-form-group">
              <label className="wo-form-label">Onaylı Tekliften Oluştur (opsiyonel)</label>
              <select className="wo-form-select" value={form.quoteRef} onChange={e => handleQuoteChange(e.target.value)}>
                <option value="">— Teklif seç —</option>
                {quotes.filter(q => q.status === 'approved').map(q => (
                  <option key={q.id} value={q.id}>{q.number || q.id} – {q.client}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="wo-form-row">
          <div className="wo-form-group">
            <label className="wo-form-label">Başlık *</label>
            <input className="wo-form-input" value={form.title} onChange={e => setF('title', e.target.value)} placeholder="İş emri başlığı..." />
          </div>
          <div className="wo-form-group">
            <label className="wo-form-label">Müşteri *</label>
            <input className="wo-form-input" value={form.client} onChange={e => setF('client', e.target.value)} placeholder="Müşteri adı..." />
          </div>
        </div>

        <div className="wo-form-row full">
          <div className="wo-form-group">
            <label className="wo-form-label">Açıklama</label>
            <textarea className="wo-form-textarea" value={form.description} onChange={e => setF('description', e.target.value)} placeholder="İş emri detayları..." />
          </div>
        </div>

        <div className="wo-form-row">
          <div className="wo-form-group">
            <label className="wo-form-label">Öncelik</label>
            <select className="wo-form-select" value={form.priority} onChange={e => setF('priority', e.target.value)}>
              {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div className="wo-form-group">
            <label className="wo-form-label">Durum</label>
            <select className="wo-form-select" value={form.status} onChange={e => setF('status', e.target.value)}>
              {STATUSES.filter(s => s.id !== 'all').map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div className="wo-form-row">
          <div className="wo-form-group">
            <label className="wo-form-label">Teknisyen</label>
            <select className="wo-form-select" value={form.technician} onChange={e => setF('technician', e.target.value)}>
              <option value="">— Atanmadı —</option>
              {DEMO_TECHNICIANS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="wo-form-group">
            <label className="wo-form-label">Tahmini Tutar (₺)</label>
            <input className="wo-form-input" type="number" value={form.amount} onChange={e => setF('amount', e.target.value)} placeholder="0.00" />
          </div>
        </div>

        <div className="wo-form-row">
          <div className="wo-form-group">
            <label className="wo-form-label">Başlangıç Tarihi</label>
            <input className="wo-form-input" type="date" value={form.startDate} onChange={e => setF('startDate', e.target.value)} />
          </div>
          <div className="wo-form-group">
            <label className="wo-form-label">Bitiş Hedefi</label>
            <input className="wo-form-input" type="date" value={form.dueDate} onChange={e => setF('dueDate', e.target.value)} />
          </div>
        </div>

        <div className="wo-form-row">
          <div className="wo-form-group">
            <label className="wo-form-label">Tahmini Süre (saat)</label>
            <input className="wo-form-input" type="number" value={form.estimatedHours} onChange={e => setF('estimatedHours', e.target.value)} placeholder="0" />
          </div>
          <div className="wo-form-group">
            <label className="wo-form-label">Gerçekleşen Süre (saat)</label>
            <input className="wo-form-input" type="number" value={form.actualHours} onChange={e => setF('actualHours', e.target.value)} placeholder="0" />
          </div>
        </div>

        <div className="wo-modal-footer">
          <button className="wo-btn wo-btn-secondary wo-btn-sm" onClick={onClose}>İptal</button>
          <button className="wo-btn wo-btn-primary wo-btn-sm" onClick={() => {
            if (!form.title.trim() || !form.client.trim()) return;
            onSave(form);
          }}>Kaydet</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN
   ════════════════════════════════════════════════════════════ */
const STORAGE_KEY = 'sod_workorders';

export default function WorkOrderPage({ currentUser, showToast, onNavigate }) {
  const [workOrders, setWorkOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingWO, setEditingWO] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [search, setSearch] = useState('');

  /* ── Load ─────────────────────────────────────────────────── */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setWorkOrders(saved ? JSON.parse(saved) : []);
    } catch { setWorkOrders([]); }
  }, []);

  const persist = useCallback((data) => {
    setWorkOrders(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const quotes = (() => {
    try { return JSON.parse(localStorage.getItem('sod_quotations')) || []; }
    catch { return []; }
  })();

  /* ── Stats ────────────────────────────────────────────────── */
  const stats = {
    total: workOrders.length,
    open: workOrders.filter(w => w.status === 'open' || w.status === 'assigned').length,
    inProgress: workOrders.filter(w => w.status === 'inprogress').length,
    completed: workOrders.filter(w => w.status === 'completed').length,
    invoiced: workOrders.filter(w => w.status === 'invoiced').length,
  };

  /* ── Filter ───────────────────────────────────────────────── */
  const visible = workOrders.filter(w => {
    if (filterStatus !== 'all' && w.status !== filterStatus) return false;
    if (filterPriority !== 'all' && w.priority !== filterPriority) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!w.title?.toLowerCase().includes(q) && !w.client?.toLowerCase().includes(q) && !w.number?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  /* ── CRUD ─────────────────────────────────────────────────── */
  const handleSave = useCallback((form) => {
    if (editingWO) {
      persist(workOrders.map(w => w.id === editingWO.id ? { ...w, ...form } : w));
    } else {
      const wo = { ...form, id: Date.now(), number: uid(), createdAt: new Date().toISOString() };
      persist([wo, ...workOrders]);
    }
    setShowModal(false);
    setEditingWO(null);
    showToast?.(editingWO ? 'İş emri güncellendi' : 'İş emri oluşturuldu', 'success');
  }, [workOrders, editingWO, persist, showToast]);

  const handleStatusChange = useCallback((id, status) => {
    const updated = workOrders.map(w => w.id === id ? { ...w, status } : w);
    persist(updated);
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
    showToast?.('Durum güncellendi', 'success');
  }, [workOrders, persist, showToast]);

  const handleInvoice = useCallback((wo) => {
    // Mark work order as invoiced
    const updated = workOrders.map(w => w.id === wo.id ? { ...w, status: 'invoiced' } : w);
    persist(updated);

    // Create invoice draft in invoice storage
    const invoices = (() => { try { return JSON.parse(localStorage.getItem('sod_invoices')) || []; } catch { return []; } })();
    const invoice = {
      id: Date.now(),
      number: 'INV-' + Date.now().toString(36).toUpperCase().slice(-5),
      woRef: wo.number,
      woId: wo.id,
      client: wo.client,
      amount: parseFloat(wo.amount) || 0,
      status: 'draft',
      createdAt: new Date().toISOString(),
      dueDate: '',
      description: wo.title,
    };
    localStorage.setItem('sod_invoices', JSON.stringify([invoice, ...invoices]));
    showToast?.('Fatura taslağı oluşturuldu', 'success');
    setSelected(null);
    if (onNavigate) onNavigate('invoices');
  }, [workOrders, persist, showToast, onNavigate]);

  return (
    <div className="wo-page page-content">
      <div className="wo-header">
        <div className="wo-header-left">
          <h1>{Icons.wrench(20)} İş Emirleri</h1>
          <p>Teklif → <strong>İş Emri</strong> → Fatura zincirinin orta halkası</p>
        </div>
        <button className="wo-btn wo-btn-primary" onClick={() => { setEditingWO(null); setShowModal(true); }}>
          {Icons.plus()} Yeni İş Emri
        </button>
      </div>

      {/* Stats */}
      <div className="wo-stats">
        {[
          { label: 'Toplam', val: stats.total, color: '#6366f1', bg: '#6366f11a' },
          { label: 'Açık / Atandı', val: stats.open, color: '#f59e0b', bg: '#f59e0b1a' },
          { label: 'İşlemde', val: stats.inProgress, color: '#06b6d4', bg: '#06b6d41a' },
          { label: 'Tamamlandı', val: stats.completed, color: '#10b981', bg: '#10b9811a' },
          { label: 'Faturalandı', val: stats.invoiced, color: '#64748b', bg: '#64748b1a' },
        ].map(s => (
          <div key={s.label} className="wo-stat-card">
            <div className="wo-stat-icon" style={{ background: s.bg }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
            </div>
            <div>
              <div className="wo-stat-val" style={{ color: s.color }}>{s.val}</div>
              <div className="wo-stat-lbl">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline filter */}
      <div className="wo-pipeline">
        {STATUSES.map(s => {
          const cnt = s.id === 'all' ? workOrders.length : workOrders.filter(w => w.status === s.id).length;
          return (
            <button key={s.id} className={`wo-pipeline-step ${filterStatus === s.id ? 'active' : ''}`}
              onClick={() => setFilterStatus(s.id)}>
              <div className="wo-pipeline-dot" style={{ background: s.color }} />
              {s.label}
              <span className="wo-pipeline-count">{cnt}</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="wo-toolbar">
        <div className="wo-search">
          {Icons.search()} 
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="İş emri, müşteri ara..." />
          {search && <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSearch('')}>{Icons.x(12)}</button>}
        </div>
        <select className="wo-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="all">Tüm Öncelikler</option>
          {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="wo-empty">
          {Icons.wrench(48)}
          <p>İş emri bulunamadı.</p>
          <button className="wo-btn wo-btn-primary" onClick={() => setShowModal(true)}>{Icons.plus()} İlk İş Emrini Oluştur</button>
        </div>
      ) : (
        <div className="wo-list">
          {visible.map(wo => {
            const priority = PRIORITIES.find(p => p.id === wo.priority);
            const isDue = wo.dueDate && new Date(wo.dueDate) < new Date() && wo.status !== 'completed' && wo.status !== 'invoiced';
            return (
              <div key={wo.id} className={`wo-card priority-${wo.priority}`}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="wo-card-top">
                    <span className="wo-card-id">{wo.number}</span>
                    <span className="wo-badge" style={statusStyle(wo.status)}>
                      {STATUSES.find(s => s.id === wo.status)?.label || wo.status}
                    </span>
                    {priority && (
                      <span className="wo-priority-badge" style={priorityStyle(wo.priority)}>{priority.label}</span>
                    )}
                    {isDue && <span style={{ fontSize: '0.7rem', color: '#f05252', fontWeight: 700 }}>Gecikmiş!</span>}
                  </div>
                  <div className="wo-card-title">{wo.title}</div>
                  <div className="wo-card-client">{wo.client}</div>
                  <div className="wo-card-meta">
                    {wo.technician && <span className="wo-meta-chip">{Icons.user()} {wo.technician}</span>}
                    {wo.dueDate && <span className="wo-meta-chip" style={{ color: isDue ? '#f05252' : undefined }}>{Icons.calendar()} {fmtDate(wo.dueDate)}</span>}
                    {wo.estimatedHours && <span className="wo-meta-chip">{Icons.clock()} {wo.estimatedHours} sa</span>}
                    {wo.amount > 0 && <span className="wo-meta-chip" style={{ color: '#10b981' }}>{Icons.money()} {fmtMoney(wo.amount)}</span>}
                    {wo.quoteRef && <span className="wo-meta-chip">{Icons.file()} Teklif:{wo.quoteRef}</span>}
                  </div>
                  {wo.estimatedHours && wo.actualHours && (
                    <div className="wo-progress-wrap">
                      <div className="wo-progress-label">
                        <span>İlerleme</span>
                        <span>{Math.min(100, Math.round((wo.actualHours / wo.estimatedHours) * 100))}%</span>
                      </div>
                      <div className="wo-progress-bar">
                        <div className="wo-progress-fill" style={{
                          width: Math.min(100, (wo.actualHours / wo.estimatedHours) * 100) + '%',
                          background: wo.actualHours > wo.estimatedHours ? '#f05252' : '#6366f1'
                        }} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="wo-card-actions">
                  <div className="wo-card-actions-row">
                    <button className="wo-btn wo-btn-secondary wo-btn-sm" onClick={() => { setSelected(wo); }}>{Icons.eye()} Detay</button>
                    <button className="wo-btn wo-btn-secondary wo-btn-sm" onClick={() => { setEditingWO(wo); setShowModal(true); }}>{Icons.edit()}</button>
                  </div>
                  {wo.status === 'completed' && (
                    <button className="wo-btn wo-btn-success wo-btn-sm" onClick={() => handleInvoice(wo)}>
                      {Icons.invoice()} Fatura
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <WorkOrderModal
          wo={editingWO}
          quotes={quotes}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingWO(null); }}
        />
      )}

      {selected && (
        <WorkOrderDetail
          wo={selected}
          currentUser={currentUser}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onInvoice={handleInvoice}
        />
      )}
    </div>
  );
}
