import React, { useState, useEffect, useCallback, useRef } from 'react';
import './FieldTeamPage.css';

/* ════════════════════════════════════════════════════════════
   ICONS
   ════════════════════════════════════════════════════════════ */
const Icons = {
  team: (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  plus: (s=15) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>,
  x: (s=16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>,
  edit: (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3.5l3.5 3.5M3 10.5V14h3.5L14 6.5 10.5 3 3 10.5Z"/></svg>,
  trash: (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2.5 4h11M5.5 4V2.5h5V4M6.5 7v4M9.5 7v4M3.5 4l.5 9h8l.5-9"/></svg>,
  checkin: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  checkout: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  camera: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  map: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>,
  wrench: (s=13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2a4 4 0 0 1 1 7.9L6 14.5a1.5 1.5 0 0 1-2-2l4.6-4.9A4 4 0 0 1 10 2Z"/></svg>,
  clock: (s=13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5v4l2.5 1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  star: (s=13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2l1.5 3.2 3.5.5-2.5 2.4.6 3.4L8 10l-3.1 1.5.6-3.4L3 5.7l3.5-.5L8 2Z" strokeLinejoin="round"/></svg>,
  phone: (s=13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2.5h3l1.5 3.5L6 7.5a8.5 8.5 0 0 0 3.5 3.5l2.5-2.5 3.5 1.5V13A1.5 1.5 0 0 1 14 14.5C6.5 14 2 7.5 2 4A1.5 1.5 0 0 1 3 2.5Z"/></svg>,
  image: (s=30) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>,
};

/* ════════════════════════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════════════════════════ */
const TECH_STATUSES = [
  { id: 'available', label: 'Müsait',   color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
  { id: 'onsite',    label: 'Sahada',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
  { id: 'busy',      label: 'Meşgul',   color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)' },
  { id: 'offline',   label: 'Çevrimdışı', color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)' },
  { id: 'break',     label: 'Mola',     color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)' },
];

const TECH_COLORS = ['#6366f1','#f59e0b','#10b981','#f05252','#06b6d4','#a855f7','#ec4899','#14b8a6'];
const DEPARTMENTS = ['Bilişim', 'Mekanik', 'Elektrik', 'Yazılım', 'Ağ / Network', 'Güvenlik', 'Genel Teknik'];
const fmtDT = (d) => d ? new Date(d).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('tr-TR') : '—';

const STORAGE_KEY = 'sod_field_technicians';
const CHECKINS_KEY = 'sod_field_checkins';

function loadTechs() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

/* ════════════════════════════════════════════════════════════
   TECH MODAL
   ════════════════════════════════════════════════════════════ */
function TechModal({ tech, onSave, onClose }) {
  const [form, setForm] = useState(tech || {
    name: '', department: DEPARTMENTS[0], phone: '', email: '',
    status: 'available', color: TECH_COLORS[0], skills: '', rating: 5,
  });
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="ft-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ft-modal">
        <div className="ft-modal-header">
          <h2>{tech ? 'Teknisyen Düzenle' : 'Yeni Teknisyen'}</h2>
          <button className="ft-modal-close" onClick={onClose}>{Icons.x(18)}</button>
        </div>

        <div className="ft-form-row">
          <div className="ft-form-group">
            <label className="ft-form-label">Ad Soyad *</label>
            <input className="ft-form-input" value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Ahmet Yılmaz" />
          </div>
          <div className="ft-form-group">
            <label className="ft-form-label">Departman</label>
            <select className="ft-form-select" value={form.department} onChange={e => setF('department', e.target.value)}>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="ft-form-row">
          <div className="ft-form-group">
            <label className="ft-form-label">Telefon</label>
            <input className="ft-form-input" value={form.phone} onChange={e => setF('phone', e.target.value)} placeholder="+90 555 000 00 00" />
          </div>
          <div className="ft-form-group">
            <label className="ft-form-label">E-posta</label>
            <input className="ft-form-input" type="email" value={form.email} onChange={e => setF('email', e.target.value)} placeholder="ahmet@sirket.com" />
          </div>
        </div>

        <div className="ft-form-row">
          <div className="ft-form-group">
            <label className="ft-form-label">Durum</label>
            <select className="ft-form-select" value={form.status} onChange={e => setF('status', e.target.value)}>
              {TECH_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div className="ft-form-group">
            <label className="ft-form-label">Renk</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {TECH_COLORS.map(c => (
                <button key={c} onClick={() => setF('color', c)}
                  style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: form.color === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', transition: 'transform 0.1s', transform: form.color === c ? 'scale(1.2)' : 'scale(1)' }} />
              ))}
            </div>
          </div>
        </div>

        <div className="ft-form-row full">
          <div className="ft-form-group">
            <label className="ft-form-label">Uzmanlık Alanları</label>
            <input className="ft-form-input" value={form.skills} onChange={e => setF('skills', e.target.value)} placeholder="Sunucu kurulum, ağ yapılandırma, kamera..." />
          </div>
        </div>

        <div className="ft-modal-footer">
          <button className="ft-btn ft-btn-secondary ft-btn-sm" onClick={onClose}>İptal</button>
          <button className="ft-btn ft-btn-primary ft-btn-sm" onClick={() => {
            if (!form.name.trim()) return;
            onSave({ ...form, id: form.id || Date.now() });
          }}>Kaydet</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   DETAIL PANEL
   ════════════════════════════════════════════════════════════ */
function TechDetail({ tech, onCheckin, onCheckout, onPhotoAdd, allWorkOrders, checkins }) {
  const fileRef = useRef();
  const photos = (() => {
    try { return JSON.parse(localStorage.getItem(`sod_tech_photos_${tech.id}`)) || []; }
    catch { return []; }
  })();

  const status = TECH_STATUSES.find(s => s.id === tech.status) || TECH_STATUSES[0];
  const myJobs = allWorkOrders.filter(w => w.technician === tech.name);
  const myCheckins = checkins.filter(c => c.techId === tech.id).slice(0, 10);
  const isCheckedIn = myCheckins[0]?.type === 'in' && !myCheckins[0]?.checkedOut;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const p = { id: Date.now(), src: reader.result, name: file.name, at: new Date().toISOString() };
      const existing = (() => { try { return JSON.parse(localStorage.getItem(`sod_tech_photos_${tech.id}`)) || []; } catch { return []; } })();
      const updated = [p, ...existing].slice(0, 20);
      localStorage.setItem(`sod_tech_photos_${tech.id}`, JSON.stringify(updated));
      onPhotoAdd();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="ft-detail">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
        <div className="ft-avatar" style={{ background: tech.color, width: 52, height: 52, fontSize: '1.1rem' }}>
          {tech.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary,#e8e8ec)' }}>{tech.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary,#9a9aaa)' }}>{tech.department}</div>
          <div style={{ marginTop: 6 }}>
            <span className="ft-status-pill" style={{ background: status.bg, borderColor: status.border, color: status.color }}>
              {status.label}
            </span>
          </div>
        </div>
      </div>

      {/* Check-in/out */}
      <div className="ft-detail-section">
        <div className="ft-detail-section-label">Check-in / Check-out</div>
        <div className="ft-check-row">
          {!isCheckedIn ? (
            <button className="ft-btn ft-btn-success ft-btn-sm" onClick={() => onCheckin(tech.id)}>
              {Icons.checkin()} Check-in (Sahaya Çıkış)
            </button>
          ) : (
            <>
              <div className="ft-checkin-badge in">{Icons.checkin(13)} Sahada — {fmtDT(myCheckins[0].at)}</div>
              <button className="ft-btn ft-btn-danger ft-btn-sm" onClick={() => onCheckout(tech.id)}>
                {Icons.checkout()} Check-out (Dönüş)
              </button>
            </>
          )}
        </div>

        {/* Checkin history */}
        {myCheckins.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Son Hareketler</div>
            {myCheckins.slice(0, 5).map((ci, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary,#9a9aaa)', padding: '4px 0', borderBottom: '1px solid var(--border,rgba(255,255,255,0.04))' }}>
                <span style={{ color: ci.type === 'in' ? '#10b981' : '#f05252', fontWeight: 700, minWidth: 24 }}>{ci.type === 'in' ? 'IN' : 'OUT'}</span>
                <span>{fmtDT(ci.at)}</span>
                {ci.location && <span style={{ color: 'var(--text-muted)' }}>— {ci.location}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="ft-detail-section">
        <div className="ft-detail-section-label">İletişim</div>
        {tech.phone && <div className="ft-field-row"><span className="ft-field-label">{Icons.phone(12)} Telefon</span><span className="ft-field-val">{tech.phone}</span></div>}
        {tech.email && <div className="ft-field-row"><span className="ft-field-label">E-posta</span><span className="ft-field-val" style={{ fontSize: '0.78rem' }}>{tech.email}</span></div>}
        {tech.skills && <div className="ft-field-row"><span className="ft-field-label">Uzmanlık</span><span className="ft-field-val" style={{ fontSize: '0.78rem', maxWidth: '60%', textAlign: 'right' }}>{tech.skills}</span></div>}
      </div>

      {/* Assigned Jobs */}
      <div className="ft-detail-section">
        <div className="ft-detail-section-label">Atanan İş Emirleri ({myJobs.length})</div>
        {myJobs.length === 0 ? (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted,#6a6a7e)' }}>Atanan iş emri yok</div>
        ) : (
          <table className="ft-jobs-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Müşteri</th>
                <th>Durum</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {myJobs.slice(0, 8).map(j => (
                <tr key={j.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent,#4f7fff)' }}>{j.number}</td>
                  <td>{j.client}</td>
                  <td>
                    <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: 4, background: 'var(--bg-overlay,#18181d)', color: 'var(--text-secondary)' }}>{j.status}</span>
                  </td>
                  <td style={{ fontSize: '0.75rem' }}>{fmtDate(j.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Route */}
      {myJobs.filter(j => j.status !== 'completed' && j.status !== 'invoiced' && j.status !== 'cancelled').length > 0 && (
        <div className="ft-detail-section">
          <div className="ft-detail-section-label">{Icons.map()} Rota Sırası</div>
          <div className="ft-route-list">
            {myJobs.filter(j => j.status !== 'completed' && j.status !== 'invoiced' && j.status !== 'cancelled').slice(0, 5).map((j, idx) => (
              <div key={j.id} className="ft-route-item">
                <div className="ft-route-num">{idx + 1}</div>
                <div className="ft-route-info">
                  <div className="ft-route-title">{j.client}</div>
                  <div className="ft-route-sub">{j.title} {j.dueDate && `— Hedef: ${fmtDate(j.dueDate)}`}</div>
                </div>
                <div className="ft-route-status">
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: 4, background: 'var(--bg-overlay)', color: 'var(--text-secondary)' }}>{j.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Proof */}
      <div className="ft-detail-section">
        <div className="ft-detail-section-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{Icons.camera()} İş Kanıtı Fotoğrafları ({photos.length})</span>
        </div>
        <div className="ft-photos">
          {/* Upload button */}
          <label className="ft-photo-item ft-photo-add">
            {Icons.camera(20)}
            <span style={{ fontSize: '0.7rem' }}>Fotoğraf Ekle</span>
            <input ref={fileRef} type="file" accept="image/*" className="ft-photo-upload" onChange={handleFileChange} />
          </label>
          {photos.map(p => (
            <div key={p.id} className="ft-photo-item">
              <img src={p.src} alt={p.name} />
              <div className="ft-photo-label">{fmtDate(p.at)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN
   ════════════════════════════════════════════════════════════ */
export default function FieldTeamPage({ showToast, currentUser }) {
  const [techs, setTechs] = useState(loadTechs);
  const [checkins, setCheckins] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CHECKINS_KEY)) || []; } catch { return []; }
  });
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTech, setEditingTech] = useState(null);
  const [, forceUpdate] = useState(0);

  const persist = useCallback((data) => {
    setTechs(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const persistCheckins = useCallback((data) => {
    setCheckins(data);
    localStorage.setItem(CHECKINS_KEY, JSON.stringify(data));
  }, []);

  const workOrders = (() => {
    try { return JSON.parse(localStorage.getItem('sod_workorders')) || []; } catch { return []; }
  })();

  /* ── Stats ─────────────────────────────────────────────── */
  const stats = {
    total: techs.length,
    available: techs.filter(t => t.status === 'available').length,
    onsite: techs.filter(t => t.status === 'onsite').length,
    busy: techs.filter(t => t.status === 'busy' || t.status === 'break').length,
  };

  const selectedTech = techs.find(t => t.id === selectedId);

  /* ── Handlers ───────────────────────────────────────────── */
  const handleSaveTech = useCallback((tech) => {
    if (editingTech) {
      persist(techs.map(t => t.id === tech.id ? tech : t));
    } else {
      persist([...techs, tech]);
    }
    setShowModal(false);
    setEditingTech(null);
    showToast?.(editingTech ? 'Teknisyen güncellendi' : 'Teknisyen eklendi', 'success');
  }, [techs, editingTech, persist, showToast]);

  const handleDelete = useCallback((id) => {
    if (window.confirm('Bu teknisyeni silmek istediğinizden emin misiniz?')) {
      persist(techs.filter(t => t.id !== id));
      if (selectedId === id) setSelectedId(null);
      showToast?.('Teknisyen silindi', 'success');
    }
  }, [techs, selectedId, persist, showToast]);

  const handleCheckin = useCallback((techId) => {
    const entry = { id: Date.now(), techId, type: 'in', at: new Date().toISOString(), location: 'Saha' };
    persistCheckins([entry, ...checkins]);
    persist(techs.map(t => t.id === techId ? { ...t, status: 'onsite', lastCheckin: entry.at } : t));
    showToast?.('Check-in başarılı', 'success');
  }, [techs, checkins, persist, persistCheckins, showToast]);

  const handleCheckout = useCallback((techId) => {
    const entry = { id: Date.now(), techId, type: 'out', at: new Date().toISOString() };
    persistCheckins([entry, ...checkins]);
    persist(techs.map(t => t.id === techId ? { ...t, status: 'available', lastCheckout: entry.at } : t));
    showToast?.('Check-out başarılı', 'success');
  }, [techs, checkins, persist, persistCheckins, showToast]);

  const handleStatusChange = useCallback((techId, status) => {
    persist(techs.map(t => t.id === techId ? { ...t, status } : t));
    showToast?.('Durum güncellendi', 'success');
  }, [techs, persist, showToast]);

  return (
    <div className="ft-page page-content">
      <div className="ft-header">
        <div className="ft-header-left">
          <h1>{Icons.team(20)} Saha Ekip Yönetimi</h1>
          <p>Teknisyen takibi, check-in/out, rota ve iş kanıtı fotoğrafları</p>
        </div>
        <div className="ft-header-actions">
          <button className="ft-btn ft-btn-primary" onClick={() => { setEditingTech(null); setShowModal(true); }}>
            {Icons.plus()} Teknisyen Ekle
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="ft-stats">
        {[
          { label: 'Toplam', val: stats.total, color: '#6366f1', bg: '#6366f11a' },
          { label: 'Müsait', val: stats.available, color: '#10b981', bg: '#10b9811a' },
          { label: 'Sahada', val: stats.onsite, color: '#f59e0b', bg: '#f59e0b1a' },
          { label: 'Meşgul / Mola', val: stats.busy, color: '#f97316', bg: '#f973161a' },
        ].map(s => (
          <div key={s.label} className="ft-stat-card">
            <div className="ft-stat-icon" style={{ background: s.bg }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
            </div>
            <div>
              <div className="ft-stat-val" style={{ color: s.color }}>{s.val}</div>
              <div className="ft-stat-lbl">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Layout */}
      {techs.length === 0 ? (
        <div className="ft-empty">
          {Icons.team(48)}
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Saha Ekibi Henüz Boş</div>
          <p style={{ fontSize: '0.85rem', textAlign: 'center' }}>İlk teknisyeninizi ekleyin</p>
          <button className="ft-btn ft-btn-primary" onClick={() => setShowModal(true)}>{Icons.plus()} Teknisyen Ekle</button>
        </div>
      ) : (
        <div className="ft-layout">
          {/* Left: tech list */}
          <div className="ft-tech-list">
            {techs.map(tech => {
              const status = TECH_STATUSES.find(s => s.id === tech.status) || TECH_STATUSES[0];
              const jobCount = workOrders.filter(w => w.technician === tech.name && w.status !== 'completed' && w.status !== 'invoiced' && w.status !== 'cancelled').length;
              return (
                <div key={tech.id} className={`ft-tech-card ${selectedId === tech.id ? 'selected' : ''}`}
                  onClick={() => setSelectedId(tech.id)}>
                  <div className="ft-tech-header">
                    <div className="ft-avatar" style={{ background: tech.color, width: 38, height: 38, fontSize: '0.85rem' }}>
                      {tech.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="ft-tech-name">{tech.name}</div>
                      <div className="ft-tech-dept">{tech.department}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="ft-btn ft-btn-secondary ft-btn-sm" style={{ padding: '3px 7px' }}
                        onClick={e => { e.stopPropagation(); setEditingTech(tech); setShowModal(true); }}>{Icons.edit()}</button>
                      <button className="ft-btn ft-btn-secondary ft-btn-sm" style={{ padding: '3px 7px', color: '#f05252' }}
                        onClick={e => { e.stopPropagation(); handleDelete(tech.id); }}>{Icons.trash()}</button>
                    </div>
                  </div>
                  <div className="ft-tech-meta">
                    <span className="ft-status-pill" style={{ background: status.bg, borderColor: status.border, color: status.color }}>{status.label}</span>
                    {jobCount > 0 && (
                      <span style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: 10, background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontWeight: 700, border: '1px solid rgba(99,102,241,0.2)' }}>
                        {jobCount} açık iş
                      </span>
                    )}
                  </div>
                  {/* Quick status change */}
                  <div className="ft-tech-actions" onClick={e => e.stopPropagation()}>
                    {TECH_STATUSES.filter(s => s.id !== tech.status).map(s => (
                      <button key={s.id} className="ft-btn ft-btn-secondary ft-btn-sm"
                        style={{ padding: '3px 7px', fontSize: '0.7rem', color: s.color, borderColor: s.border }}
                        onClick={() => handleStatusChange(tech.id, s.id)}>{s.label}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: detail */}
          {selectedTech ? (
            <TechDetail
              tech={selectedTech}
              checkins={checkins}
              allWorkOrders={workOrders}
              onCheckin={handleCheckin}
              onCheckout={handleCheckout}
              onPhotoAdd={() => forceUpdate(x => x + 1)}
            />
          ) : (
            <div className="ft-empty">
              {Icons.team(36)}
              <p>Detayları görmek için bir teknisyen seçin</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <TechModal
          tech={editingTech}
          onSave={handleSaveTech}
          onClose={() => { setShowModal(false); setEditingTech(null); }}
        />
      )}
    </div>
  );
}
