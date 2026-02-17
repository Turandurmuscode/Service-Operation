import React, { useRef } from 'react';

function DataExport({ incidents, clients, setClients, showToast }) {
  const fileInputRef = useRef(null);

  // JSON olarak indir
  const exportToJSON = () => {
    const data = {
      clients,
      incidents,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `ariza-raporu-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    if (showToast) showToast('JSON dosyası indirildi!', 'success');
  };

  // CSV olarak indir
  const exportToCSV = () => {
    const headers = ['Tarih', 'Müşteri', 'Şehir', 'Sorun', 'Öncelik', 'Durum', 'Süre (dk)', 'Kategori'];
    
    const rows = incidents.map(inc => {
      const client = clients.find(c => c.id === inc.clientId);
      return [
        new Date(inc.startTime).toLocaleString('tr-TR'),
        client?.name || 'Bilinmiyor',
        client?.city || '-',
        `"${inc.description.replace(/"/g, '""')}"`,
        inc.priority === 'low' ? 'Düşük' : inc.priority === 'medium' ? 'Orta' : 'Kritik',
        inc.status === 'active' ? 'Aktif' : 'Çözüldü',
        inc.duration || '-',
        inc.category || 'Belirtilmemiş'
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const BOM = '\uFEFF';
    const csvBlob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(csvBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `ariza-raporu-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    if (showToast) showToast('CSV dosyası indirildi!', 'success');
  };

  // Bitrix24'ten gelen CSV'yi import et
  const importClientsFromCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          if (showToast) showToast('CSV dosyası boş!', 'error');
          return;
        }

        // İlk satır header, atla
        const dataLines = lines.slice(1);
        
        const importedClients = dataLines.map((line, index) => {
          // Virgül ile ayır, tırnak işaretlerini temizle
          const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
          
          return {
            id: Date.now() + index,
            name: values[0] || 'İsimsiz Müşteri',
            city: values[1] || 'Belirtilmemiş',
            createdAt: new Date().toISOString()
          };
        }).filter(c => c.name && c.name !== 'İsimsiz Müşteri' && c.name.length > 0);

        if (importedClients.length > 0) {
          // Mevcut müşterilerle birleştir
          const allClients = [...clients, ...importedClients];
          setClients(allClients);
          localStorage.setItem('clients', JSON.stringify(allClients));
          
          if (showToast) showToast(`${importedClients.length} müşteri başarıyla eklendi!`, 'success');
        } else {
          if (showToast) showToast('CSV dosyasında geçerli veri bulunamadı.', 'error');
        }
        
        // Input'u temizle
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        if (showToast) showToast('CSV dosyası okunamadı: ' + error.message, 'error');
        console.error(error);
      }
    };
    
    reader.onerror = () => {
      if (showToast) showToast('Dosya okuma hatası!', 'error');
    };
    
    reader.readAsText(file, 'UTF-8');
  };

  // JSON import
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.clients && data.incidents) {
          localStorage.setItem('clients', JSON.stringify(data.clients));
          localStorage.setItem('incidents', JSON.stringify(data.incidents));
          if (showToast) showToast('Veriler yüklendi! Sayfa yenilenecek.', 'success');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          if (showToast) showToast('Geçersiz JSON formatı!', 'error');
        }
      } catch (error) {
        if (showToast) showToast('JSON okunamadı: ' + error.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="export-actions">
      <button onClick={exportToJSON} className="btn btn-primary">
        📥 JSON İndir
      </button>
      <button onClick={exportToCSV} className="btn btn-primary">
        📊 CSV İndir
      </button>
      
      <label className="btn btn-warning" style={{ cursor: 'pointer' }}>
        📤 Müşteri CSV Yükle
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".csv"
          onChange={importClientsFromCSV}
          style={{ display: 'none' }}
        />
      </label>
      
      <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
        📂 JSON Yükle
        <input 
          type="file" 
          accept=".json"
          onChange={importData}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
}

export default DataExport;