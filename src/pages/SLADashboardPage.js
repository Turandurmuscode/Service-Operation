import { useState, useMemo } from 'react';
import './SLADashboardPage.css';

const SLA_TARGETS = {
  critical: { response: 1, resolution: 4, label: 'Kritik' },
  high: { response: 2, resolution: 8, label: 'Yüksek' },
  medium: { response: 4, resolution: 24, label: 'Orta' },
  low: { response: 8, resolution: 48, label: 'Düşük' },
};

const SLADashboardPage = ({ incidents, clients, darkMode }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');

  // Filter incidents by period
  const filteredIncidents = useMemo(() => {
    let list = incidents;
    if (filterPeriod !== 'all') {
      const cutoff = new Date();
      if (filterPeriod === '7d') cutoff.setDate(cutoff.getDate() - 7);
      else if (filterPeriod === '30d') cutoff.setDate(cutoff.getDate() - 30);
      else if (filterPeriod === '90d') cutoff.setDate(cutoff.getDate() - 90);
      list = list.filter(i => new Date(i.createdAt) >= cutoff);
    }
    if (filterPriority !== 'all') {
      list = list.filter(i => i.priority === filterPriority);
    }
    return list;
  }, [incidents, filterPeriod, filterPriority]);

  // Compute SLA metrics
  const slaMetrics = useMemo(() => {
    const resolved = filteredIncidents.filter(i => i.status === 'resolved' || i.status === 'closed');
    const all = filteredIncidents;

    let withinSLA = 0;
    let violations = [];
    let totalResTime = 0;
    let resCount = 0;

    resolved.forEach(inc => {
      const target = SLA_TARGETS[inc.priority] || SLA_TARGETS.medium;
      const created = new Date(inc.createdAt);
      const resolvedAt = new Date(inc.resolvedAt || inc.updatedAt || Date.now());
      const hours = (resolvedAt - created) / (1000 * 60 * 60);
      totalResTime += hours;
      resCount++;

      if (hours <= target.resolution) {
        withinSLA++;
      } else {
        violations.push({
          ...inc,
          exceededBy: hours - target.resolution,
          actualHours: hours,
          targetHours: target.resolution,
        });
      }
    });

    // Active incidents at risk
    const active = all.filter(i => i.status === 'new' || i.status === 'in_progress' || i.status === 'on_hold');
    const atRisk = active.filter(inc => {
      const target = SLA_TARGETS[inc.priority] || SLA_TARGETS.medium;
      const hours = (Date.now() - new Date(inc.createdAt)) / (1000 * 60 * 60);
      return hours > target.resolution * 0.75; // 75% of SLA target elapsed
    });

    const complianceRate = resolved.length > 0 ? (withinSLA / resolved.length) * 100 : 100;
    const avgResTime = resCount > 0 ? totalResTime / resCount : 0;

    return { complianceRate, withinSLA, violations: violations.sort((a, b) => b.exceededBy - a.exceededBy), atRisk, resolved: resolved.length, total: all.length, avgResTime, active: active.length };
  }, [filteredIncidents]);

  // Per-priority compliance
  const priorityCompliance = useMemo(() => {
    return Object.entries(SLA_TARGETS).map(([key, target]) => {
      const pIncidents = filteredIncidents.filter(i => i.priority === key);
      const resolved = pIncidents.filter(i => i.status === 'resolved' || i.status === 'closed');
      let within = 0;
      resolved.forEach(inc => {
        const hours = (new Date(inc.resolvedAt || inc.updatedAt || Date.now()) - new Date(inc.createdAt)) / (1000 * 60 * 60);
        if (hours <= target.resolution) within++;
      });
      const rate = resolved.length > 0 ? (within / resolved.length) * 100 : 100;
      return { priority: key, label: target.label, target, total: pIncidents.length, resolved: resolved.length, within, rate };
    });
  }, [filteredIncidents]);

  // Per-client compliance
  const clientCompliance = useMemo(() => {
    const map = {};
    filteredIncidents.forEach(inc => {
      const client = clients.find(c => c.id === inc.clientId);
      const name = client?.name || 'Bilinmeyen';
      if (!map[name]) map[name] = { name, tier: client?.slaTier || 'bronze', total: 0, resolved: 0, within: 0 };
      map[name].total++;
      if (inc.status === 'resolved' || inc.status === 'closed') {
        map[name].resolved++;
        const target = SLA_TARGETS[inc.priority] || SLA_TARGETS.medium;
        const hours = (new Date(inc.resolvedAt || inc.updatedAt || Date.now()) - new Date(inc.createdAt)) / (1000 * 60 * 60);
        if (hours <= target.resolution) map[name].within++;
      }
    });
    return Object.values(map)
      .map(c => ({ ...c, rate: c.resolved > 0 ? (c.within / c.resolved) * 100 : 100 }))
      .sort((a, b) => a.rate - b.rate);
  }, [filteredIncidents, clients]);

  // Monthly trend
  const monthlyTrend = useMemo(() => {
    const map = {};
    incidents.forEach(inc => {
      if (inc.status !== 'resolved' && inc.status !== 'closed') return;
      const d = new Date(inc.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map[key]) map[key] = { month: key, total: 0, within: 0 };
      map[key].total++;
      const target = SLA_TARGETS[inc.priority] || SLA_TARGETS.medium;
      const hours = (new Date(inc.resolvedAt || inc.updatedAt || Date.now()) - new Date(inc.createdAt)) / (1000 * 60 * 60);
      if (hours <= target.resolution) map[key].within++;
    });
    return Object.values(map)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
      .map(m => ({ ...m, rate: m.total > 0 ? ((m.within / m.total) * 100).toFixed(0) : 100 }));
  }, [incidents]);

  const formatHours = (h) => {
    if (h < 1) return `${Math.round(h * 60)} dk`;
    if (h < 24) return `${h.toFixed(1)} saat`;
    return `${(h / 24).toFixed(1)} gün`;
  };

  const getComplianceColor = (rate) => {
    if (rate >= 90) return '#10b981';
    if (rate >= 70) return '#f59e0b';
    return '#ef4444';
  };

  // SVG ring
  const renderRing = (percentage, label, color) => {
    const radius = 65;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    return (
      <div className="compliance-ring">
        <svg width="160" height="160">
          <circle cx="80" cy="80" r={radius} fill="none" stroke={darkMode ? '#334155' : '#e2e8f0'} strokeWidth="12" />
          <circle cx="80" cy="80" r={radius} fill="none" stroke={color} strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="ring-label">
          <span className="ring-value" style={{ color }}>%{percentage.toFixed(0)}</span>
          <span className="ring-text">{label}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`sla-dash-page ${darkMode ? 'dark' : ''}`}>
      <h2>🎯 SLA Uyumluluk Paneli</h2>
      <p className="page-subtitle">Servis seviye anlaşması performansını izleyin ve ihlalleri tespit edin</p>

      {/* KPIs */}
      <div className="sla-kpis">
        <div className="sla-kpi">
          <div className="kpi-icon">🎯</div>
          <div className={`kpi-value ${slaMetrics.complianceRate >= 90 ? 'green' : slaMetrics.complianceRate >= 70 ? 'orange' : 'red'}`}>
            %{slaMetrics.complianceRate.toFixed(1)}
          </div>
          <div className="kpi-label">SLA Uyumluluk</div>
        </div>
        <div className="sla-kpi">
          <div className="kpi-icon">✅</div>
          <div className="kpi-value green">{slaMetrics.withinSLA}</div>
          <div className="kpi-label">SLA İçinde</div>
        </div>
        <div className="sla-kpi">
          <div className="kpi-icon">❌</div>
          <div className="kpi-value red">{slaMetrics.violations.length}</div>
          <div className="kpi-label">SLA İhlali</div>
        </div>
        <div className="sla-kpi">
          <div className="kpi-icon">⚠️</div>
          <div className={`kpi-value ${slaMetrics.atRisk.length > 0 ? 'orange' : 'green'}`}>{slaMetrics.atRisk.length}</div>
          <div className="kpi-label">Risk Altında</div>
        </div>
        <div className="sla-kpi">
          <div className="kpi-icon">⏱️</div>
          <div className="kpi-value blue">{formatHours(slaMetrics.avgResTime)}</div>
          <div className="kpi-label">Ort. Çözüm Süresi</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sla-tabs">
        {[
          { id: 'overview', label: '📊 Genel Bakış' },
          { id: 'violations', label: `⚠️ İhlaller (${slaMetrics.violations.length})` },
          { id: 'clients', label: '🏢 Müşteri Bazlı' },
          { id: 'trends', label: '📈 Trendler' },
        ].map(tab => (
          <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="sla-filters">
        <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
          <option value="all">Tüm Zamanlar</option>
          <option value="7d">Son 7 Gün</option>
          <option value="30d">Son 30 Gün</option>
          <option value="90d">Son 90 Gün</option>
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="all">Tüm Öncelikler</option>
          <option value="critical">Kritik</option>
          <option value="high">Yüksek</option>
          <option value="medium">Orta</option>
          <option value="low">Düşük</option>
        </select>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Compliance rings */}
          <div className="compliance-ring-container">
            {renderRing(slaMetrics.complianceRate, 'Genel Uyumluluk', getComplianceColor(slaMetrics.complianceRate))}
            {priorityCompliance.map(p => (
              renderRing(p.rate, p.label, getComplianceColor(p.rate))
            ))}
          </div>

          {/* SLA Target cards */}
          <div className="sla-targets">
            {priorityCompliance.map(p => (
              <div key={p.priority} className={`sla-target-card ${p.priority}`}>
                <h4>{p.label} Öncelik</h4>
                <div className="target-row">
                  <span>Yanıt hedefi:</span>
                  <span className="target-value">{p.target.response} saat</span>
                </div>
                <div className="target-row">
                  <span>Çözüm hedefi:</span>
                  <span className="target-value">{p.target.resolution} saat</span>
                </div>
                <div className="target-row">
                  <span>Toplam arıza:</span>
                  <span className="target-value">{p.total}</span>
                </div>
                <div className="target-row">
                  <span>SLA içinde:</span>
                  <span className="target-value" style={{ color: getComplianceColor(p.rate) }}>{p.within}/{p.resolved}</span>
                </div>
                <div className="target-row">
                  <span>Uyumluluk:</span>
                  <span className="target-value" style={{ color: getComplianceColor(p.rate) }}>%{p.rate.toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* At-risk incidents */}
          {slaMetrics.atRisk.length > 0 && (
            <div className="sla-violations">
              <h3>⚠️ Risk Altındaki Arızalar ({slaMetrics.atRisk.length})</h3>
              {slaMetrics.atRisk.slice(0, 5).map(inc => {
                const target = SLA_TARGETS[inc.priority] || SLA_TARGETS.medium;
                const elapsed = (Date.now() - new Date(inc.createdAt)) / (1000 * 60 * 60);
                const pct = (elapsed / target.resolution) * 100;
                return (
                  <div key={inc.id} className="violation-item">
                    <div className="violation-icon">⏳</div>
                    <div className="violation-details">
                      <h4>#{inc.id} - {inc.title}</h4>
                      <p>{inc.priority} öncelik | Hedef: {target.resolution} saat | Geçen: {formatHours(elapsed)} (%{pct.toFixed(0)})</p>
                    </div>
                    <div className="violation-time">
                      <div style={{ color: pct >= 100 ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>%{pct.toFixed(0)}</div>
                      <div className="target">Kapasite</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'violations' && (
        <div className="sla-violations">
          <h3>❌ SLA İhlalleri</h3>
          {slaMetrics.violations.length > 0 ? (
            slaMetrics.violations.map(v => {
              const client = clients.find(c => c.id === v.clientId);
              return (
                <div key={v.id} className="violation-item">
                  <div className="violation-icon">🚨</div>
                  <div className="violation-details">
                    <h4>#{v.id} - {v.title}</h4>
                    <p>
                      Müşteri: {client?.name || '-'} | Öncelik: {v.priority} | 
                      Atanan: {v.assignedTo || '-'}
                    </p>
                  </div>
                  <div className="violation-time">
                    <div className="exceeded">+{formatHours(v.exceededBy)}</div>
                    <div className="target">Hedef: {v.targetHours}sa → Gerçek: {formatHours(v.actualHours)}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state"><div className="icon">✅</div><p>SLA ihlali bulunmuyor!</p></div>
          )}
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="sla-client-table">
          <h3>🏢 Müşteri Bazlı SLA Performansı</h3>
          <table>
            <thead>
              <tr>
                <th>Müşteri</th>
                <th>SLA Katmanı</th>
                <th>Toplam</th>
                <th>Çözülen</th>
                <th>SLA İçinde</th>
                <th>Uyumluluk</th>
                <th>Performans</th>
              </tr>
            </thead>
            <tbody>
              {clientCompliance.map(c => (
                <tr key={c.name}>
                  <td><strong>{c.name}</strong></td>
                  <td><span className={`sla-tier-badge ${c.tier}`}>{c.tier === 'gold' ? '🥇 Gold' : c.tier === 'silver' ? '🥈 Silver' : '🥉 Bronze'}</span></td>
                  <td>{c.total}</td>
                  <td>{c.resolved}</td>
                  <td>{c.within}</td>
                  <td style={{ color: getComplianceColor(c.rate), fontWeight: 700 }}>%{c.rate.toFixed(0)}</td>
                  <td>
                    <div className="compliance-bar">
                      <div className="fill" style={{ width: `${c.rate}%`, background: getComplianceColor(c.rate) }} />
                    </div>
                  </td>
                </tr>
              ))}
              {clientCompliance.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: 20 }}>Veri bulunamadı</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="sla-trend-section">
          <h3>📈 Aylık SLA Uyumluluk Trendi</h3>
          {monthlyTrend.length > 0 ? (
            <div className="sla-trend-bars">
              {monthlyTrend.map(m => {
                const rate = parseInt(m.rate);
                const color = getComplianceColor(rate);
                return (
                  <div key={m.month} className="sla-trend-bar">
                    <div className="bar-val" style={{ color }}>%{m.rate}</div>
                    <div className="bar" style={{ height: `${rate}%`, background: color }} title={`${m.month}: %${m.rate} (${m.within}/${m.total})`} />
                    <div className="bar-month">{m.month.slice(5)}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state"><div className="icon">📈</div><p>Trend verisi için yeterli data bulunamadı</p></div>
          )}
        </div>
      )}
    </div>
  );
};

export default SLADashboardPage;
