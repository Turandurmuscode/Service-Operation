import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Icon from '../components/Icon';
import PageShell from '../components/PageShell';
import MetricStrip from '../components/MetricStrip';
import './ContactLogPage.css';

const CONTACT_TYPES = [
  { id: 'call', label: 'Telefon', icon: 'phone', color: '#10b981' },
  { id: 'email', label: 'E-posta', icon: 'mail', color: '#3b82f6' },
  { id: 'meeting', label: 'Toplantı', icon: 'user', color: '#8b5cf6' },
  { id: 'visit', label: 'Ziyaret', icon: 'grid', color: '#f59e0b' },
  { id: 'message', label: 'Mesaj', icon: 'clipboard', color: '#6366f1' },
  { id: 'other', label: 'Diğer', icon: 'box', color: '#64748b' },
];

const DIRECTIONS = [
  { id: 'incoming', label: 'Gelen' },
  { id: 'outgoing', label: 'Giden' },
];

const emptyForm = {
  clientId: '', contactType: 'call', direction: 'outgoing',
  subject: '', notes: '', contactPerson: '', duration: '',
  followUpDate: '', followUpNote: '', incidentId: '',
};

function ContactLogPage({ incidents, clients, currentUser, showToast }) {
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [filterClient, setFilterClient] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline'); // timeline | clients | followups

  useEffect(() => {
    const saved = localStorage.getItem('contactLogs');
    if (saved) setLogs(JSON.parse(saved));
  }, []);

  const save = useCallback((updated) => {
    setLogs(updated);
    localStorage.setItem('contactLogs', JSON.stringify(updated));
  }, []);

  // CRUD
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.clientId) { showToast('Müşteri seçiniz.', 'error'); return; }
    if (!form.subject.trim()) { showToast('Konu zorunludur.', 'error'); return; }

    if (editingLog) {
      const updated = logs.map(l => l.id === editingLog.id ? {
        ...l, ...form, updatedAt: new Date().toISOString(),
      } : l);
      save(updated);
      showToast('İletişim kaydı güncellendi!', 'success');
    } else {
      const newLog = {
        id: Date.now(), ...form,
        date: new Date().toISOString(),
        createdBy: currentUser?.name || 'System',
      };
      save([newLog, ...logs]);
      showToast('İletişim kaydedildi!', 'success');
    }
    setForm({ ...emptyForm });
    setEditingLog(null);
    setShowForm(false);
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    setForm({
      clientId: log.clientId || '', contactType: log.contactType,
      direction: log.direction || 'outgoing', subject: log.subject,
      notes: log.notes || '', contactPerson: log.contactPerson || '',
      duration: log.duration || '', followUpDate: log.followUpDate || '',
      followUpNote: log.followUpNote || '', incidentId: log.incidentId || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Bu iletişim kaydını silmek istediğinize emin misiniz?')) return;
    save(logs.filter(l => l.id !== id));
    showToast('Kayıt silindi.', 'warning');
  };

  const completeFollowUp = (logId) => {
    const updated = logs.map(l =>
      l.id === logId ? { ...l, followUpCompleted: true, followUpCompletedAt: new Date().toISOString() } : l
    );
    save(updated);
    showToast('Hatırlatma tamamlandı!', 'success');
  };

  // Helpers
  const getClientName = useCallback((clientId) => {
    if (!clientId) return '—';
    const c = clients.find(cl => cl.id === parseInt(clientId));
    return c?.name || 'Bilinmiyor';
  }, [clients]);

  const getIncidentLabel = (incidentId) => {
    if (!incidentId) return null;
    const inc = incidents.find(i => i.id === parseInt(incidentId));
    if (!inc) return `#${incidentId}`;
    return `#${inc.id}: ${inc.description?.slice(0, 30)}`;
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Filters
  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      if (filterClient !== 'all' && String(l.clientId) !== filterClient) return false;
      if (filterType !== 'all' && l.contactType !== filterType) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!l.subject.toLowerCase().includes(s) &&
          !(l.notes || '').toLowerCase().includes(s) &&
          !(l.contactPerson || '').toLowerCase().includes(s) &&
          !getClientName(l.clientId).toLowerCase().includes(s)) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [logs, filterClient, filterType, search, getClientName]);

  // Follow-ups
  const pendingFollowUps = useMemo(() => {
    return logs.filter(l => l.followUpDate && !l.followUpCompleted)
      .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate));
  }, [logs]);

  const overdueFollowUps = pendingFollowUps.filter(l => new Date(l.followUpDate) < new Date());

  // Client summary
  const clientSummary = useMemo(() => {
    const map = {};
    logs.forEach(l => {
      const cid = l.clientId || 'unknown';
      if (!map[cid]) map[cid] = { clientId: cid, total: 0, types: {}, lastContact: null };
      map[cid].total += 1;
      map[cid].types[l.contactType] = (map[cid].types[l.contactType] || 0) + 1;
      if (!map[cid].lastContact || new Date(l.date) > new Date(map[cid].lastContact)) {
        map[cid].lastContact = l.date;
      }
    });
    return Object.values(map)
      .map(c => ({ ...c, name: getClientName(c.clientId) }))
      .sort((a, b) => new Date(b.lastContact) - new Date(a.lastContact));
  }, [logs, getClientName]);

  // Stats
  const totalLogs = logs.length;
  const thisMonthLogs = logs.filter(l => {
    const d = new Date(l.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const metricItems = [
    { label: 'Toplam Kayıt', value: totalLogs },
    { label: 'Bu Ay', value: thisMonthLogs },
    { label: 'Aktif Müşteri', value: clientSummary.length },
    { label: 'Geciken Hatırlatma', value: overdueFollowUps.length, valueColor: overdueFollowUps.length > 0 ? '#ef4444' : 'var(--text-primary)' },
    { label: 'Bekleyen Hatırlatma', value: pendingFollowUps.length, valueColor: pendingFollowUps.length > 0 ? '#f59e0b' : 'var(--text-primary)' },
  ];

  return (
    <div className="page-content">
      <PageShell
        title="İletişim Geçmişi"
        subtitle="Müşteri bazlı iletişim kayıtlarını merkezi olarak takip edin"
        icon="clipboard"
        actions={
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingLog(null); setForm({ ...emptyForm }); }}>
            Yeni İletişim
          </button>
        }
      >
      <MetricStrip items={metricItems} />

      {/* Tabs */}
      <div className="cl-tabs">
        {[
          { id: 'timeline', label: 'Zaman Çizelgesi', badge: null },
          { id: 'clients', label: 'Müşteri Özeti', badge: null },
          { id: 'followups', label: 'Hatırlatmalar', badge: pendingFollowUps.length || null },
        ].map(tab => (
          <button key={tab.id} className={`cl-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>
            {tab.label}
            {tab.badge && <span className="cl-tab-badge">{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* ═══ TIMELINE TAB ═══ */}
      {activeTab === 'timeline' && (
        <>
          <div className="cl-filters">
            <input type="text" placeholder="Ara (konu, not, kişi, müşteri)..." className="filter-input"
              value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
            <select className="filter-select" value={filterClient} onChange={e => setFilterClient(e.target.value)}>
              <option value="all">Tüm Müşteriler</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">Tüm Türler</option>
              {CONTACT_TYPES.map(ct => <option key={ct.id} value={ct.id}>{ct.label}</option>)}
            </select>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Icon name="clipboard" size={24} /></div>
              <p>İletişim kaydı bulunamadı.</p>
            </div>
          ) : (
            <div className="cl-timeline">
              {filteredLogs.map(log => {
                const typeInfo = CONTACT_TYPES.find(ct => ct.id === log.contactType);
                const dirInfo = DIRECTIONS.find(d => d.id === log.direction);
                return (
                  <div key={log.id} className="cl-timeline-item">
                    <div className="cl-tl-icon" style={{ background: typeInfo?.color + '18', color: typeInfo?.color }}>
                      <Icon name={typeInfo?.icon} size={14} />
                    </div>
                    <div className="cl-tl-content">
                      <div className="cl-tl-header">
                        <div className="cl-tl-title">
                          <span className="cl-tl-subject">{log.subject}</span>
                          <span className="cl-tl-dir">{dirInfo?.label}</span>
                        </div>
                        <div className="cl-tl-actions">
                          <button className="btn-icon" title="Düzenle" onClick={() => handleEdit(log)}>
                            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
                              <path d="M11 2l3 3-8 8H3v-3l8-8z" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button className="btn-icon delete" title="Sil" onClick={() => handleDelete(log.id)}>
                            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
                              <path d="M3 4h10M6 4V3h4v1M5 4v9h6V4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="cl-tl-meta">
                        <span className="cl-tl-client"><Icon name="building" size={12} /> {getClientName(log.clientId)}</span>
                        {log.contactPerson && <span><Icon name="user" size={12} /> {log.contactPerson}</span>}
                        <span><Icon name="calendar" size={12} /> {formatDateTime(log.date)}</span>
                        {log.duration && <span><Icon name="clock" size={12} /> {log.duration} dk</span>}
                      </div>
                      {log.notes && <p className="cl-tl-notes">{log.notes}</p>}
                      <div className="cl-tl-tags">
                        <span className="cl-type-badge" style={{ background: typeInfo?.color + '18', color: typeInfo?.color }}>
                          <Icon name={typeInfo?.icon} size={11} /> {typeInfo?.label}
                        </span>
                        {log.incidentId && (
                          <span className="cl-incident-tag"><Icon name="tool" size={12} /> {getIncidentLabel(log.incidentId)}</span>
                        )}
                        {log.followUpDate && !log.followUpCompleted && (
                          <span className={`cl-followup-tag ${new Date(log.followUpDate) < new Date() ? 'overdue' : ''}`}>
                            <Icon name="bell" size={12} /> Hatırlatma: {formatDate(log.followUpDate)}
                          </span>
                        )}
                        {log.followUpCompleted && (
                          <span className="cl-followup-tag done"><Icon name="check" size={12} /> Tamamlandı</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ═══ CLIENTS TAB ═══ */}
      {activeTab === 'clients' && (
        <div className="cl-client-summary">
          {clientSummary.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Icon name="user" size={24} /></div>
              <p>Henüz iletişim kaydı yok.</p>
            </div>
          ) : (
            <div className="cl-client-grid">
              {clientSummary.map(cs => (
                <div key={cs.clientId} className={`cl-client-card ${selectedClient === cs.clientId ? 'selected' : ''}`}
                  onClick={() => setSelectedClient(selectedClient === cs.clientId ? null : cs.clientId)}>
                  <div className="cl-cc-header">
                    <h4>{cs.name}</h4>
                    <span className="cl-cc-count">{cs.total} kayıt</span>
                  </div>
                  <div className="cl-cc-last">
                    Son iletişim: <strong>{formatDate(cs.lastContact)}</strong>
                  </div>
                  <div className="cl-cc-types">
                    {Object.entries(cs.types).map(([type, count]) => {
                      const ti = CONTACT_TYPES.find(ct => ct.id === type);
                      return (
                        <span key={type} className="cl-cc-type-tag" style={{ background: ti?.color + '14', color: ti?.color }}>
                          <Icon name={ti?.icon} size={11} /> {count}
                        </span>
                      );
                    })}
                  </div>
                  {/* Inline recent contacts */}
                  {selectedClient === cs.clientId && (
                    <div className="cl-cc-recent">
                      <h5>Son İletişimler</h5>
                      {logs.filter(l => String(l.clientId) === String(cs.clientId))
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .slice(0, 5)
                        .map(l => {
                          const ti = CONTACT_TYPES.find(ct => ct.id === l.contactType);
                          return (
                            <div key={l.id} className="cl-cc-recent-item">
                              <span style={{ color: ti?.color }}><Icon name={ti?.icon} size={11} /></span>
                              <span className="cl-cc-recent-subject">{l.subject}</span>
                              <span className="cl-cc-recent-date">{formatDate(l.date)}</span>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ FOLLOW-UPS TAB ═══ */}
      {activeTab === 'followups' && (
        <div className="cl-followups">
          {pendingFollowUps.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Icon name="save" size={24} /></div>
              <p>Bekleyen hatırlatma yok.</p>
            </div>
          ) : (
            <div className="cl-fu-list">
              {pendingFollowUps.map(log => {
                const typeInfo = CONTACT_TYPES.find(ct => ct.id === log.contactType);
                const isOverdue = new Date(log.followUpDate) < new Date();
                return (
                  <div key={log.id} className={`cl-fu-item ${isOverdue ? 'overdue' : ''}`}>
                    <div className="cl-fu-date-col">
                      <div className={`cl-fu-date ${isOverdue ? 'overdue' : ''}`}>
                        {formatDate(log.followUpDate)}
                      </div>
                      {isOverdue && <span className="cl-fu-overdue-badge">GECİKMİŞ</span>}
                    </div>
                    <div className="cl-fu-content">
                      <div className="cl-fu-subject">{log.subject}</div>
                      <div className="cl-fu-meta">
                        <span>{getClientName(log.clientId)}</span>
                        <span style={{ color: typeInfo?.color }}><Icon name={typeInfo?.icon} size={11} /> {typeInfo?.label}</span>
                        {log.contactPerson && <span>{log.contactPerson}</span>}
                      </div>
                      {log.followUpNote && <p className="cl-fu-note">{log.followUpNote}</p>}
                    </div>
                    <button className="btn btn-xs" onClick={() => completeFollowUp(log.id)}>
                      ✓ Tamamla
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ FORM MODAL ═══ */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content cl-form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingLog ? 'İletişim Düzenle' : 'Yeni İletişim Kaydı'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="cl-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Müşteri *</label>
                  <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} required>
                    <option value="">Müşteri seçiniz...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>İletişim Kişisi</label>
                  <input type="text" value={form.contactPerson}
                    onChange={e => setForm({ ...form, contactPerson: e.target.value })}
                    placeholder="ör: Ahmet Bey" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>İletişim Türü</label>
                  <select value={form.contactType} onChange={e => setForm({ ...form, contactType: e.target.value })}>
                    {CONTACT_TYPES.map(ct => <option key={ct.id} value={ct.id}>{ct.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Yön</label>
                  <select value={form.direction} onChange={e => setForm({ ...form, direction: e.target.value })}>
                    {DIRECTIONS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Konu *</label>
                <input type="text" value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  placeholder="İletişimin konusu..." required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Süre (dakika)</label>
                  <input type="number" min="0" value={form.duration}
                    onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="ör: 15" />
                </div>
                <div className="form-group">
                  <label>İlişkili Arıza</label>
                  <select value={form.incidentId} onChange={e => setForm({ ...form, incidentId: e.target.value })}>
                    <option value="">Seçiniz (opsiyonel)</option>
                    {incidents.map(inc => {
                      const cl = clients.find(c => c.id === inc.clientId);
                      return <option key={inc.id} value={inc.id}>{cl?.name}: {inc.description?.slice(0, 35)}</option>;
                    })}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Notlar</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={3} placeholder="Görüşme notları..." />
              </div>
              <div className="cl-followup-section">
                <h4>Hatırlatma (opsiyonel)</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Hatırlatma Tarihi</label>
                    <input type="date" value={form.followUpDate}
                      onChange={e => setForm({ ...form, followUpDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Hatırlatma Notu</label>
                    <input type="text" value={form.followUpNote}
                      onChange={e => setForm({ ...form, followUpNote: e.target.value })}
                      placeholder="ör: Teklif göndermek" />
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">{editingLog ? 'Güncelle' : 'Kaydet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </PageShell>
    </div>
  );
}

export default ContactLogPage;
