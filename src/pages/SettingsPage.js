import React from 'react';

function SettingsPage({ darkMode, toggleDarkMode }) {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1>⚙️ Ayarlar</h1>
        <p>Uygulama ayarlarını yönet</p>
      </div>

      <div className="card">
        <h2>🎨 Görünüm</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Karanlık Mod</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Göz yorgunluğunu azaltır</div>
          </div>
          <button 
            className={`btn ${darkMode ? 'btn-warning' : 'btn-secondary'}`}
            onClick={toggleDarkMode}
          >
            {darkMode ? '☀️ Aydınlık' : '🌙 Karanlık'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: '16px' }}>
        <h2>ℹ️ Hakkında</h2>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <p><strong>Servis Operasyon Paneli</strong></p>
          <p>Versiyon: 1.0.0</p>
          <p>Müşteri destek ve arıza takip sistemi</p>
          <p style={{ marginTop: '12px' }}>© 2024 Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;