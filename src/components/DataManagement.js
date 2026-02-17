import React from 'react';

function DataManagement({ clients, incidents, setClients, setIncidents, setActivities, showToast }) {
  
  const clearAllClients = () => {
    if (window.confirm('Tüm müşteriler silinecek. Emin misiniz?')) {
      setClients([]);
      localStorage.setItem('clients', JSON.stringify([]));
      showToast('Tüm müşteriler silindi!', 'success');
    }
  };

  const clearAllIncidents = () => {
    if (window.confirm('Tüm arıza kayıtları silinecek. Emin misiniz?')) {
      setIncidents([]);
      localStorage.setItem('incidents', JSON.stringify([]));
      showToast('Tüm arıza kayıtları silindi!', 'success');
    }
  };

  const clearAllData = () => {
    if (window.confirm('TÜM VERİLER SİLİNECEK! Emin misiniz?')) {
      if (window.confirm('Son kez soruyorum, gerçekten tüm verileri silmek istiyor musunuz?')) {
        setClients([]);
        setIncidents([]);
        setActivities([]);
        localStorage.clear();
        showToast('Tüm veriler temizlendi!', 'success');
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  };

  return (
    <div className="data-management">
      <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#666' }}>
        ⚠️ Tehlikeli İşlemler
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button 
          onClick={clearAllClients} 
          className="btn btn-warning"
          style={{ fontSize: '13px' }}
        >
          🗑️ Tüm Müşterileri Sil
        </button>
        <button 
          onClick={clearAllIncidents} 
          className="btn btn-warning"
          style={{ fontSize: '13px' }}
        >
          🗑️ Tüm Arızaları Sil
        </button>
        <button 
          onClick={clearAllData} 
          className="btn btn-danger"
          style={{ fontSize: '13px' }}
        >
          💥 Tüm Verileri Sil
        </button>
      </div>
      
      <div style={{ 
        marginTop: '12px', 
        padding: '12px', 
        background: '#fff3cd', 
        borderRadius: '6px',
        fontSize: '12px',
        color: '#856404'
      }}>
        <strong>⚠️ Dikkat:</strong> Bu işlemler geri alınamaz!
      </div>
    </div>
  );
}

export default DataManagement;