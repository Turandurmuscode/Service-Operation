import React from 'react';

function StatCards({ incidents }) {
  // Toplam incident sayısı
  const totalIncidents = incidents.length;
  
  // Aktif (çözülmemiş) incident sayısı
  const activeIncidents = incidents.filter(inc => inc.status === 'active').length;
  
  // Kritik incident sayısı
  const criticalIncidents = incidents.filter(inc => inc.priority === 'critical').length;
  
  // Ortalama çözüm süresi hesapla (sadece çözülmüş olanlar için)
  const resolvedIncidents = incidents.filter(inc => inc.status === 'resolved' && inc.duration);
  const avgResolutionTime = resolvedIncidents.length > 0
    ? Math.round(resolvedIncidents.reduce((sum, inc) => sum + inc.duration, 0) / resolvedIncidents.length)
    : 0;

  return (
    <div className="stat-cards">
      <div className="stat-card">
        <h3>Toplam Arıza</h3>
        <div className="value">{totalIncidents}</div>
      </div>
      
      <div className="stat-card">
        <h3>Aktif Arızalar</h3>
        <div className="value" style={{ color: activeIncidents > 0 ? '#ff9800' : '#4CAF50' }}>
          {activeIncidents}
        </div>
      </div>
      
      <div className="stat-card critical">
        <h3>Kritik Arızalar</h3>
        <div className="value">{criticalIncidents}</div>
      </div>
      
      <div className="stat-card success">
        <h3>Ort. Çözüm Süresi</h3>
        <div className="value">{avgResolutionTime} dk</div>
      </div>
    </div>
  );
}

export default StatCards;