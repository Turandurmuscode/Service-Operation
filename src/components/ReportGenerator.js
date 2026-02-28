import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function ReportGenerator({ incidents, clients }) {
  
  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // Başlık
    doc.setFontSize(20);
    doc.text('Servis Operasyon Raporu', 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 28);
    
    // Özet İstatistikler
    doc.setFontSize(14);
    doc.text('Genel Istatistikler', 14, 40);
    
    const totalIncidents = incidents.length;
    const activeIncidents = incidents.filter(inc => inc.status === 'new' || inc.status === 'in_progress' || inc.status === 'on_hold').length;
    const resolvedIncidents = incidents.filter(inc => inc.status === 'resolved').length;
    const criticalIncidents = incidents.filter(inc => inc.priority === 'critical').length;
    
    const statsData = [
      ['Toplam Ariza', totalIncidents.toString()],
      ['Aktif Ariza', activeIncidents.toString()],
      ['Cozulmus Ariza', resolvedIncidents.toString()],
      ['Kritik Ariza', criticalIncidents.toString()]
    ];
    
    doc.autoTable({
      startY: 45,
      head: [['Metrik', 'Deger']],
      body: statsData,
    });
    
    // Müşteri Bazlı Analiz
    doc.setFontSize(14);
    doc.text('Musteri Bazli Analiz', 14, doc.lastAutoTable.finalY + 15);
    
    const clientAnalysis = clients.map(client => {
      const clientIncidents = incidents.filter(inc => inc.clientId === client.id);
      const clientActive = clientIncidents.filter(inc => inc.status === 'new' || inc.status === 'in_progress' || inc.status === 'on_hold').length;
      
      return [
        client.name,
        client.city,
        clientIncidents.length.toString(),
        clientActive.toString()
      ];
    });
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Musteri', 'Sehir', 'Toplam Ariza', 'Aktif']],
      body: clientAnalysis,
    });
    
    // PDF'i indir
    doc.save(`servis-raporu-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateWeeklyReport = () => {
    // Son 7 günlük rapor
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyIncidents = incidents.filter(inc => 
      new Date(inc.startTime) > oneWeekAgo
    );
    
    const report = {
      period: 'Son 7 Gün',
      totalIncidents: weeklyIncidents.length,
      byPriority: {
        critical: weeklyIncidents.filter(inc => inc.priority === 'critical').length,
        medium: weeklyIncidents.filter(inc => inc.priority === 'medium').length,
        low: weeklyIncidents.filter(inc => inc.priority === 'low').length
      },
      byStatus: {
        resolved: weeklyIncidents.filter(inc => inc.status === 'resolved').length,
        active: weeklyIncidents.filter(inc => inc.status === 'new' || inc.status === 'in_progress' || inc.status === 'on_hold').length,
        new: weeklyIncidents.filter(inc => inc.status === 'new').length,
        in_progress: weeklyIncidents.filter(inc => inc.status === 'in_progress').length,
        on_hold: weeklyIncidents.filter(inc => inc.status === 'on_hold').length
      }
    };
    
    // JSON olarak indir
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `haftalik-rapor-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>📊 Raporlama</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button onClick={generatePDFReport} className="btn btn-primary">
          📄 PDF Rapor İndir
        </button>
        <button onClick={generateWeeklyReport} className="btn btn-secondary">
          📅 Haftalık Rapor (JSON)
        </button>
      </div>
    </div>
  );
}

export default ReportGenerator;