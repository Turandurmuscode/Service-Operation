import React, { useRef } from 'react';

function DataExport({ incidents, clients, setClients, showToast }) {
  const fileInputRef = useRef(null);

  // JSON olarak indir
  const exportToJSON = () => {
    const data = {
      clients,
      incidents,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ariza-raporu-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (showToast) showToast('JSON dosyası indirildi!', 'success');
  };

  // CSV olarak indir
  const exportToCSV = () => {
    const headers = ['Tarih', 'Müşteri', 'Şehir', 'Sorun', 'Öncelik', 'Durum', 'Süre (dk)', 'Kategori', 'Son Tarih'];
    const rows = incidents.map(inc => {
      const client = clients.find(c => c.id === inc.clientId);
      return [
        new Date(inc.startTime).toLocaleString('tr-TR'),
        client?.name || 'Bilinmiyor',
        client?.city || '-',
        `"${inc.description.replace(/"/g, '""')}"`,
        inc.priority === 'low' ? 'Düşük' : inc.priority === 'medium' ? 'Orta' : 'Kritik',
        inc.status === 'resolved' ? 'Çözüldü' : inc.status === 'cancelled' ? 'İptal' : 'Aktif',
        inc.duration || '-',
        inc.category || 'Belirtilmemiş',
        inc.deadline ? new Date(inc.deadline).toLocaleString('tr-TR') : '-',
      ];
    });
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ariza-raporu-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    if (showToast) showToast('CSV dosyası indirildi!', 'success');
  };

  // PDF olarak indir (jsPDF CDN'den yüklenir)
  const exportToPDF = async () => {
    try {
      // jsPDF'i CDN'den yükle (proje bağımlılığı gerektirmez)
      if (!window.jspdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      const dateStr = new Date().toLocaleString('tr-TR');
      const pageW = doc.internal.pageSize.getWidth();

      // ─── KAPAK ───
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, pageW, 297, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('Servis Operasyon Paneli', pageW / 2, 80, { align: 'center' });
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Tam Veri Raporu', pageW / 2, 95, { align: 'center' });
      doc.setFontSize(11);
      doc.setTextColor(148, 163, 184);
      doc.text(`Oluşturulma: ${dateStr}`, pageW / 2, 110, { align: 'center' });

      // Özet kutuları
      const resolved = incidents.filter(i => i.status === 'resolved').length;
      const active   = incidents.filter(i => i.status !== 'resolved' && i.status !== 'cancelled').length;
      const overdue  = incidents.filter(i =>
        i.deadline && i.status !== 'resolved' && i.status !== 'cancelled' &&
        new Date(i.deadline) < new Date()
      ).length;

      const boxes = [
        { label: 'Toplam Musteri', value: clients.length, color: [59, 130, 246] },
        { label: 'Toplam Ariza',   value: incidents.length, color: [245, 158, 11] },
        { label: 'Aktif Ariza',    value: active, color: [239, 68, 68] },
        { label: 'Cozulen',        value: resolved, color: [16, 185, 129] },
        { label: 'Gecikmiş',       value: overdue, color: [168, 85, 247] },
      ];
      boxes.forEach((box, i) => {
        const x = 20 + i * 52;
        doc.setFillColor(...box.color);
        doc.roundedRect(x, 130, 46, 28, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(String(box.value), x + 23, 146, { align: 'center' });
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(box.label, x + 23, 154, { align: 'center' });
      });

      // ─── SAYFA 2: MÜŞTERİ LİSTESİ ───
      doc.addPage();
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, pageW, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Musteri Listesi', 10, 13);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(dateStr, pageW - 10, 13, { align: 'right' });

      const clientHeaders = ['#', 'Musteri Adi', 'Sehir', 'Kayit Tarihi', 'Ariza Sayisi'];
      const clientColW    = [10, 70, 50, 50, 40];
      let y = 28;
      doc.setFillColor(248, 250, 252);
      doc.rect(10, y - 5, pageW - 20, 10, 'F');
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      let cx = 10;
      clientHeaders.forEach((h, i) => { doc.text(h, cx + 2, y); cx += clientColW[i]; });
      y += 8;

      clients.forEach((client, idx) => {
        if (y > 190) { doc.addPage(); y = 20; }
        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(10, y - 5, pageW - 20, 8, 'F');
        }
        const clientIncCount = incidents.filter(i => i.clientId === client.id).length;
        const row = [
          String(idx + 1),
          client.name || '-',
          client.city || '-',
          client.createdAt ? new Date(client.createdAt).toLocaleDateString('tr-TR') : '-',
          String(clientIncCount),
        ];
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(8);
        cx = 10;
        row.forEach((val, i) => {
          const maxW = clientColW[i] - 4;
          const truncated = doc.getTextWidth(val) > maxW
            ? val.substring(0, Math.floor(maxW / doc.getTextWidth(val[0]))) + '...'
            : val;
          doc.text(truncated, cx + 2, y);
          cx += clientColW[i];
        });
        y += 8;
      });

      // ─── SAYFA 3: ARIZA LİSTESİ ───
      doc.addPage();
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, pageW, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Ariza Listesi', 10, 13);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(dateStr, pageW - 10, 13, { align: 'right' });

      const incHeaders = ['#', 'Musteri', 'Sorun', 'Oncelik', 'Durum', 'Baslangic', 'Son Tarih', 'Sure'];
      const incColW   = [8, 45, 70, 22, 28, 38, 38, 20];
      y = 28;
      doc.setFillColor(248, 250, 252);
      doc.rect(10, y - 5, pageW - 20, 10, 'F');
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      cx = 10;
      incHeaders.forEach((h, i) => { doc.text(h, cx + 2, y); cx += incColW[i]; });
      y += 8;

      const priorityLabel = { low: 'Dusuk', medium: 'Orta', critical: 'Kritik' };
      const statusLabel   = { new: 'Yeni', in_progress: 'Devam', on_hold: 'Beklemede', resolved: 'Cozuldu', cancelled: 'Iptal', active: 'Aktif' };

      incidents.forEach((inc, idx) => {
        if (y > 190) { doc.addPage(); y = 20; }
        const client = clients.find(c => c.id === inc.clientId);

        // Kritik veya gecikmiş ise satırı hafif kırmızı yap
        const isOverdueRow = inc.deadline && inc.status !== 'resolved' && inc.status !== 'cancelled' && new Date(inc.deadline) < new Date();
        if (isOverdueRow) {
          doc.setFillColor(254, 226, 226);
          doc.rect(10, y - 5, pageW - 20, 8, 'F');
        } else if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(10, y - 5, pageW - 20, 8, 'F');
        }

        const row = [
          String(idx + 1),
          client?.name || 'Bilinmiyor',
          inc.description,
          priorityLabel[inc.priority] || inc.priority,
          statusLabel[inc.status] || inc.status,
          new Date(inc.startTime).toLocaleDateString('tr-TR'),
          inc.deadline ? new Date(inc.deadline).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-',
          inc.duration ? `${inc.duration}dk` : '-',
        ];

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(isOverdueRow ? '#ef4444' : 51, isOverdueRow ? 68 : 65, isOverdueRow ? 68 : 85);
        doc.setFontSize(7.5);
        cx = 10;
        row.forEach((val, i) => {
          const maxChars = Math.floor((incColW[i] - 4) / 2.2);
          const truncated = val.length > maxChars ? val.substring(0, maxChars) + '…' : val;
          doc.text(truncated, cx + 2, y);
          cx += incColW[i];
        });
        y += 8;
      });

      // Footer on each page
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Sayfa ${p} / ${totalPages}`, pageW / 2, 200, { align: 'center' });
      }

      doc.save(`servis-raporu-${new Date().toISOString().split('T')[0]}.pdf`);
      if (showToast) showToast('PDF raporu indirildi!', 'success');
    } catch (err) {
      console.error(err);
      if (showToast) showToast('PDF oluşturulamadı: ' + err.message, 'error');
    }
  };

  // Bitrix24'ten gelen CSV'yi import et
  const importClientsFromCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const lines = e.target.result.split('\n').filter(l => l.trim());
        if (lines.length < 2) { if (showToast) showToast('CSV dosyası boş!', 'error'); return; }
        const imported = lines.slice(1).map((line, i) => {
          const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
          return { id: Date.now() + i, name: values[0] || 'İsimsiz', city: values[1] || 'Belirtilmemiş', createdAt: new Date().toISOString() };
        }).filter(c => c.name && c.name !== 'İsimsiz');
        if (imported.length > 0) {
          const all = [...clients, ...imported];
          setClients(all);
          localStorage.setItem('clients', JSON.stringify(all));
          if (showToast) showToast(`${imported.length} müşteri eklendi!`, 'success');
        } else {
          if (showToast) showToast('Geçerli veri bulunamadı.', 'error');
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        if (showToast) showToast('CSV okunamadı: ' + err.message, 'error');
      }
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
      } catch (err) {
        if (showToast) showToast('JSON okunamadı: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="export-actions">
      <button onClick={exportToPDF} className="btn btn-danger">
         PDF İndir
      </button>
      <button onClick={exportToJSON} className="btn btn-primary">
         JSON İndir
      </button>
      <button onClick={exportToCSV} className="btn btn-primary">
         CSV İndir
      </button>
      <label className="btn btn-warning" style={{ cursor: 'pointer' }}>
         Müşteri CSV Yükle
        <input ref={fileInputRef} type="file" accept=".csv" onChange={importClientsFromCSV} style={{ display: 'none' }} />
      </label>
      <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
         JSON Yükle
        <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
      </label>
    </div>
  );
}

export default DataExport;