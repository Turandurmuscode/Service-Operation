import React, { useState } from 'react';

function ClientForm({ addClient }) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engelle
    
    if (!name || !city) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    addClient({ name, city });
    
    // Form'u temizle
    setName('');
    setCity('');
  };

  return (
    <div className="card">
      <h2>Yeni Müşteri Ekle</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Müşteri Adı</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn: Güzellik Salonu ABC"
          />
        </div>
        
        <div className="form-group">
          <label>Şehir</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Örn: İstanbul"
          />
        </div>
        
        <button type="submit" className="btn btn-primary">
          Müşteri Ekle
        </button>
      </form>
    </div>
  );
}

export default ClientForm;