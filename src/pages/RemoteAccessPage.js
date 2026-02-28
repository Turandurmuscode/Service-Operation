import { useState, useEffect, useMemo } from 'react';
import './RemoteAccessPage.css';

const CONNECTION_TYPES = [
  { id: 'anydesk', label: 'AnyDesk', icon: '🖥️', color: '#ef4444' },
  { id: 'teamviewer', label: 'TeamViewer', icon: '🔵', color: '#0078d4' },
  { id: 'rdp', label: 'RDP (Uzak Masaüstü)', icon: '💻', color: '#3b82f6' },
  { id: 'vpn', label: 'VPN', icon: '🔒', color: '#8b5cf6' },
  { id: 'ssh', label: 'SSH', icon: '⌨️', color: '#10b981' },
  { id: 'web', label: 'Web Panel', icon: '🌐', color: '#f59e0b' },
  { id: 'other', label: 'Diğer', icon: '🔗', color: '#64748b' },
];

const RemoteAccessPage = ({ clients, currentUser, showToast, darkMode }) => {
  const [connections, setConnections] = useState([]);
  const [search, setSearch] = useState('');
  const [addingForClient, setAddingForClient] = useState(null);
  const [editingConn, setEditingConn] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const [formData, setFormData] = useState({
    type: 'anydesk',
    connectionId: '',
    username: '',
    password: '',
    host: '',
    port: '',
    note: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('remoteConnections');
    if (saved) {
      setConnections(JSON.parse(saved));
    }
  }, []);

  const save = (data) => {
    setConnections(data);
    localStorage.setItem('remoteConnections', JSON.stringify(data));
  };

  // Group connections by client
  const clientConnections = useMemo(() => {
    const map = {};
    connections.forEach(c => {
      if (!map[c.clientId]) map[c.clientId] = [];
      map[c.clientId].push(c);
    });
    return map;
  }, [connections]);

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    let list = clients;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = clients.filter(c => {
        if (c.name.toLowerCase().includes(q)) return true;
        const conns = clientConnections[c.id] || [];
        return conns.some(conn => conn.connectionId?.toLowerCase().includes(q) || conn.host?.toLowerCase().includes(q) || conn.note?.toLowerCase().includes(q));
      });
    }
    // Sort: clients with connections first
    return list.sort((a, b) => {
      const aConns = (clientConnections[a.id] || []).length;
      const bConns = (clientConnections[b.id] || []).length;
      return bConns - aConns;
    });
  }, [clients, search, clientConnections]);

  const totalConnections = connections.length;
  const clientsWithConns = Object.keys(clientConnections).length;
  const typeBreakdown = useMemo(() => {
    const map = {};
    connections.forEach(c => { map[c.type] = (map[c.type] || 0) + 1; });
    return map;
  }, [connections]);

  const resetForm = () => {
    setFormData({ type: 'anydesk', connectionId: '', username: '', password: '', host: '', port: '', note: '' });
    setEditingConn(null);
  };

  const handleSave = (clientId) => {
    if (!formData.connectionId && !formData.host) {
      showToast('Bağlantı ID veya Host adresi gerekli', 'error');
      return;
    }

    if (editingConn) {
      // Update
      save(connections.map(c => c.id === editingConn.id ? { ...c, ...formData, updatedAt: new Date().toISOString() } : c));
      showToast('Bağlantı güncellendi', 'success');
    } else {
      // Create
      const newConn = {
        id: Date.now(),
        clientId,
        ...formData,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.username || 'admin',
      };
      save([...connections, newConn]);
      showToast('Bağlantı eklendi', 'success');
    }
    resetForm();
    setAddingForClient(null);
  };

  const handleEdit = (conn) => {
    setFormData({
      type: conn.type,
      connectionId: conn.connectionId || '',
      username: conn.username || '',
      password: conn.password || '',
      host: conn.host || '',
      port: conn.port || '',
      note: conn.note || '',
    });
    setEditingConn(conn);
    setAddingForClient(conn.clientId);
  };

  const handleDelete = (connId) => {
    if (!window.confirm('Bu bağlantı bilgisini silmek istediğinize emin misiniz?')) return;
    save(connections.filter(c => c.id !== connId));
    showToast('Bağlantı silindi', 'info');
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label} kopyalandı`, 'success');
    }).catch(() => {
      showToast('Kopyalama başarısız', 'error');
    });
  };

  const togglePassword = (connId) => {
    setVisiblePasswords(prev => ({ ...prev, [connId]: !prev[connId] }));
  };

  const getTypeInfo = (type) => CONNECTION_TYPES.find(t => t.id === type) || CONNECTION_TYPES[CONNECTION_TYPES.length - 1];

  return (
    <div className={`remote-access-page ${darkMode ? 'dark' : ''}`}>
      <h2>🔌 Uzak Erişim Yöneticisi</h2>
      <p className="page-subtitle">Müşteri bağlantı bilgilerini güvenli şekilde saklayın ve yönetin</p>

      {/* Stats */}
      <div className="ra-stats">
        <div className="ra-stat">
          <div className="stat-icon">🔗</div>
          <div className="stat-info"><div className="val">{totalConnections}</div><div className="lbl">Toplam Bağlantı</div></div>
        </div>
        <div className="ra-stat">
          <div className="stat-icon">🏢</div>
          <div className="stat-info"><div className="val">{clientsWithConns}</div><div className="lbl">Bağlantılı Müşteri</div></div>
        </div>
        {CONNECTION_TYPES.slice(0, 4).map(t => typeBreakdown[t.id] ? (
          <div className="ra-stat" key={t.id}>
            <div className="stat-icon">{t.icon}</div>
            <div className="stat-info"><div className="val">{typeBreakdown[t.id]}</div><div className="lbl">{t.label}</div></div>
          </div>
        ) : null)}
      </div>

      {/* Toolbar */}
      <div className="ra-toolbar">
        <input type="text" placeholder="🔍 Müşteri, ID veya adres ara..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Client cards */}
      <div className="ra-cards">
        {filteredClients.map(client => {
          const conns = clientConnections[client.id] || [];
          const isAdding = addingForClient === client.id;

          return (
            <div key={client.id} className="ra-card">
              <div className="ra-card-header">
                <h3>{client.name}</h3>
                <span className="client-badge">{conns.length} bağlantı</span>
              </div>
              <div className="ra-card-body">
                {conns.length > 0 && (
                  <div className="ra-conn-list">
                    {conns.map(conn => {
                      const typeInfo = getTypeInfo(conn.type);
                      const showPw = visiblePasswords[conn.id];
                      return (
                        <div key={conn.id} className="ra-conn-item">
                          <div className="ra-conn-icon" title={typeInfo.label}>{typeInfo.icon}</div>
                          <div className="ra-conn-details">
                            <div className="conn-type">{typeInfo.label}</div>
                            {conn.connectionId && (
                              <div className="conn-id" onClick={() => copyToClipboard(conn.connectionId, 'ID')} style={{ cursor: 'pointer' }} title="Tıkla & Kopyala">
                                {conn.connectionId}
                              </div>
                            )}
                            {conn.host && <div className="conn-id" onClick={() => copyToClipboard(conn.host, 'Adres')} style={{ cursor: 'pointer' }} title="Tıkla & Kopyala">{conn.host}{conn.port ? `:${conn.port}` : ''}</div>}
                            {conn.username && <div className="conn-note">👤 {conn.username}</div>}
                            {conn.password && (
                              <div className="password-field">
                                <span className="masked">{showPw ? conn.password : '••••••••'}</span>
                                <button onClick={() => togglePassword(conn.id)} title={showPw ? 'Gizle' : 'Göster'}>{showPw ? '🙈' : '👁️'}</button>
                                <button onClick={() => copyToClipboard(conn.password, 'Şifre')} title="Kopyala">📋</button>
                              </div>
                            )}
                            {conn.note && <div className="conn-note">📝 {conn.note}</div>}
                          </div>
                          <div className="ra-conn-actions">
                            <button onClick={() => handleEdit(conn)} title="Düzenle">✏️</button>
                            <button onClick={() => handleDelete(conn.id)} title="Sil">🗑️</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add/Edit form */}
                {isAdding ? (
                  <div className="ra-conn-form">
                    <div className="form-row">
                      <div>
                        <label>Bağlantı Türü</label>
                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                          {CONNECTION_TYPES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label>Bağlantı ID / Adres</label>
                        <input value={formData.connectionId} onChange={e => setFormData({ ...formData, connectionId: e.target.value })} placeholder="123 456 789" />
                      </div>
                    </div>
                    <div className="form-row">
                      <div>
                        <label>Host / IP</label>
                        <input value={formData.host} onChange={e => setFormData({ ...formData, host: e.target.value })} placeholder="192.168.1.100" />
                      </div>
                      <div>
                        <label>Port</label>
                        <input value={formData.port} onChange={e => setFormData({ ...formData, port: e.target.value })} placeholder="3389" />
                      </div>
                    </div>
                    <div className="form-row">
                      <div>
                        <label>Kullanıcı Adı</label>
                        <input value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} placeholder="admin" />
                      </div>
                      <div>
                        <label>Şifre</label>
                        <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="••••••" />
                      </div>
                    </div>
                    <div className="form-row full">
                      <div>
                        <label>Not</label>
                        <textarea value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} placeholder="Ek bilgi..." />
                      </div>
                    </div>
                    <div className="ra-conn-form-actions">
                      <button className="btn-save" onClick={() => handleSave(client.id)}>💾 {editingConn ? 'Güncelle' : 'Kaydet'}</button>
                      <button className="btn-cancel" onClick={() => { setAddingForClient(null); resetForm(); }}>İptal</button>
                    </div>
                  </div>
                ) : (
                  <button className="ra-add-conn" onClick={() => { setAddingForClient(client.id); resetForm(); }}>
                    + Bağlantı Ekle
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="empty-state">
          <div className="icon">🔍</div>
          <p>Arama kriterine uygun müşteri bulunamadı</p>
        </div>
      )}
    </div>
  );
};

export default RemoteAccessPage;
