import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './ActivityFeedPage.css';

const EVENT_TYPES = {
  incident_created:  { icon: '🔧', label: 'Yeni Arıza', color: '#ef4444' },
  incident_resolved: { icon: '✅', label: 'Arıza Çözüldü', color: '#10b981' },
  incident_updated:  { icon: '🔄', label: 'Arıza Güncellendi', color: '#f59e0b' },
  client_added:      { icon: '👤', label: 'Yeni Müşteri', color: '#3b82f6' },
  note_added:        { icon: '📝', label: 'Not Eklendi', color: '#8b5cf6' },
  comment:           { icon: '💬', label: 'Yorum', color: '#6366f1' },
  announcement:      { icon: '📢', label: 'Duyuru', color: '#ec4899' },
  system:            { icon: '⚙️', label: 'Sistem', color: '#64748b' },
  milestone:         { icon: '🏆', label: 'Başarı', color: '#f59e0b' },
  mention:           { icon: '📣', label: 'Etiket', color: '#14b8a6' },
};

function ActivityFeedPage({ incidents, clients, activities, currentUser, showToast }) {
  const [feedItems, setFeedItems] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [postText, setPostText] = useState('');
  const [postType, setPostType] = useState('comment');
  const [replyTo, setReplyTo] = useState(null);
  const [reactions, setReactions] = useState({});
  const [pinnedIds, setPinnedIds] = useState([]);

  // Load persisted data
  useEffect(() => {
    const savedFeed = localStorage.getItem('activityFeed');
    const savedReactions = localStorage.getItem('feedReactions');
    const savedPinned = localStorage.getItem('feedPinned');
    if (savedFeed) setFeedItems(JSON.parse(savedFeed));
    if (savedReactions) setReactions(JSON.parse(savedReactions));
    if (savedPinned) setPinnedIds(JSON.parse(savedPinned));
  }, []);

  const saveFeed = useCallback((updated) => {
    setFeedItems(updated);
    localStorage.setItem('activityFeed', JSON.stringify(updated));
  }, []);

  const saveReactions = useCallback((updated) => {
    setReactions(updated);
    localStorage.setItem('feedReactions', JSON.stringify(updated));
  }, []);

  const savePinned = useCallback((updated) => {
    setPinnedIds(updated);
    localStorage.setItem('feedPinned', JSON.stringify(updated));
  }, []);

  // Auto-generate system events from incidents/activities
  const systemEvents = useMemo(() => {
    const events = [];
    // From incidents
    (incidents || []).forEach(inc => {
      const client = (clients || []).find(c => c.id === inc.clientId);
      events.push({
        id: `inc-${inc.id}`,
        type: inc.status === 'resolved' ? 'incident_resolved' :
              inc.status === 'new' ? 'incident_created' : 'incident_updated',
        text: inc.description || 'Arıza kaydı',
        user: inc.assignedTo || 'Sistem',
        date: inc.resolvedAt || inc.createdAt || new Date().toISOString(),
        context: client?.name || '',
        isSystem: true,
      });
    });
    // From activities
    (activities || []).forEach(act => {
      events.push({
        id: `act-${act.id || Math.random()}`,
        type: act.type === 'incident_created' ? 'incident_created' :
              act.type === 'incident_resolved' ? 'incident_resolved' :
              act.type === 'client_added' ? 'client_added' :
              act.type === 'note_added' ? 'note_added' : 'system',
        text: act.description || act.text || '',
        user: act.user || 'Sistem',
        date: act.timestamp || act.date || new Date().toISOString(),
        isSystem: true,
      });
    });
    return events;
  }, [incidents, clients, activities]);

  // Merge system events + user posts
  const allItems = useMemo(() => {
    const merged = [...feedItems];
    systemEvents.forEach(se => {
      if (!merged.find(m => m.id === se.id)) merged.push(se);
    });
    return merged.sort((a, b) => {
      const aP = pinnedIds.includes(a.id) ? 1 : 0;
      const bP = pinnedIds.includes(b.id) ? 1 : 0;
      if (aP !== bP) return bP - aP;
      return new Date(b.date) - new Date(a.date);
    });
  }, [feedItems, systemEvents, pinnedIds]);

  // Filtered
  const filtered = useMemo(() => {
    return allItems.filter(item => {
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!item.text.toLowerCase().includes(s) &&
            !(item.user || '').toLowerCase().includes(s) &&
            !(item.context || '').toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [allItems, filterType, search]);

  // Post
  const handlePost = (e) => {
    e.preventDefault();
    if (!postText.trim()) return;

    const newItem = {
      id: `post-${Date.now()}`,
      type: postType,
      text: postText.trim(),
      user: currentUser?.name || 'Anonim',
      userRole: currentUser?.role || 'technician',
      date: new Date().toISOString(),
      isSystem: false,
      replyTo: replyTo?.id || null,
      replyPreview: replyTo ? `${replyTo.user}: ${replyTo.text.slice(0, 60)}` : null,
    };

    saveFeed([newItem, ...feedItems]);
    setPostText('');
    setPostType('comment');
    setReplyTo(null);
    showToast('Paylaşıldı!', 'success');
  };

  // Reactions
  const toggleReaction = (itemId, emoji) => {
    const key = `${itemId}`;
    const current = reactions[key] || {};
    const users = current[emoji] || [];
    const userName = currentUser?.name || 'Anonim';

    let updated;
    if (users.includes(userName)) {
      updated = { ...current, [emoji]: users.filter(u => u !== userName) };
    } else {
      updated = { ...current, [emoji]: [...users, userName] };
    }
    saveReactions({ ...reactions, [key]: updated });
  };

  const togglePin = (itemId) => {
    const updated = pinnedIds.includes(itemId)
      ? pinnedIds.filter(id => id !== itemId)
      : [...pinnedIds, itemId];
    savePinned(updated);
  };

  const deletePost = (itemId) => {
    if (!window.confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) return;
    saveFeed(feedItems.filter(f => f.id !== itemId));
    showToast('Gönderi silindi.', 'warning');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);
    if (diffMin < 1) return 'Az önce';
    if (diffMin < 60) return `${diffMin} dk önce`;
    if (diffHr < 24) return `${diffHr} saat önce`;
    if (diffDay < 7) return `${diffDay} gün önce`;
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const REACTION_EMOJIS = ['👍', '❤️', '😄', '🎉', '👀', '🚀'];

  // Stats
  const todayCount = allItems.filter(i => {
    const d = new Date(i.date);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const userPostCount = feedItems.filter(f => f.user === currentUser?.name).length;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">📡 Canlı Akış</h1>
          <p className="page-subtitle">Tüm sistem olaylarını ve ekip paylaşımlarını takip edin</p>
        </div>
      </div>

      {/* Stats */}
      <div className="af-stats">
        <div className="af-stat"><span className="af-stat-val">{allItems.length}</span><span className="af-stat-lbl">Toplam</span></div>
        <div className="af-stat"><span className="af-stat-val">{todayCount}</span><span className="af-stat-lbl">Bugün</span></div>
        <div className="af-stat"><span className="af-stat-val">{feedItems.length}</span><span className="af-stat-lbl">Paylaşım</span></div>
        <div className="af-stat"><span className="af-stat-val">{userPostCount}</span><span className="af-stat-lbl">Benim</span></div>
      </div>

      {/* Post Composer */}
      <div className="af-composer">
        {replyTo && (
          <div className="af-reply-banner">
            <span>↩️ Yanıt: <strong>{replyTo.user}</strong> — "{replyTo.text.slice(0, 80)}"</span>
            <button onClick={() => setReplyTo(null)}>✕</button>
          </div>
        )}
        <form onSubmit={handlePost} className="af-composer-form">
          <div className="af-composer-avatar">
            {currentUser?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="af-composer-body">
            <textarea
              value={postText}
              onChange={e => setPostText(e.target.value)}
              placeholder="Bir şey paylaşın, güncelleme verin..."
              rows={2}
              className="af-composer-input"
            />
            <div className="af-composer-footer">
              <select value={postType} onChange={e => setPostType(e.target.value)} className="af-post-type-select">
                <option value="comment">💬 Yorum</option>
                <option value="announcement">📢 Duyuru</option>
                <option value="milestone">🏆 Başarı</option>
                <option value="mention">📣 Bilgilendirme</option>
              </select>
              <button type="submit" className="btn btn-primary btn-sm" disabled={!postText.trim()}>
                Paylaş
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="af-filters">
        <input type="text" className="filter-input" placeholder="Akışta ara..."
          value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
        <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">Tüm Etkinlikler</option>
          {Object.entries(EVENT_TYPES).map(([key, val]) => (
            <option key={key} value={key}>{val.icon} {val.label}</option>
          ))}
        </select>
      </div>

      {/* Feed */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📡</div>
          <p>Akışta görüntülenecek etkinlik yok.</p>
        </div>
      ) : (
        <div className="af-feed">
          {filtered.map(item => {
            const typeInfo = EVENT_TYPES[item.type] || EVENT_TYPES.system;
            const isPinned = pinnedIds.includes(item.id);
            const itemReactions = reactions[item.id] || {};
            const canDelete = !item.isSystem && (
              item.user === currentUser?.name || currentUser?.role === 'admin'
            );

            return (
              <div key={item.id} className={`af-item ${isPinned ? 'pinned' : ''} ${item.isSystem ? 'system' : 'user-post'}`}>
                {isPinned && <div className="af-pin-badge">📌 Sabitlenmiş</div>}

                <div className="af-item-row">
                  <div className="af-item-icon" style={{ background: typeInfo.color + '18', color: typeInfo.color }}>
                    {typeInfo.icon}
                  </div>

                  <div className="af-item-body">
                    {item.replyPreview && (
                      <div className="af-reply-ref">↩️ {item.replyPreview}</div>
                    )}
                    <div className="af-item-header">
                      <span className="af-item-user">{item.user}</span>
                      {item.userRole && !item.isSystem && (
                        <span className="af-role-badge">{item.userRole === 'admin' ? 'Admin' : item.userRole === 'manager' ? 'Yönetici' : 'Teknisyen'}</span>
                      )}
                      <span className="af-item-type-tag" style={{ background: typeInfo.color + '14', color: typeInfo.color }}>
                        {typeInfo.label}
                      </span>
                      <span className="af-item-time">{formatDate(item.date)}</span>
                    </div>
                    <p className="af-item-text">{item.text}</p>
                    {item.context && <span className="af-item-context">🏢 {item.context}</span>}

                    {/* Reactions */}
                    <div className="af-reactions">
                      {Object.entries(itemReactions).filter(([, users]) => users.length > 0).map(([emoji, users]) => (
                        <button key={emoji} className={`af-reaction ${users.includes(currentUser?.name) ? 'active' : ''}`}
                          onClick={() => toggleReaction(item.id, emoji)}>
                          {emoji} {users.length}
                        </button>
                      ))}
                      <div className="af-reaction-picker">
                        <button className="af-reaction-add">+</button>
                        <div className="af-reaction-dropdown">
                          {REACTION_EMOJIS.map(e => (
                            <button key={e} onClick={() => toggleReaction(item.id, e)}>{e}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="af-item-actions">
                    <button className="btn-icon" title="Yanıtla" onClick={() => setReplyTo(item)}>
                      ↩️
                    </button>
                    <button className={`btn-icon ${isPinned ? 'active' : ''}`} title={isPinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
                      onClick={() => togglePin(item.id)}>
                      📌
                    </button>
                    {canDelete && (
                      <button className="btn-icon delete" title="Sil" onClick={() => deletePost(item.id)}>
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ActivityFeedPage;
