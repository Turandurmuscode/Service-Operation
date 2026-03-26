import React, { useState } from 'react';
import ReportGenerator from '../components/ReportGenerator';
import DataExport from '../components/DataExport';
import DataManagement from '../components/DataManagement';
import DateRangeFilter from '../components/DateRangeFilter';
import Icon from '../components/Icon';
import PageShell from '../components/PageShell';
import MetricStrip from '../components/MetricStrip';
import './ReportsPage.css';

function ReportsPage({ clients, incidents, setClients, setIncidents, setActivities, showToast }) {
  const [dateFilter, setDateFilter] = useState(null); // null = tümü, Date = başlangıç tarihi

  const filteredIncidents = dateFilter
    ? incidents.filter(inc => new Date(inc.startTime) >= dateFilter)
    : incidents;

  const resolved  = filteredIncidents.filter(i => i.status === 'resolved');
  const active    = filteredIncidents.filter(i => i.status !== 'resolved' && i.status !== 'cancelled');
  const avgDur    = resolved.length
    ? Math.round(resolved.reduce((s, i) => s + (i.duration || 0), 0) / resolved.length)
    : null;
  const slaViol   = resolved.filter(i => {
    const lim = { critical: 120, medium: 480, low: 1440 };
    return (i.duration || 0) > (lim[i.priority] || 1440);
  }).length;
  const slaRate   = resolved.length ? Math.round(((resolved.length - slaViol) / resolved.length) * 100) : null;

  const metricItems = [
    { label: 'Toplam Arıza', value: filteredIncidents.length, meta: 'Filtreye göre' },
    { label: 'Aktif', value: active.length, valueColor: active.length > 0 ? '#f59e0b' : 'var(--text-primary)' },
    { label: 'Çözülen', value: resolved.length, valueColor: '#10b981' },
    { label: 'Ort. Çözüm', value: avgDur ? `${avgDur} dk` : '—', meta: 'Resolved kayıtlar' },
    { label: 'SLA Uyum', value: slaRate !== null ? `%${slaRate}` : '—', valueColor: slaRate !== null && slaRate < 80 ? '#ef4444' : '#10b981' },
    { label: 'SLA İhlali', value: slaViol, valueColor: slaViol > 0 ? '#ef4444' : 'var(--text-primary)' },
  ];

  return (
    <div className="page-content reports-page">
      <PageShell
        title="Raporlar ve Veri Yönetimi"
        subtitle="Operasyon verilerini analiz edin, dışa aktarın ve merkezi olarak yönetin"
        icon="clipboard"
      >

      <div className="section-card">
        <div className="reports-filter-head">
          <h2 className="section-card-title"><Icon name="calendar" size={16} /> Tarih Aralığı</h2>
          {dateFilter && (
            <span className="reports-filter-meta">
              {new Date(dateFilter).toLocaleDateString('tr-TR')} tarihinden itibaren · {filteredIncidents.length} kayıt
            </span>
          )}
        </div>
        <DateRangeFilter onFilterChange={setDateFilter} />
      </div>

      <MetricStrip items={metricItems} />

      <div className="reports-grid-two">
        <div className="card">
          <h2><Icon name="chart" size={16} /> Kategori Dağılımı</h2>
          {[
            { key: 'software', label: 'Yazılım',  color: '#3b82f6', icon: 'laptop' },
            { key: 'hardware', label: 'Donanım', color: '#f59e0b', icon: 'desktop' },
            { key: 'network',  label: 'Network',  color: '#10b981', icon: 'network' },
            { key: 'other',    label: 'Diğer',    color: '#a855f7', icon: 'box' },
          ].map(({ key, label, color, icon }) => {
            const count = filteredIncidents.filter(i => i.category === key).length;
            const pct   = filteredIncidents.length ? Math.round((count / filteredIncidents.length) * 100) : 0;
            return (
              <div key={key} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name={icon} size={14} />{label}</span>
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>{count} <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>({pct}%)</span></span>
                </div>
                <div style={{ height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px' }}>
                  <div style={{ height: '100%', borderRadius: '2px', width: `${pct}%`, background: color, transition: 'width 0.3s' }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <h2><Icon name="alert" size={16} /> Öncelik Dağılımı</h2>
          {[
            { key: 'critical', label: 'Kritik', color: '#ef4444' },
            { key: 'medium',   label: 'Orta',   color: '#f59e0b' },
            { key: 'low',      label: 'Düşük',  color: '#10b981' },
          ].map(({ key, label, color }) => {
            const count = filteredIncidents.filter(i => i.priority === key).length;
            const pct   = filteredIncidents.length ? Math.round((count / filteredIncidents.length) * 100) : 0;
            return (
              <div key={key} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px' }}>{label}</span>
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>{count} <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>({pct}%)</span></span>
                </div>
                <div style={{ height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px' }}>
                  <div style={{ height: '100%', borderRadius: '2px', width: `${pct}%`, background: color, transition: 'width 0.3s' }} />
                </div>
              </div>
            );
          })}

          {/* En çok arıza veren müşteriler */}
          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              En Çok Arıza
            </div>
            {(() => {
              const map = {};
              filteredIncidents.forEach(i => { map[i.clientId] = (map[i.clientId] || 0) + 1; });
              return Object.entries(map)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([id, count]) => {
                  const client = clients.find(c => c.id === parseInt(id));
                  return (
                    <div key={id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                      <span>{client?.name || 'Bilinmiyor'}</span>
                      <span style={{ fontWeight: '700' }}>{count}</span>
                    </div>
                  );
                });
            })()}
          </div>
        </div>
      </div>

      <div className="reports-grid">
        <ReportGenerator incidents={filteredIncidents} clients={clients} />
        <div className="card">
          <h2><Icon name="grid" size={16} /> Veri Yönetimi</h2>
          <DataExport incidents={filteredIncidents} clients={clients} setClients={setClients} showToast={showToast} />
          <hr style={{ margin: '14px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
          <DataManagement
            clients={clients} incidents={incidents}
            setClients={setClients} setIncidents={setIncidents}
            setActivities={setActivities} showToast={showToast}
          />
        </div>
      </div>
      </PageShell>
    </div>
  );
}

export default ReportsPage;