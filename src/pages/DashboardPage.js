import React from 'react';
import DashboardWidgets from '../components/DashboardWidgets';
import SLAMonitor from '../components/SLAMonitor';
import StatCards from '../components/StatCards';
import HeroCard from '../components/HeroCard';
import Icon from '../components/Icon';
import PageShell from '../components/PageShell';

function ActivityFeed({ activities, incidents, clients }) {
  const formatTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000)     return 'Az önce';
    if (diff < 3600000)   return `${Math.floor(diff / 60000)} dk önce`;
    if (diff < 86400000)  return `${Math.floor(diff / 3600000)} sa önce`;
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
  };

  const getIcon = (type) => ({
    incident_created:  { icon: 'clipboard', color: '#3b82f6' },
    incident_resolved: { icon: 'save', color: '#10b981' },
    client_added:      { icon: 'user', color: '#a855f7' },
    sla_violation:     { icon: 'alert', color: '#ef4444' },
  }[type] || { icon: 'clipboard', color: '#94a3b8' });

  const displayed = [...(activities || [])].slice(0, 20);

  return (
    <div className="card" style={{ margin: 0, height: '100%' }}>
      <h2 style={{ marginBottom: '16px' }}><Icon name="clock" size={16} style={{ marginRight: 8 }} /> Aktivite Akışı</h2>
      {displayed.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
          Henüz aktivite yok.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {displayed.map((act, idx) => {
            const { icon, color } = getIcon(act.type);
            return (
              <div key={idx} style={{
                display: 'flex', gap: '10px', padding: '9px 0',
                borderBottom: idx < displayed.length - 1 ? '1px solid var(--border)' : 'none',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                  background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', marginTop: '1px', color,
                }}>
                  <Icon name={icon} size={14} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12.5px', lineHeight: '1.4', color: 'var(--text-primary)' }}>
                    {act.message}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                    {formatTime(act.timestamp)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DashboardPage({ incidents, clients, activities, onNavigate }) {
  const todayLabel = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="page-content">
      <PageShell
        title="Operasyon Kontrol Merkezi"
        subtitle="Canlı operasyon görünümü, SLA takibi ve ekip performans özeti"
        icon="chart"
        actions={<span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>{todayLabel}</span>}
      >
      <HeroCard incidents={incidents} clients={clients} onNavigate={onNavigate} />
      <DashboardWidgets incidents={incidents} clients={clients} onNavigate={onNavigate} />
      <SLAMonitor incidents={incidents} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', padding: '0 32px 32px', maxWidth: '1600px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <StatCards incidents={incidents} />
        </div>
        <ActivityFeed activities={activities} incidents={incidents} clients={clients} />
      </div>
      </PageShell>
    </div>
  );
}

export default DashboardPage;