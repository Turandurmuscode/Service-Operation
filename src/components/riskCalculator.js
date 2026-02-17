// Müşteri risk skorunu hesapla (1-10 arası)
export const calculateRiskScore = (clientId, incidents) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Son 30 gündeki arızalar
  const recentIncidents = incidents.filter(inc => 
    inc.clientId === clientId && 
    new Date(inc.startTime) > thirtyDaysAgo
  );

  if (recentIncidents.length === 0) return 0;

  let score = 0;

  // 1. Arıza sayısı (max 4 puan)
  const incidentCount = recentIncidents.length;
  score += Math.min(incidentCount * 0.5, 4);

  // 2. Kritik arıza sayısı (max 3 puan)
  const criticalCount = recentIncidents.filter(inc => inc.priority === 'critical').length;
  score += Math.min(criticalCount * 1.5, 3);

  // 3. Ortalama çözüm süresi (max 2 puan)
  const resolvedIncidents = recentIncidents.filter(inc => inc.duration);
  if (resolvedIncidents.length > 0) {
    const avgDuration = resolvedIncidents.reduce((sum, inc) => sum + inc.duration, 0) / resolvedIncidents.length;
    if (avgDuration > 240) score += 2; // 4 saatten fazla
    else if (avgDuration > 120) score += 1; // 2 saatten fazla
  }

  // 4. Aktif arıza var mı (max 1 puan)
  const hasActiveIncidents = recentIncidents.some(inc => inc.status === 'active');
  if (hasActiveIncidents) score += 1;

  return Math.min(Math.round(score), 10);
};

// Risk seviyesi metni
export const getRiskLevel = (score) => {
  if (score === 0) return { text: 'Veri Yok', color: '#999' };
  if (score <= 3) return { text: 'Düşük Risk', color: '#4CAF50' };
  if (score <= 6) return { text: 'Orta Risk', color: '#ff9800' };
  if (score <= 8) return { text: 'Yüksek Risk', color: '#f44336' };
  return { text: 'Kritik Risk', color: '#c62828' };
};