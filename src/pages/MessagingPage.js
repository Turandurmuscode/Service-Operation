import React, { useState, useEffect, useCallback, useRef } from 'react';
import './MessagingPage.css';

function MessagingPage({ currentUser, incidents, clients, showToast }) {
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [channelForm, setChannelForm] = useState({ name: '', type: 'team', incidentId: '' });
  const [searchChannels, setSearchChannels] = useState('');
  const messagesEndRef = useRef(null);

  // Load data
  useEffect(() => {
    const savedChannels = localStorage.getItem('msgChannels');
    const savedMessages = localStorage.getItem('msgMessages');
    if (savedChannels) {
      const parsed = JSON.parse(savedChannels);
      setChannels(parsed);
      if (parsed.length > 0 && !activeChannel) setActiveChannel(parsed[0].id);
    } else {
      // Create default channels
      const defaults = [
        { id: 'general', name: 'Genel', type: 'team', icon: '', createdAt: new Date().toISOString(), createdBy: 'System' },
        { id: 'urgent', name: 'Acil Durumlar', type: 'team', icon: '', createdAt: new Date().toISOString(), createdBy: 'System' },
        { id: 'announcements', name: 'Duyurular', type: 'team', icon: '', createdAt: new Date().toISOString(), createdBy: 'System' },
      ];
      setChannels(defaults);
      setActiveChannel('general');
      localStorage.setItem('msgChannels', JSON.stringify(defaults));

      // Seed some messages
      const seedMessages = {
        general: [
          { id: 1, userId: 1, userName: 'Admin User', userAvatar: 'AU', text: 'Herkese merhaba! Bu kanalı ekip içi iletişim için kullanabilirsiniz.', timestamp: new Date('2026-02-25T09:00:00').toISOString() },
          { id: 2, userId: 2, userName: 'Yönetici User', userAvatar: 'YU', text: 'Teşekkürler! Haftalık toplantı Pazartesi 10:00\'da olacak.', timestamp: new Date('2026-02-25T09:15:00').toISOString() },
        ],
        urgent: [
          { id: 3, userId: 1, userName: 'Admin User', userAvatar: 'AU', text: 'Acil durumlarda bu kanalı kullanın. Kritik arızaları buradan paylaşın.', timestamp: new Date('2026-02-25T09:00:00').toISOString() },
        ],
        announcements: [],
      };
      setMessages(seedMessages);
      localStorage.setItem('msgMessages', JSON.stringify(seedMessages));
    }
    if (savedMessages) setMessages(JSON.parse(savedMessages));
  }, []); // eslint-disable-line

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChannel, messages]);

  const saveChannels = useCallback((updated) => {
    setChannels(updated);
    localStorage.setItem('msgChannels', JSON.stringify(updated));
  }, []);

  const saveMessages = useCallback((updated) => {
    setMessages(updated);
    localStorage.setItem('msgMessages', JSON.stringify(updated));
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChannel) return;

    const msg = {
      id: Date.now(),
      userId: currentUser?.id || 0,
      userName: currentUser?.name || 'Anonim',
      userAvatar: currentUser?.avatar || '??',
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    const channelMessages = messages[activeChannel] || [];
    const updatedMessages = { ...messages, [activeChannel]: [...channelMessages, msg] };
    saveMessages(updatedMessages);
    setNewMessage('');

    // Update last activity
    const updatedChannels = channels.map(ch =>
      ch.id === activeChannel ? { ...ch, lastActivity: new Date().toISOString() } : ch
    );
    saveChannels(updatedChannels);
  };

  const handleCreateChannel = (e) => {
    e.preventDefault();
    if (!channelForm.name.trim()) {
      showToast('Kanal adı zorunludur.', 'error');
      return;
    }

    const newChannel = {
      id: `ch_${Date.now()}`,
      name: channelForm.name.trim(),
      type: channelForm.type,
      incidentId: channelForm.incidentId || null,
      icon: channelForm.type === 'incident' ? '' : channelForm.type === 'private' ? '' : '',
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'System',
    };

    const updated = [...channels, newChannel];
    saveChannels(updated);
    saveMessages({ ...messages, [newChannel.id]: [] });
    setActiveChannel(newChannel.id);
    setShowNewChannel(false);
    setChannelForm({ name: '', type: 'team', incidentId: '' });
    showToast('Kanal oluşturuldu!', 'success');
  };

  const handleDeleteChannel = (channelId) => {
    if (['general', 'urgent', 'announcements'].includes(channelId)) {
      showToast('Varsayılan kanallar silinemez.', 'error');
      return;
    }
    if (!window.confirm('Bu kanalı silmek istediğinize emin misiniz?')) return;
    saveChannels(channels.filter(ch => ch.id !== channelId));
    const { [channelId]: _, ...rest } = messages;
    saveMessages(rest);
    if (activeChannel === channelId) setActiveChannel(channels[0]?.id || null);
    showToast('Kanal silindi.', 'warning');
  };

  const getChannelMessages = () => messages[activeChannel] || [];
  const activeChannelObj = channels.find(ch => ch.id === activeChannel);

  // Filter channels
  const filteredChannels = channels.filter(ch =>
    !searchChannels || ch.name.toLowerCase().includes(searchChannels.toLowerCase())
  );

  // Group messages by date
  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach(msg => {
      const dateKey = new Date(msg.timestamp).toLocaleDateString('tr-TR');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(msg);
    });
    return groups;
  };

  const channelMsgs = getChannelMessages();
  const groupedMessages = groupMessagesByDate(channelMsgs);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dahili Mesajlaşma</h1>
          <p className="page-subtitle">Ekip içi iletişim ve olay bazlı tartışmalar</p>
        </div>
      </div>

      <div className="msg-container">
        {/* Channel Sidebar */}
        <div className="msg-sidebar">
          <div className="msg-sidebar-header">
            <input
              type="text" placeholder="Kanal ara..."
              className="msg-search" value={searchChannels}
              onChange={e => setSearchChannels(e.target.value)}
            />
            <button className="msg-new-btn" title="Yeni Kanal" onClick={() => setShowNewChannel(true)}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M8 3v10M3 8h10" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="msg-channel-list">
            {filteredChannels.map(ch => {
              const chMsgs = messages[ch.id] || [];
              const lastMsg = chMsgs[chMsgs.length - 1];
              return (
                <div
                  key={ch.id}
                  className={`msg-channel-item ${activeChannel === ch.id ? 'active' : ''}`}
                  onClick={() => setActiveChannel(ch.id)}
                >
                  <span className="msg-channel-icon">{ch.icon}</span>
                  <div className="msg-channel-info">
                    <div className="msg-channel-name">{ch.name}</div>
                    {lastMsg && (
                      <div className="msg-channel-preview">
                        {lastMsg.userName.split(' ')[0]}: {lastMsg.text.slice(0, 30)}{lastMsg.text.length > 30 ? '...' : ''}
                      </div>
                    )}
                  </div>
                  {chMsgs.length > 0 && (
                    <span className="msg-channel-count">{chMsgs.length}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="msg-chat">
          {activeChannelObj ? (
            <>
              <div className="msg-chat-header">
                <div className="msg-chat-title">
                  <span className="msg-channel-icon">{activeChannelObj.icon}</span>
                  <div>
                    <h3>{activeChannelObj.name}</h3>
                    <span className="msg-chat-meta">
                      {(messages[activeChannel] || []).length} mesaj
                      {activeChannelObj.createdBy !== 'System' && `  ${activeChannelObj.createdBy} tarafından oluşturuldu`}
                    </span>
                  </div>
                </div>
                {!['general', 'urgent', 'announcements'].includes(activeChannel) && (
                  <button className="btn-icon delete" title="Kanalı Sil" onClick={() => handleDeleteChannel(activeChannel)}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                      <path d="M3 4h10M6 4V3h4v1M5 4v9h6V4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="msg-messages">
                {channelMsgs.length === 0 ? (
                  <div className="msg-empty">
                    <span style={{ fontSize: 36 }}>{activeChannelObj.icon}</span>
                    <p>Bu kanalda henüz mesaj yok.</p>
                    <p className="msg-empty-hint">İlk mesajı göndererek sohbeti başlatın!</p>
                  </div>
                ) : (
                  Object.entries(groupedMessages).map(([dateStr, msgs]) => (
                    <div key={dateStr}>
                      <div className="msg-date-divider">
                        <span>{dateStr}</span>
                      </div>
                      {msgs.map((msg, i) => {
                        const isOwn = msg.userId === currentUser?.id;
                        const showAvatar = i === 0 || msgs[i - 1]?.userId !== msg.userId;
                        return (
                          <div key={msg.id} className={`msg-bubble-row ${isOwn ? 'own' : ''} ${!showAvatar ? 'continuation' : ''}`}>
                            {!isOwn && showAvatar && (
                              <div className="msg-avatar">{msg.userAvatar}</div>
                            )}
                            {!isOwn && !showAvatar && <div className="msg-avatar-spacer" />}
                            <div className="msg-bubble-wrapper">
                              {showAvatar && !isOwn && (
                                <div className="msg-sender">{msg.userName}</div>
                              )}
                              <div className={`msg-bubble ${isOwn ? 'own' : ''}`}>
                                <span className="msg-text">{msg.text}</span>
                                <span className="msg-time">
                                  {new Date(msg.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="msg-input-bar" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Mesaj yazın..."
                  className="msg-input"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="msg-send-btn" disabled={!newMessage.trim()}>
                  <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
                    <path d="M1 1.5l14 6.5-14 6.5v-5l8-1.5-8-1.5v-5z" />
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <div className="msg-no-channel">
              <p>Bir kanal seçin veya yeni kanal oluşturun.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Channel Modal */}
      {showNewChannel && (
        <div className="modal-overlay" onClick={() => setShowNewChannel(false)}>
          <div className="modal-content msg-channel-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Yeni Kanal Oluştur</h2>
              <button className="modal-close" onClick={() => setShowNewChannel(false)}></button>
            </div>
            <form onSubmit={handleCreateChannel} className="msg-channel-form">
              <div className="form-group">
                <label>Kanal Adı *</label>
                <input type="text" value={channelForm.name} onChange={e => setChannelForm({ ...channelForm, name: e.target.value })} placeholder="ör: Proje Alpha" required />
              </div>
              <div className="form-group">
                <label>Kanal Tipi</label>
                <select value={channelForm.type} onChange={e => setChannelForm({ ...channelForm, type: e.target.value })}>
                  <option value="team"> Ekip Kanalı</option>
                  <option value="incident"> Arıza Kanalı</option>
                  <option value="private"> Özel Kanal</option>
                </select>
              </div>
              {channelForm.type === 'incident' && (
                <div className="form-group">
                  <label>İlişkili Arıza</label>
                  <select value={channelForm.incidentId} onChange={e => setChannelForm({ ...channelForm, incidentId: e.target.value })}>
                    <option value="">Seçiniz</option>
                    {incidents.filter(i => i.status !== 'resolved' && i.status !== 'cancelled').map(inc => {
                      const client = clients.find(c => c.id === inc.clientId);
                      return <option key={inc.id} value={inc.id}>{client?.name}: {inc.description?.slice(0, 50)}</option>;
                    })}
                  </select>
                </div>
              )}
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewChannel(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Oluştur</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagingPage;
