import React, { useState } from 'react';

function IncidentForm({ clients, addIncident }) {
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('low');
  const [category, setCategory] = useState('software');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrelenmiş müşteriler
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!clientId || !description) {
      alert('Lütfen müşteri seçin ve açıklama girin');
      return;
    }

    const slaMinutes = {
      critical: 120,
      medium: 480,
      low: 1440
    };

    addIncident({
      clientId: parseInt(clientId),
      description,
      priority,
      category,
      slaDeadline: slaMinutes[priority]
    });
    
    setClientId('');
    setDescription('');
    setPriority('low');
    setCategory('software');
    setSearchTerm('');
  };

  return (
    <div className="card">
      <h2>🆕 Yeni Arıza Kaydı</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Müşteri Ara</label>
          <input
            type="text"
            placeholder="🔍 Müşteri adı veya şehir ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Müşteri Seçin</label>
          <select 
            value={clientId} 
            onChange={(e) => setClientId(e.target.value)}
            style={{ minHeight: '80px' }}
          >
            <option value="">-- Müşteri Seçin --</option>
            {filteredClients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name} - {client.city}
              </option>
            ))}
          </select>
          {searchTerm && filteredClients.length === 0 && (
            <small style={{ color: '#ef4444', fontSize: '12px' }}>Müşteri bulunamadı.</small>
          )}
        </div>

        <div className="form-group">
          <label>Kategori</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="software">💻 Yazılım</option>
            <option value="hardware">🖥️ Donanım</option>
            <option value="network">🌐 Network</option>
            <option value="other">📦 Diğer</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Sorun Açıklaması</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Sorun detaylarını yazın..."
          />
        </div>
        
        <div className="form-group">
          <label>Öncelik Seviyesi</label>
          <select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">🟢 Düşük (24 saat)</option>
            <option value="medium">🟡 Orta (8 saat)</option>
            <option value="critical">🔴 Kritik (2 saat)</option>
          </select>
        </div>
        
        <button type="submit" className="btn btn-danger" style={{ width: '100%' }}>
          Arıza Kaydı Oluştur
        </button>
      </form>
    </div>
  );
}

export default IncidentForm;