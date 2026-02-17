import React from 'react';
import './DashboardWidgets.css';

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="8" cy="8" r="6"/>
    <path d="M5.5 8l2 2 3-3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 2L14 13H2L8 2Z"/><path d="M8 6v4M8 11.5v.5" strokeLinecap="round"/>
  </svg>
);
const CrownIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 11h12M3 11L2 5l4 3 2-4 2 4 4-3-1 6H3Z" strokeLinejoin="round"/>
  </svg>
);
const ZapIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 2L4 9h5l-2 5 7-7H9l2-5z" strokeLinejoin="round"/>
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="6"/>
    <path d="M8 5v3l2 2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ChartIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 12l3-4 3 2 3-5 3 3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function DashboardWidgets({ incidents, clients }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayResolved = incidents.filter(inc => {
    if (inc.status !== 'resolved' || !inc.endTime) return false;
    return new Date(inc.endTime) >= today;
  }).length;

  const clientMap = {};
  incidents.forEach(inc => {
    clientMap[inc.clientId] = (clientMap[inc.clientId] || 0) + 1;
  });
  const topId = Object.keys(clientMap).sort((a,b) => clientMap[b]-clientMap[a])[0];
  const topClient = clients.find(c => c.id === parseInt(topId));

  const resolved = incidents.filter(inc => inc.duration);
  const fastest = resolved.reduce((f,i) => !f || i.duration < f.duration ? i : f, null);
  const pendingCritical = incidents.filter(i => i.status !== 'resolved' && i.priority === 'critical').length;
  const slaViolations = resolved.filter(inc => {
    const lim = { critical: 120, medium: 480, low: 1440 };
    return inc.duration > (lim[inc.priority] || 1440);
  }).length;
  const avg = resolved.length > 0
    ? Math.round(resolved.reduce((s,i) => s + i.duration, 0) / resolved.length)
    : 0;

  const widgets = [
    { type: 'success', icon: <CheckIcon/>, title: 'Bugün Çözülen', value: todayResolved, sub: 'arıza' },
    { type: 'danger',  icon: <AlertIcon/>, title: 'Kritik Bekleyen', value: pendingCritical, sub: 'aktif' },
    { type: 'accent',  icon: <CrownIcon/>, title: 'En Çok Arıza', value: topClient?.name || '—', sub: `${clientMap[topId]||0} kayıt` },
    { type: 'info',    icon: <ZapIcon/>,   title: 'En Hızlı Çözüm', value: fastest ? `${fastest.duration}dk` : '—', sub: 'süre' },
    { type: 'danger',  icon: <ClockIcon/>, title: 'SLA İhlali', value: slaViolations, sub: 'toplam' },
    { type: 'success', icon: <ChartIcon/>, title: 'Ort. Çözüm', value: avg ? `${avg}dk` : '—', sub: 'süre' },
  ];

  return (
    <div className="dashboard-widgets">
      {widgets.map((w, i) => (
        <div key={i} className={`widget widget-${w.type}`}>
          <div className="widget-icon">{w.icon}</div>
          <div>
            <div className="widget-title">{w.title}</div>
            <div className="widget-value">{w.value}</div>
            <div className="widget-subtitle">{w.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardWidgets;