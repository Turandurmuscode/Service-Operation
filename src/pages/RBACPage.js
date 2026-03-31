import React, { useState, useCallback } from 'react';
import './RBACPage.css';

/* ════════════════════════════════════════════════════════════
   ICONS
   ════════════════════════════════════════════════════════════ */
const Icons = {
  shield: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 4v6c0 5.25-8 10-8 10S4 17.25 4 12V6l8-4Z"/></svg>,
  plus: (s = 15) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>,
  edit: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3.5l3.5 3.5M3 10.5V14h3.5L14 6.5 10.5 3 3 10.5Z"/></svg>,
  trash: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2.5 4h11M5.5 4V2.5h5V4M6.5 7v4M9.5 7v4M3.5 4l.5 9h8l.5-9"/></svg>,
  info: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8v.01"/></svg>,
  check: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8.5l3 3 6-6"/></svg>,
  x: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>,
  lock: (s = 13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="7" width="10" height="8" rx="1.5"/><path d="M5 7V5a3 3 0 016 0v2" strokeLinecap="round"/></svg>,
  users: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="5" r="2"/><path d="M1.5 14c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" strokeLinecap="round"/><circle cx="11.5" cy="5.5" r="1.5"/><path d="M11.5 9c1.8 0 3.2 1.2 3.2 3" strokeLinecap="round"/></svg>,
  tag: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1.5 1.5h6l7 7-6 6-7-7v-6Z" strokeLinejoin="round"/><circle cx="5.5" cy="5.5" r="1" fill="currentColor"/></svg>,
};

/* ════════════════════════════════════════════════════════════
   DATA
   ════════════════════════════════════════════════════════════ */
const PAGE_MATRIX = [
  { section: 'Genel', pages: [
    { id: 'dashboard',    label: 'Dashboard' },
    { id: 'incidents',    label: 'Arızalar' },
    { id: 'clients',      label: 'Müşteriler' },
    { id: 'contactlog',   label: 'İletişim Geçmişi' },
    { id: 'crmdeals',     label: 'CRM Kanban' },
    { id: 'announcements',label: 'Duyurular' },
    { id: 'followups',    label: 'Geri Arama / Takip' },
  ]},
  { section: 'İş & Gelir', pages: [
    { id: 'quotations',   label: 'Teklifler' },
    { id: 'workorders',   label: 'İş Emirleri' },
    { id: 'invoices',     label: 'Faturalar' },
    { id: 'contracts',    label: 'Sözleşmeler' },
    { id: 'costtracking', label: 'Maliyet Takibi' },
    { id: 'approvals',    label: 'Bekleyen Onaylar' },
  ]},
  { section: 'Saha & Ekip', pages: [
    { id: 'fieldteam',    label: 'Saha Ekip Yönetimi' },
    { id: 'timesheet',    label: 'Saat Takibi' },
    { id: 'kanban',       label: 'Kanban Board' },
    { id: 'calendar',     label: 'Takvim' },
    { id: 'checklists',   label: 'Kontrol Listeleri' },
    { id: 'projects',     label: 'Proje Yönetimi' },
    { id: 'scheduledmaintenance', label: 'Periyodik Bakım' },
    { id: 'techsummary',  label: 'Teknisyen Gün Sonu' },
  ]},
  { section: 'Kaynaklar', pages: [
    { id: 'assets',       label: 'Envanter' },
    { id: 'spareparts',   label: 'Yedek Parça' },
    { id: 'partrecognition', label: 'Foto Parca Tanima' },
    { id: 'knowledgebase',label: 'Bilgi Bankası' },
    { id: 'documents',    label: 'Dokümanlar' },
    { id: 'messaging',    label: 'Mesajlar' },
    { id: 'remoteaccess', label: 'Uzak Erişim' },
  ]},
  { section: 'Raporlama', pages: [
    { id: 'analytics',    label: 'Analiz' },
    { id: 'recurringissues', label: 'Tekrarlayan Arıza' },
    { id: 'reports',      label: 'Raporlar' },
  ]},
  { section: 'Sistem', pages: [
    { id: 'workflowrules',label: 'Otomasyon' },
    { id: 'integrations', label: 'Entegrasyonlar' },
    { id: 'rbac',         label: 'Yetki / Rol Matrisi' },
    { id: 'settings',     label: 'Ayarlar' },
    { id: 'modules',      label: 'Modüller' },
  ]},
];

const ACTION_FLAGS = [
  { id: 'canCreate',      label: 'Kayıt Oluşturma' },
  { id: 'canEdit',        label: 'Kayıt Düzenleme' },
  { id: 'canDelete',      label: 'Kayıt Silme' },
  { id: 'canExport',      label: 'Dışa Aktarma' },
  { id: 'canManageUsers', label: 'Kullanıcı Yönetimi' },
  { id: 'canApprove',     label: 'Onay Verme (Teklif/Fatura)' },
  { id: 'canAssignTech',  label: 'Teknisyen Atama' },
  { id: 'canViewCost',    label: 'Maliyet Görüntüleme' },
];

const DEFAULT_ROLES = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Tam yetkili sistem yöneticisi',
    color: '#f05252',
    isSystem: true,
    pages: PAGE_MATRIX.flatMap(s => s.pages.map(p => p.id)),
    canCreate: true, canEdit: true, canDelete: true, canExport: true,
    canManageUsers: true, canApprove: true, canAssignTech: true, canViewCost: true,
  },
  {
    id: 'manager',
    name: 'Yönetici',
    description: 'Departman yöneticisi, raporlama ve onay yetkisi',
    color: '#f59e0b',
    isSystem: true,
    pages: ['dashboard','incidents','clients','contactlog','crmdeals','followups','announcements','quotations','workorders','invoices','contracts','costtracking','approvals','fieldteam','timesheet','kanban','calendar','checklists','projects','scheduledmaintenance','techsummary','assets','spareparts','partrecognition','knowledgebase','documents','messaging','remoteaccess','analytics','recurringissues','reports','workflowrules'],
    canCreate: true, canEdit: true, canDelete: false, canExport: true,
    canManageUsers: false, canApprove: true, canAssignTech: true, canViewCost: true,
  },
  {
    id: 'technician',
    name: 'Teknisyen',
    description: 'Saha teknisyeni — iş emirleri ve kontrol listeleri',
    color: '#10b981',
    isSystem: true,
    pages: ['dashboard','incidents','followups','calendar','timesheet','checklists','announcements','fieldteam','techsummary','spareparts','partrecognition','knowledgebase','documents','projects'],
    canCreate: false, canEdit: true, canDelete: false, canExport: false,
    canManageUsers: false, canApprove: false, canAssignTech: false, canViewCost: false,
  },
  {
    id: 'accountant',
    name: 'Muhasebe',
    description: 'Fatura ve maliyet erişimi',
    color: '#6366f1',
    isSystem: false,
    pages: ['dashboard','quotations','invoices','contracts','costtracking','approvals','reports','documents'],
    canCreate: true, canEdit: true, canDelete: false, canExport: true,
    canManageUsers: false, canApprove: false, canAssignTech: false, canViewCost: true,
  },
  {
    id: 'support',
    name: 'Destek',
    description: 'Müşteri destek temsilcisi',
    color: '#06b6d4',
    isSystem: false,
    pages: ['dashboard','incidents','clients','contactlog','followups','messaging','announcements','checklists','knowledgebase','partrecognition'],
    canCreate: true, canEdit: true, canDelete: false, canExport: false,
    canManageUsers: false, canApprove: false, canAssignTech: false, canViewCost: false,
  },
];

const ROLE_COLORS = ['#f05252','#f59e0b','#10b981','#6366f1','#06b6d4','#a855f7','#ec4899','#64748b'];

const STORAGE_KEY = 'sod_rbac_roles';

function loadRoles() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_ROLES;
  } catch { return DEFAULT_ROLES; }
}

function saveRoles(roles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
}

/* ════════════════════════════════════════════════════════════
   TOGGLE
   ════════════════════════════════════════════════════════════ */
function Toggle({ checked, onChange, locked }) {
  return (
    <label className={`rbac-toggle ${locked ? 'rbac-toggle-locked' : ''}`}>
      <input type="checkbox" checked={checked} onChange={locked ? undefined : onChange} />
      <div className="rbac-toggle-track"><div className="rbac-toggle-knob" /></div>
    </label>
  );
}

/* ════════════════════════════════════════════════════════════
   ROLE MODAL
   ════════════════════════════════════════════════════════════ */
function RoleModal({ role, onSave, onClose }) {
  const [form, setForm] = useState(role || {
    id: '', name: '', description: '', color: ROLE_COLORS[0],
    isSystem: false,
    pages: ['dashboard'],
    canCreate: false, canEdit: false, canDelete: false, canExport: false,
    canManageUsers: false, canApprove: false, canAssignTech: false, canViewCost: false,
  });

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const togglePage = (pageId) => {
    setForm(f => ({
      ...f,
      pages: f.pages.includes(pageId)
        ? f.pages.filter(p => p !== pageId)
        : [...f.pages, pageId],
    }));
  };

  return (
    <div className="rbac-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rbac-modal">
        <div className="rbac-modal-header">
          <h2>{role ? 'Rol Düzenle' : 'Yeni Rol'}</h2>
          <button className="rbac-modal-close" onClick={onClose}>{Icons.x(16)}</button>
        </div>

        <div className="rbac-form-group">
          <label className="rbac-form-label">Rol Adı</label>
          <input className="rbac-form-input" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Örn: Muhasebe, Saha Takım Lideri..." />
        </div>

        <div className="rbac-form-group">
          <label className="rbac-form-label">Açıklama</label>
          <input className="rbac-form-input" value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Bu rolün sorumlulukları..." />
        </div>

        <div className="rbac-form-group">
          <label className="rbac-form-label">Renk</label>
          <div className="rbac-color-row">
            {ROLE_COLORS.map(c => (
              <button key={c} className={`rbac-color-btn ${form.color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setField('color', c)} />
            ))}
          </div>
        </div>

        <div className="rbac-form-group">
          <label className="rbac-form-label">Eylem Yetkileri</label>
          {ACTION_FLAGS.map(af => (
            <div key={af.id} className="rbac-action-row">
              <span className="rbac-action-label">{af.label}</span>
              <Toggle checked={!!form[af.id]} onChange={() => setField(af.id, !form[af.id])} />
            </div>
          ))}
        </div>

        <div className="rbac-form-group">
          <label className="rbac-form-label">Sayfa Erişimleri</label>
          {PAGE_MATRIX.map(section => (
            <div key={section.section} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted,#6a6a7e)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{section.section}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {section.pages.map(p => {
                  const enabled = form.pages.includes(p.id);
                  return (
                    <button key={p.id} onClick={() => togglePage(p.id)}
                      style={{ padding: '4px 10px', borderRadius: 6, fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all 0.12s',
                        background: enabled ? '#6366f1' : 'var(--bg-surface,#0e0e12)',
                        color: enabled ? '#fff' : 'var(--text-secondary,#9a9aaa)',
                        borderColor: enabled ? '#6366f1' : 'var(--border-strong,rgba(255,255,255,0.1))' }}>
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="rbac-modal-footer">
          <button className="rbac-btn rbac-btn-secondary rbac-btn-sm" onClick={onClose}>İptal</button>
          <button className="rbac-btn rbac-btn-primary rbac-btn-sm" onClick={() => {
            if (!form.name.trim()) return;
            onSave({ ...form, id: form.id || form.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now() });
          }}>Kaydet</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN
   ════════════════════════════════════════════════════════════ */
export default function RBACPage({ currentUser }) {
  const [roles, setRoles] = useState(loadRoles);
  const [activeTab, setActiveTab] = useState('matrix');
  const [modal, setModal] = useState(null); // null | 'create' | role object

  const isAdmin = currentUser?.role === 'admin';

  const persist = useCallback((r) => { setRoles(r); saveRoles(r); }, []);

  const handleSaveRole = useCallback((role) => {
    setRoles(prev => {
      const exists = prev.find(r => r.id === role.id);
      const next = exists ? prev.map(r => r.id === role.id ? role : r) : [...prev, role];
      saveRoles(next);
      return next;
    });
    setModal(null);
  }, []);

  const handleDeleteRole = useCallback((id) => {
    if (window.confirm('Bu rolü silmek istediğinizden emin misiniz?')) {
      persist(roles.filter(r => r.id !== id));
    }
  }, [roles, persist]);

  const togglePageAccess = useCallback((roleId, pageId) => {
    setRoles(prev => {
      const next = prev.map(r => {
        if (r.id !== roleId) return r;
        const pages = r.pages.includes(pageId)
          ? r.pages.filter(p => p !== pageId)
          : [...r.pages, pageId];
        return { ...r, pages };
      });
      saveRoles(next);
      return next;
    });
  }, []);

  const toggleActionFlag = useCallback((roleId, flagId) => {
    setRoles(prev => {
      const next = prev.map(r => r.id !== roleId ? r : { ...r, [flagId]: !r[flagId] });
      saveRoles(next);
      return next;
    });
  }, []);

  return (
    <div className="rbac-page page-content">
      <div className="rbac-header">
        <div className="rbac-header-left">
          <h1>{Icons.shield(20)} Yetki & Rol Matrisi</h1>
          <p>Şirket departmanlarına göre sayfa erişimi ve eylem yetkilerini yönetin</p>
        </div>
        {isAdmin && (
          <button className="rbac-btn rbac-btn-primary" onClick={() => setModal('create')}>
            {Icons.plus()} Yeni Rol
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="rbac-info-banner">
          {Icons.lock(15)}
          <span>Yetki matrisini görüntüleyebilirsiniz. Değişiklik yapmak için Admin yetkisi gereklidir.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="rbac-tabs">
        <button className={`rbac-tab ${activeTab === 'roles' ? 'active' : ''}`} onClick={() => setActiveTab('roles')}>Roller</button>
        <button className={`rbac-tab ${activeTab === 'matrix' ? 'active' : ''}`} onClick={() => setActiveTab('matrix')}>Sayfa Erişim Matrisi</button>
        <button className={`rbac-tab ${activeTab === 'actions' ? 'active' : ''}`} onClick={() => setActiveTab('actions')}>Eylem Yetkileri</button>
      </div>

      {/* ── TAB: Roles ───────────────────────────────────────── */}
      {activeTab === 'roles' && (
        <div className="rbac-roles-grid">
          {roles.map(role => (
            <div key={role.id} className="rbac-role-card">
              <div className="rbac-role-card-header">
                <div className="rbac-role-dot" style={{ background: role.color }} />
                <span className="rbac-role-name">{role.name}</span>
                {role.isSystem && (
                  <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: 4, background: 'var(--bg-overlay,#18181d)', color: 'var(--text-muted,#6a6a7e)', fontWeight: 600 }}>SİSTEM</span>
                )}
              </div>
              <p className="rbac-role-desc">{role.description}</p>
              <div className="rbac-role-stats">
                <span className="rbac-role-stat">{role.pages?.length || 0} sayfa</span>
                {role.canCreate && <span className="rbac-role-stat">Oluşturabilir</span>}
                {role.canDelete && <span className="rbac-role-stat">Silebilir</span>}
                {role.canApprove && <span className="rbac-role-stat">Onaylayabilir</span>}
              </div>
              {isAdmin && !role.isSystem && (
                <div className="rbac-role-actions">
                  <button className="rbac-btn rbac-btn-secondary rbac-btn-sm" onClick={() => setModal(role)}>{Icons.edit()} Düzenle</button>
                  <button className="rbac-btn rbac-btn-danger rbac-btn-sm" onClick={() => handleDeleteRole(role.id)}>{Icons.trash()} Sil</button>
                </div>
              )}
              {isAdmin && role.isSystem && (
                <div className="rbac-role-actions">
                  <button className="rbac-btn rbac-btn-secondary rbac-btn-sm" onClick={() => setModal(role)}>{Icons.edit()} Düzenle</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: Matrix ──────────────────────────────────────── */}
      {activeTab === 'matrix' && (
        <div className="rbac-matrix-section">
          <div className="rbac-table-wrap">
            <table className="rbac-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 180 }}>Sayfa / Ekran</th>
                  {roles.map(r => (
                    <th key={r.id}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.color }} />
                        <span>{r.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PAGE_MATRIX.map(section => (
                  <React.Fragment key={section.section}>
                    <tr className="rbac-section-row">
                      <td colSpan={roles.length + 1}>
                        <span className="rbac-section-label">{section.section}</span>
                      </td>
                    </tr>
                    {section.pages.map(page => (
                      <tr key={page.id}>
                        <td>
                          <span className="rbac-page-label">{page.label}</span>
                        </td>
                        {roles.map(r => {
                          const granted = r.pages?.includes(page.id);
                          return (
                            <td key={r.id}>
                              <Toggle
                                checked={!!granted}
                                onChange={() => isAdmin && togglePageAccess(r.id, page.id)}
                                locked={!isAdmin}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: Actions ─────────────────────────────────────── */}
      {activeTab === 'actions' && (
        <div className="rbac-actions-grid">
          {ACTION_FLAGS.map(flag => (
            <div key={flag.id} className="rbac-action-card">
              <div className="rbac-action-card-title">
                {Icons.tag()} {flag.label}
              </div>
              {roles.map(r => (
                <div key={r.id} className="rbac-action-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                    <span className="rbac-action-label">{r.name}</span>
                  </div>
                  <Toggle
                    checked={!!r[flag.id]}
                    onChange={() => isAdmin && toggleActionFlag(r.id, flag.id)}
                    locked={!isAdmin}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <RoleModal
          role={modal === 'create' ? null : modal}
          onSave={handleSaveRole}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
