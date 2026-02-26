import React, { useState, useEffect, useCallback } from 'react';
import './AnnouncementsPage.css';

const CATEGORIES = [
  { id: 'urgent', label: 'Acil', icon: '🔴', color: '#ef4444' },
  { id: 'update', label: 'Güncelleme', icon: '🔵', color: '#3b82f6' },
  { id: 'info', label: 'Bilgilendirme', icon: '🟢', color: '#10b981' },
  { id: 'event', label: 'Etkinlik', icon: '🟡', color: '#f59e0b' },
  { id: 'hr', label: 'İnsan Kaynakları', icon: '🟣', color: '#8b5cf6' },
];

const emptyForm = { title: '', content: '', category: 'info', pinned: false, expiresAt: '' };

function AnnouncementsPage({ currentUser, showToast }) {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [selectedAnn, setSelectedAnn] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('card'); // card | list

  useEffect(() => {
    const saved = localStorage.getItem('announcements');
    if (saved) setAnnouncements(JSON.parse(saved));
  }, []);

  const save = useCallback((updated) => {
    setAnnouncements(updated);
    localStorage.setItem('announcements', JSON.stringify(updated));
  }, []);

  // Read tracking
  const getReadKey = () => `ann_read_${currentUser?.username || 'anon'}`;
  const getReadIds = () => {
    try { return JSON.parse(localStorage.getItem(getReadKey()) || '[]'); }
    catch { return []; }
  };
  const markAsRead = (annId) => {
    const readIds = getReadIds();
    if (!readIds.includes(annId)) {
      const updated = [...readIds, annId];
      localStorage.setItem(getReadKey(), JSON.stringify(updated));
    }
  };
  const isRead = (annId) => getReadIds().includes(annId);
  const unreadCount = announcements.filter(a => !isRead(a.id)).length;

  // CRUD
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast('Başlık zorunludur.', 'error'); return; }
    if (!form.content.trim()) { showToast('İçerik zorunludur.', 'error'); return; }

    if (editingAnn) {
      const updated = announcements.map(a => a.id === editingAnn.id ? {
        ...a, ...form, updatedAt: new Date().toISOString(),
      } : a);
      save(updated);
      showToast('Duyuru güncellendi!', 'success');
    } else {
      const newAnn = {
        id: Date.now(), ...form,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.name || 'System',
        createdByRole: currentUser?.role || 'admin',
      };
      save([newAnn, ...announcements]);
      showToast('Duyuru yayınlandı!', 'success');
    }
    setForm({ ...emptyForm });
    setEditingAnn(null);
    setShowForm(false);
  };

  const handleEdit = (ann) => {
    setEditingAnn(ann);
    setForm({
      title: ann.title, content: ann.content, category: ann.category,
      pinned: ann.pinned || false, expiresAt: ann.expiresAt || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;
    save(announcements.filter(a => a.id !== id));
    if (selectedAnn?.id === id) setSelectedAnn(null);
    showToast('Duyuru silindi.', 'warning');
  };

  const togglePin = (id) => {
    const updated = announcements.map(a =>
      a.id === id ? { ...a, pinned: !a.pinned } : a
    );
    save(updated);
  };

  const markAllRead = () => {
    const allIds = announcements.map(a => a.id);
    localStorage.setItem(getReadKey(), JSON.stringify(allIds));
    showToast('Tümü okundu olarak işaretlendi.', 'success');
    // Force re-render
    setAnnouncements([...announcements]);
  };

  const openDetail = (ann) => {
    setSelectedAnn(ann);
    markAsRead(ann.id);
  };

  // Filter & sort
  const now = new Date();
  const activeAnnouncements = announcements.filter(a => {
    if (a.expiresAt && new Date(a.expiresAt) < now) return false;
    return true;
  });

  const filtered = activeAnnouncements.filter(a => {
    if (filterCategory !== 'all' && a.category !== filterCategory) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!a.title.toLowerCase().includes(s) && !a.content.toLowerCase().includes(s) &&
        !(a.createdBy || '').toLowerCase().includes(s)) return false;
    }
    return true;
  });

  // Pinned first, then by date
  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const expiredCount = announcements.filter(a => a.expiresAt && new Date(a.expiresAt) < now).length;

  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const timeAgo = (dateStr) => {
    const diff = Math.floor((now - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`;
    return formatDate(dateStr);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">📢 Duyuru Panosu</h1>
          <p className="page-subtitle">Şirket içi duyurular, ilanlar ve bilgilendirmeler</p>
        </div>
        <div className="page-header-actions">
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={markAllRead}>
              ✓ Tümünü Okundu İşaretle ({unreadCount})
            </button>
          )}
          {canManage && (
            <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingAnn(null); setForm({ ...emptyForm }); }}>
              + Yeni Duyuru
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="ann-stats">
        <div className="ann-stat">
          <span className="ann-stat-num">{activeAnnouncements.length}</span>
          <span className="ann-stat-label">Aktif Duyuru</span>
        </div>
        <div className="ann-stat">
          <span className="ann-stat-num" style={{ color: '#ef4444' }}>{activeAnnouncements.filter(a => a.category === 'urgent').length}</span>
          <span className="ann-stat-label">Acil</span>
        </div>
        {unreadCount > 0 && (
          <div className="ann-stat">
            <span className="ann-stat-num" style={{ color: '#3b82f6' }}>{unreadCount}</span>
            <span className="ann-stat-label">Okunmamış</span>
          </div>
        )}
        <div className="ann-stat">
          <span className="ann-stat-num">{announcements.filter(a => a.pinned).length}</span>
          <span className="ann-stat-label">Sabitlenmiş</span>
        </div>
        {expiredCount > 0 && (
          <div className="ann-stat muted">
            <span className="ann-stat-num">{expiredCount}</span>
            <span className="ann-stat-label">Süresi Dolmuş</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="ann-toolbar">
        <input type="text" placeholder="Duyuru ara..." className="filter-input"
          value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
        <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="all">Tüm Kategoriler</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </select>
        <div className="ann-view-toggle">
          <button className={`ann-view-btn ${viewMode === 'card' ? 'active' : ''}`} onClick={() => setViewMode('card')} title="Kart Görünümü">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
              <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/>
              <rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
            </svg>
          </button>
          <button className={`ann-view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="Liste Görünümü">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
              <path d="M1 3h14M1 8h14M1 13h14" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📢</div>
          <p>Duyuru bulunamadı.</p>
        </div>
      ) : viewMode === 'card' ? (
        <div className="ann-grid">
          {sorted.map(ann => {
            const cat = CATEGORIES.find(c => c.id === ann.category);
            const read = isRead(ann.id);
            return (
              <div key={ann.id} className={`ann-card ${ann.pinned ? 'pinned' : ''} ${!read ? 'unread' : ''} ${selectedAnn?.id === ann.id ? 'selected' : ''}`}
                onClick={() => openDetail(ann)}>
                {ann.pinned && <div className="ann-pin-badge">📌 Sabitlenmiş</div>}
                {!read && <div className="ann-unread-dot" />}
                <div className="ann-card-header">
                  <span className="ann-cat-badge" style={{ background: cat?.color + '18', color: cat?.color }}>
                    {cat?.icon} {cat?.label}
                  </span>
                  <span className="ann-time">{timeAgo(ann.createdAt)}</span>
                </div>
                <h3 className="ann-card-title">{ann.title}</h3>
                <p className="ann-card-preview">{ann.content.slice(0, 120)}{ann.content.length > 120 ? '...' : ''}</p>
                <div className="ann-card-footer">
                  <span className="ann-author">👤 {ann.createdBy}</span>
                  {ann.expiresAt && (
                    <span className="ann-expires">⏰ {formatDate(ann.expiresAt)}</span>
                  )}
                </div>
                {canManage && (
                  <div className="ann-card-actions" onClick={e => e.stopPropagation()}>
                    <button className="btn-icon" title={ann.pinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
                      onClick={() => togglePin(ann.id)}>📌</button>
                    <button className="btn-icon" title="Düzenle" onClick={() => handleEdit(ann)}>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
                        <path d="M11 2l3 3-8 8H3v-3l8-8z" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button className="btn-icon delete" title="Sil" onClick={() => handleDelete(ann.id)}>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
                        <path d="M3 4h10M6 4V3h4v1M5 4v9h6V4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="ann-list">
          {sorted.map(ann => {
            const cat = CATEGORIES.find(c => c.id === ann.category);
            const read = isRead(ann.id);
            return (
              <div key={ann.id} className={`ann-list-item ${!read ? 'unread' : ''} ${selectedAnn?.id === ann.id ? 'selected' : ''}`}
                onClick={() => openDetail(ann)}>
                {!read && <div className="ann-unread-dot-sm" />}
                {ann.pinned && <span className="ann-pin-icon">📌</span>}
                <span className="ann-cat-dot" style={{ background: cat?.color }} />
                <div className="ann-list-content">
                  <span className="ann-list-title">{ann.title}</span>
                  <span className="ann-list-meta">
                    {ann.createdBy} · {timeAgo(ann.createdAt)}
                  </span>
                </div>
                <span className="ann-cat-badge small" style={{ background: cat?.color + '18', color: cat?.color }}>
                  {cat?.label}
                </span>
                {canManage && (
                  <div className="ann-list-actions" onClick={e => e.stopPropagation()}>
                    <button className="btn-icon" onClick={() => handleEdit(ann)}>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="11" height="11">
                        <path d="M11 2l3 3-8 8H3v-3l8-8z" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDelete(ann.id)}>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="11" height="11">
                        <path d="M3 4h10M6 4V3h4v1M5 4v9h6V4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Panel */}
      {selectedAnn && (
        <div className="ann-detail-panel">
          <div className="ann-detail-header">
            <div className="ann-detail-title-area">
              {selectedAnn.pinned && <span>📌</span>}
              <span className="ann-cat-badge" style={{
                background: (CATEGORIES.find(c => c.id === selectedAnn.category)?.color || '#6366f1') + '18',
                color: CATEGORIES.find(c => c.id === selectedAnn.category)?.color || '#6366f1',
              }}>
                {CATEGORIES.find(c => c.id === selectedAnn.category)?.icon} {CATEGORIES.find(c => c.id === selectedAnn.category)?.label}
              </span>
              <h3>{selectedAnn.title}</h3>
            </div>
            <button className="modal-close" onClick={() => setSelectedAnn(null)}>✕</button>
          </div>
          <div className="ann-detail-body">
            <div className="ann-detail-meta">
              <span>👤 {selectedAnn.createdBy}</span>
              <span>📅 {formatDateTime(selectedAnn.createdAt)}</span>
              {selectedAnn.updatedAt && <span>✏️ Güncellendi: {formatDateTime(selectedAnn.updatedAt)}</span>}
              {selectedAnn.expiresAt && <span>⏰ Son geçerlilik: {formatDate(selectedAnn.expiresAt)}</span>}
            </div>
            <div className="ann-detail-content">
              {selectedAnn.content.split('\n').map((line, i) => (
                <p key={i}>{line || <br />}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content ann-form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAnn ? 'Duyuru Düzenle' : '📢 Yeni Duyuru'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="ann-form">
              <div className="form-group">
                <label>Başlık *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Duyuru başlığı..." required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Kategori</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Son Geçerlilik Tarihi</label>
                  <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>İçerik *</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                  rows={6} placeholder="Duyuru içeriğini yazın..." required />
              </div>
              <div className="ann-form-options">
                <label className="ann-checkbox">
                  <input type="checkbox" checked={form.pinned}
                    onChange={e => setForm({ ...form, pinned: e.target.checked })} />
                  <span>📌 Panoda Sabitle</span>
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">{editingAnn ? 'Güncelle' : 'Yayınla'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnnouncementsPage;
