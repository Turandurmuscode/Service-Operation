import React, { useState, useEffect } from 'react';

const loadJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
};

const DEFAULT_TEMPLATES = {
  software: ['Uygulama açılmıyor / crash veriyor', 'Güncelleme sonrası hata alınıyor', 'Lisans sorunu / aktivasyon hatası', 'Yavaş çalışma / performans sorunu'],
  hardware: ['Bilgisayar açılmıyor', 'Ekran görüntüsü yok / monitör sorunu', 'Klavye / mouse çalışmıyor', 'Printer / yazıcı bağlantı sorunu'],
  network:  ['İnternet bağlantısı yok', 'VPN bağlanamıyor', 'Paylaşım ağına erişilemiyor', 'DNS / IP yapılandırma sorunu'],
  other:    ['Genel teknik destek talebi', 'Kullanıcı şifresi sıfırlama', 'E-posta yapılandırma sorunu', 'Yeni cihaz kurulumu'],
};

function IncidentForm({ clients, addIncident }) {
  const [clientId, setClientId]       = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority]       = useState('low');
  const [category, setCategory]       = useState('software');
  const [searchTerm, setSearchTerm]   = useState('');
  const [deadline, setDeadline]       = useState('');
  const [technicianId, setTechnicianId] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const [technicians, setTechnicians] = useState([]);
  const [templates, setTemplates]     = useState(DEFAULT_TEMPLATES);

  // localStorage'dan teknisyen ve şablonları oku
  useEffect(() => {
    setTechnicians(loadJSON('technicians', []));
    setTemplates(loadJSON('incidentTemplates', DEFAULT_TEMPLATES));
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePriorityChange = (val) => {
    setPriority(val);
    const now = new Date();
    const hoursMap = { critical: 2, medium: 8, low: 24 };
    now.setHours(now.getHours() + hoursMap[val]);
    setDeadline(new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  };

  // Kategori değişince şablon önerilerini göster
  const handleCategoryChange = (val) => {
    setCategory(val);
    setShowTemplates(true);
  };

  const applyTemplate = (tpl) => {
    setDescription(tpl);
    setShowTemplates(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientId || !description) { alert('Lütfen müşteri seçin ve açıklama girin'); return; }
    const slaMinutes = { critical: 120, medium: 480, low: 1440 };
    addIncident({
      clientId: parseInt(clientId),
      description,
      priority,
      category,
      slaDeadline: slaMinutes[priority],
      deadline: deadline || null,
      technicianId: technicianId ? parseInt(technicianId) : null,
    });
    setClientId(''); setDescription(''); setPriority('low');
    setCategory('software'); setSearchTerm(''); setDeadline(''); setTechnicianId('');
  };

  const currentTemplates = templates[category] || [];
  const selectedTech = technicians.find(t => t.id === parseInt(technicianId));

  const suggestStyle = {
    padding: '7px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', textAlign: 'left', marginBottom: '5px',
    transition: 'background 0.15s',
  };

  return (
    <div className="card">
      <h2>🆕 Yeni Arıza Kaydı</h2>
      <form onSubmit={handleSubmit}>

        {/* Müşteri Arama */}
        <div className="form-group">
          <label>Müşteri Ara</label>
          <input type="text" placeholder="🔍 Müşteri adı veya şehir ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Müşteri Seçin</label>
          <select value={clientId} onChange={e => setClientId(e.target.value)} style={{ minHeight: '80px' }}>
            <option value="">-- Müşteri Seçin --</option>
            {filteredClients.map(client => (
              <option key={client.id} value={client.id}>{client.name} - {client.city}</option>
            ))}
          </select>
          {searchTerm && filteredClients.length === 0 && (
            <small style={{ color: '#ef4444', fontSize: '12px' }}>Müşteri bulunamadı.</small>
          )}
        </div>

        {/* Teknisyen Atama */}
        <div className="form-group">
          <label>👷 Teknisyen Ata</label>
          {technicians.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '8px 0' }}>
              Henüz teknisyen eklenmedi. <strong>Ayarlar → Teknisyen Yönetimi</strong>'nden ekleyin.
            </p>
          ) : (
            <select value={technicianId} onChange={e => setTechnicianId(e.target.value)}>
              <option value="">-- Teknisyen Seçin (opsiyonel) --</option>
              {technicians.map(tech => (
                <option key={tech.id} value={tech.id}>{tech.name} — {tech.role}</option>
              ))}
            </select>
          )}
          {selectedTech && (
            <div style={{
              marginTop: '6px', padding: '6px 10px', borderRadius: '8px',
              background: '#3b82f615', border: '1px solid #3b82f630', fontSize: '12px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ fontWeight: '700', color: '#3b82f6' }}>{selectedTech.name.charAt(0)}</span>
              <span><strong>{selectedTech.name}</strong> atandı — {selectedTech.role}</span>
            </div>
          )}
        </div>

        {/* Kategori + Şablon Önerileri */}
        <div className="form-group">
          <label>Kategori</label>
          <select value={category} onChange={e => handleCategoryChange(e.target.value)}>
            <option value="software">💻 Yazılım</option>
            <option value="hardware">🖥️ Donanım</option>
            <option value="network">🌐 Network</option>
            <option value="other">📦 Diğer</option>
          </select>
        </div>

        {/* Sorun Açıklaması + Şablonlar */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ margin: 0 }}>Sorun Açıklaması</label>
            {currentTemplates.length > 0 && (
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                style={{
                  fontSize: '11px', padding: '3px 10px', borderRadius: '20px', border: 'none',
                  cursor: 'pointer', background: 'var(--accent)', color: '#000', fontWeight: '600',
                }}
              >
                📋 Şablonlar {showTemplates ? '▲' : '▼'}
              </button>
            )}
          </div>

          {/* Şablon listesi */}
          {showTemplates && currentTemplates.length > 0 && (
            <div style={{ marginBottom: '8px', padding: '10px', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>Tıklayarak seç:</p>
              {currentTemplates.map((tpl, idx) => (
                <button key={idx} type="button" style={suggestStyle} onClick={() => applyTemplate(tpl)}>
                  📌 {tpl}
                </button>
              ))}
            </div>
          )}

          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Sorun detaylarını yazın veya yukarıdan şablon seçin..."
          />
        </div>

        {/* Öncelik */}
        <div className="form-group">
          <label>Öncelik Seviyesi</label>
          <select value={priority} onChange={e => handlePriorityChange(e.target.value)}>
            <option value="low">🟢 Düşük (24 saat)</option>
            <option value="medium">🟡 Orta (8 saat)</option>
            <option value="critical">🔴 Kritik (2 saat)</option>
          </select>
        </div>

        {/* Deadline */}
        <div className="form-group">
          <label>
            📅 Son Tarih / Deadline
            <small style={{ marginLeft: '8px', color: '#94a3b8', fontWeight: 'normal' }}>
              (önceliğe göre otomatik, değiştirebilirsin)
            </small>
          </label>
          <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-danger" style={{ width: '100%' }}>
          Arıza Kaydı Oluştur
        </button>
      </form>
    </div>
  );
}

export default IncidentForm;