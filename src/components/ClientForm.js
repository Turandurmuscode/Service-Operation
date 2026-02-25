import React, { useState } from 'react';
import { SLA_TIERS, TIER_KEYS } from '../utils/slaTiers';

function ClientForm({ addClient }) {
  const [name,    setName]    = useState('');
  const [city,    setCity]    = useState('');
  const [phone,   setPhone]   = useState('');
  const [email,   setEmail]   = useState('');
  const [slaTier, setSlaTier] = useState('bronze');

  const handleSubmit = (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engelle
    
    if (!name.trim()) { alert('Lütfen müşteri adını girin'); return; }
    addClient({ name: name.trim(), city: city.trim(), phone: phone.trim(), email: email.trim(), slaTier });
    setName(''); setCity(''); setPhone(''); setEmail(''); setSlaTier('bronze');
  };

  const inp = {
    width: '100%', padding: '9px 12px', borderRadius: '8px', fontSize: '13px',
    border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)',
    color: 'var(--text-primary)', marginTop: '4px', boxSizing: 'border-box',
  };

  const tier = SLA_TIERS[slaTier];

  return (
    <div className="card">
      <h2>Yeni Müşteri Ekle</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Müşteri Adı *</label>
            <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Örn: Güzellik Salonu ABC" />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Şehir</label>
            <input style={inp} value={city} onChange={e => setCity(e.target.value)} placeholder="İstanbul" />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Telefon</label>
            <input style={inp} value={phone} onChange={e => setPhone(e.target.value)} placeholder="0532 000 0000" />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>E-posta</label>
            <input style={inp} value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@sirket.com" />
          </div>
        </div>

        {/* SLA Tier seçici */}
        <div style={{ marginTop: '16px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>SLA Paketi</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {TIER_KEYS.map(key => {
              const t = SLA_TIERS[key];
              const selected = slaTier === key;
              return (
                <button key={key} type="button" onClick={() => setSlaTier(key)} style={{
                  flex: 1, padding: '10px 8px', borderRadius: '10px', cursor: 'pointer',
                  border: `2px solid ${selected ? t.color : t.borderColor}`,
                  background: selected ? t.bgColor : 'var(--bg-elevated)',
                  color: selected ? t.color : 'var(--text-primary)',
                  fontWeight: selected ? '700' : '500', fontSize: '13px',
                  transition: 'all 0.15s', boxShadow: selected ? `0 0 0 2px ${t.color}40` : 'none',
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '2px' }}>{t.icon}</div>
                  <div>{t.label}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>
                    Crt: {t.limits.critical >= 60 ? `${t.limits.critical / 60}sa` : `${t.limits.critical}dk`}
                  </div>
                </button>
              );
            })}
          </div>
          {tier && (
            <div style={{
              marginTop: '8px', padding: '8px 12px', borderRadius: '8px', fontSize: '12px',
              background: tier.bgColor, border: `1px solid ${tier.borderColor}`, color: tier.color,
            }}>
              {tier.features.join(' · ')}
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', width: '100%' }}>Müşteri Ekle</button>
      </form>
    </div>
  );
}

export default ClientForm;