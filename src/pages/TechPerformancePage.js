import { useState, useMemo } from 'react';
import './TechPerformancePage.css';

const TechPerformancePage = ({ incidents, clients, darkMode }) => {
  const [selectedTech, setSelectedTech] = useState(null);

  // Get all technician names
  const technicians = useMemo(() => {
    const names = [...new Set(incidents.map(i => i.assignedTo).filter(Boolean))];
    return names.sort();
  }, [incidents]);

  // Compute per-technician metrics
  const techMetrics = useMemo(() => {
    const map = {};
    technicians.forEach(name => {
      const techIncidents = incidents.filter(i => i.assignedTo === name);
      const resolved = techIncidents.filter(i => i.status === 'resolved' || i.status === 'closed');
      const active = techIncidents.filter(i => i.status === 'new' || i.status === 'in_progress' || i.status === 'on_hold');
      
      // Avg resolution time (hours)
      const resTimes = resolved.map(i => {
        if (!i.createdAt || !i.resolvedAt) return null;
        return (new Date(i.resolvedAt) - new Date(i.createdAt)) / (1000 * 60 * 60);
      }).filter(Boolean);
      const avgResTime = resTimes.length > 0 ? resTimes.reduce((a, b) => a + b, 0) / resTimes.length : 0;

      // Resolution rate
      const resRate = techIncidents.length > 0 ? (resolved.length / techIncidents.length) * 100 : 0;

      // Priority breakdown
      const priorities = { critical: 0, high: 0, medium: 0, low: 0 };
      techIncidents.forEach(i => { if (priorities[i.priority] !== undefined) priorities[i.priority]++; });

      // SLA compliance (simplified: resolved within SLA target)
      const slaTarget = 24; // hours
      const withinSLA = resolved.filter(i => {
        if (!i.createdAt || !i.resolvedAt) return false;
        const hours = (new Date(i.resolvedAt) - new Date(i.createdAt)) / (1000 * 60 * 60);
        return hours <= slaTarget;
      }).length;
      const slaRate = resolved.length > 0 ? (withinSLA / resolved.length) * 100 : 0;

      // Client diversity
      const uniqueClients = [...new Set(techIncidents.map(i => i.clientId).filter(Boolean))].length;

      // Daily resolution for last 7 days
      const dailyRes = [];
      for (let d = 6; d >= 0; d--) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        const dateStr = date.toISOString().slice(0, 10);
        const count = resolved.filter(i => i.resolvedAt && i.resolvedAt.slice(0, 10) === dateStr).length;
        dailyRes.push({ day: date.toLocaleDateString('tr-TR', { weekday: 'short' }), count });
      }

      // Categories / skills
      const categories = {};
      techIncidents.forEach(i => {
        const cat = i.category || 'Diğer';
        categories[cat] = (categories[cat] || 0) + 1;
      });

      // Recent incidents
      const recent = techIncidents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

      // CSAT scores if available
      let csatAvg = null;
      try {
        const csatData = JSON.parse(localStorage.getItem('csatSurveys') || '[]');
        const techSurveys = csatData.filter(s => s.technicianName === name);
        if (techSurveys.length > 0) {
          csatAvg = (techSurveys.reduce((a, s) => a + s.starRating, 0) / techSurveys.length).toFixed(1);
        }
      } catch (e) { /* ignore */ }

      map[name] = {
        name,
        total: techIncidents.length,
        resolved: resolved.length,
        active: active.length,
        avgResTime,
        resRate,
        slaRate,
        priorities,
        uniqueClients,
        dailyRes,
        categories,
        recent,
        csatAvg,
      };
    });
    return map;
  }, [incidents, technicians]);

  const activeTech = selectedTech || technicians[0];
  const metrics = techMetrics[activeTech];

  // Comparison ranking
  const ranking = useMemo(() => {
    return Object.values(techMetrics).sort((a, b) => {
      // Sort by resolution rate, then avg time
      const scoreA = a.resRate * 0.6 + a.slaRate * 0.4;
      const scoreB = b.resRate * 0.6 + b.slaRate * 0.4;
      return scoreB - scoreA;
    });
  }, [techMetrics]);

  const formatHours = (h) => {
    if (h < 1) return `${Math.round(h * 60)} dk`;
    if (h < 24) return `${h.toFixed(1)} saat`;
    return `${(h / 24).toFixed(1)} gün`;
  };

  if (technicians.length === 0) {
    return (
      <div className={`tech-perf-page ${darkMode ? 'dark' : ''}`}>
        <h2>👨‍🔧 Teknisyen Performansı</h2>
        <div className="empty-state"><div className="icon">👨‍🔧</div><p>Henüz atanmış arıza kaydı bulunmuyor</p></div>
      </div>
    );
  }

  return (
    <div className={`tech-perf-page ${darkMode ? 'dark' : ''}`}>
      <h2>👨‍🔧 Teknisyen Performans Analizi</h2>
      <p className="page-subtitle">Bireysel performans metrikleri, karşılaştırma ve iş yükü analizi</p>

      {/* Technician selector */}
      <div className="tech-selector">
        {technicians.map(name => (
          <button key={name} className={activeTech === name ? 'active' : ''} onClick={() => setSelectedTech(name)}>
            <span className="tech-name">👤 {name}</span>
            <span className="tech-count">{techMetrics[name]?.total || 0} arıza</span>
          </button>
        ))}
      </div>

      {metrics && (
        <>
          {/* KPI Overview */}
          <div className="tp-overview">
            <div className="tp-stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-value blue">{metrics.total}</div>
              <div className="stat-label">Toplam Arıza</div>
            </div>
            <div className="tp-stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-value green">{metrics.resolved}</div>
              <div className="stat-label">Çözülen</div>
            </div>
            <div className="tp-stat-card">
              <div className="stat-icon">🔄</div>
              <div className="stat-value orange">{metrics.active}</div>
              <div className="stat-label">Aktif</div>
            </div>
            <div className="tp-stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-value purple">{formatHours(metrics.avgResTime)}</div>
              <div className="stat-label">Ort. Çözüm Süresi</div>
            </div>
            <div className="tp-stat-card">
              <div className="stat-icon">📈</div>
              <div className={`stat-value ${metrics.resRate >= 80 ? 'green' : metrics.resRate >= 50 ? 'orange' : 'red'}`}>%{metrics.resRate.toFixed(0)}</div>
              <div className="stat-label">Çözüm Oranı</div>
            </div>
            <div className="tp-stat-card">
              <div className="stat-icon">🎯</div>
              <div className={`stat-value ${metrics.slaRate >= 80 ? 'green' : metrics.slaRate >= 50 ? 'orange' : 'red'}`}>%{metrics.slaRate.toFixed(0)}</div>
              <div className="stat-label">SLA Uyumu</div>
            </div>
            <div className="tp-stat-card">
              <div className="stat-icon">🏢</div>
              <div className="stat-value blue">{metrics.uniqueClients}</div>
              <div className="stat-label">Farklı Müşteri</div>
            </div>
            {metrics.csatAvg && (
              <div className="tp-stat-card">
                <div className="stat-icon">⭐</div>
                <div className={`stat-value ${metrics.csatAvg >= 4 ? 'green' : metrics.csatAvg >= 3 ? 'orange' : 'red'}`}>{metrics.csatAvg}</div>
                <div className="stat-label">CSAT Puanı</div>
              </div>
            )}
          </div>

          {/* Two columns */}
          <div className="tp-columns">
            {/* Workload & Priority */}
            <div className="tp-panel">
              <h3>🔥 İş Yükü & Öncelik Dağılımı</h3>
              <div className="workload-meter">
                <div className="meter-bar">
                  <div className="meter-fill" style={{
                    width: `${Math.min((metrics.active / Math.max(metrics.total, 1)) * 100, 100)}%`,
                    background: metrics.active > 5 ? '#ef4444' : metrics.active > 3 ? '#f59e0b' : '#10b981',
                  }}>
                    {metrics.active} aktif
                  </div>
                </div>
                <div className="meter-labels">
                  <span>0</span>
                  <span>Kapasitede ({metrics.active}/{metrics.total})</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
                {[
                  { key: 'critical', label: 'Kritik', color: '#ef4444' },
                  { key: 'high', label: 'Yüksek', color: '#f97316' },
                  { key: 'medium', label: 'Orta', color: '#f59e0b' },
                  { key: 'low', label: 'Düşük', color: '#10b981' },
                ].map(p => (
                  <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                    <span style={{ fontSize: '.85rem' }}>{p.label}: <strong>{metrics.priorities[p.key]}</strong></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills / Categories */}
            <div className="tp-panel">
              <h3>🛠️ Uzmanlık Alanları</h3>
              <div className="skill-badges">
                {Object.entries(metrics.categories)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, count]) => {
                    const level = count >= 5 ? 'high' : count >= 2 ? 'medium' : 'low';
                    return (
                      <span key={cat} className={`skill-badge ${level}`}>{cat} ({count})</span>
                    );
                  })}
                {Object.keys(metrics.categories).length === 0 && <span style={{ color: '#94a3b8' }}>Kategori verisi yok</span>}
              </div>
            </div>
          </div>

          <div className="tp-columns">
            {/* Daily resolution chart */}
            <div className="tp-panel">
              <h3>📊 Son 7 Gün Çözüm Grafiği</h3>
              <div className="daily-chart">
                {metrics.dailyRes.map((d, i) => {
                  const maxCount = Math.max(...metrics.dailyRes.map(x => x.count), 1);
                  const pct = (d.count / maxCount) * 100;
                  return (
                    <div key={i} className="daily-bar" style={{ height: `${Math.max(pct, 5)}%` }} title={`${d.day}: ${d.count} çözüm`}>
                      {d.count > 0 && <span className="bar-val">{d.count}</span>}
                      <span className="bar-label">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent incidents */}
            <div className="tp-panel">
              <h3>📋 Son Arızalar</h3>
              <table className="tp-incidents-table">
                <thead>
                  <tr><th>Başlık</th><th>Öncelik</th><th>Durum</th></tr>
                </thead>
                <tbody>
                  {metrics.recent.map(inc => (
                    <tr key={inc.id}>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.title}</td>
                      <td><span className={`priority-badge ${inc.priority}`}>{inc.priority}</span></td>
                      <td>{inc.status === 'resolved' ? '✅' : inc.status === 'in_progress' ? '🔄' : inc.status === 'new' ? '🆕' : inc.status === 'on_hold' ? '⏸️' : '📋'}</td>
                    </tr>
                  ))}
                  {metrics.recent.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center', padding: 16 }}>Arıza bulunamadı</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comparison table */}
          <div className="tp-comparison" style={{ marginTop: 24 }}>
            <h3>🏆 Teknisyen Karşılaştırması</h3>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Teknisyen</th>
                  <th>Toplam</th>
                  <th>Çözülen</th>
                  <th>Ort. Süre</th>
                  <th>Çözüm Oranı</th>
                  <th>SLA</th>
                  <th>Performans</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((t, i) => {
                  const score = t.resRate * 0.6 + t.slaRate * 0.4;
                  const barColor = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
                  return (
                    <tr key={t.name} style={{ background: t.name === activeTech ? (darkMode ? '#1e3a5f22' : '#eff6ff') : 'transparent' }}>
                      <td><span className="rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span></td>
                      <td><strong>{t.name}</strong></td>
                      <td>{t.total}</td>
                      <td>{t.resolved}</td>
                      <td>{formatHours(t.avgResTime)}</td>
                      <td>%{t.resRate.toFixed(0)}</td>
                      <td>%{t.slaRate.toFixed(0)}</td>
                      <td>
                        <div className="perf-bar">
                          <div className="fill" style={{ width: `${score}%`, background: barColor }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default TechPerformancePage;
