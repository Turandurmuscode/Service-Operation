import React from 'react';
import './ActivityLog.css';

const iconMap = {
  incident_created: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2L14 13H2L8 2Z"/><path d="M8 7v3M8 11.5v.5" strokeLinecap="round"/>
    </svg>
  ),
  incident_resolved: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6"/><path d="M5.5 8l2 2 3-3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  client_added: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="5" r="2.5"/><path d="M1.5 13c0-3 2.5-5 5.5-5"/><path d="M12 9v4M10 11h4" strokeLinecap="round"/>
    </svg>
  ),
  sla_violation: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  default: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 8h6M8 5v6" strokeLinecap="round"/>
    </svg>
  )
};

function ActivityLog({ activities }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);
    if (diff < 1) return 'Az önce';
    if (diff < 60) return `${diff}dk önce`;
    if (diff < 1440) return `${Math.floor(diff / 60)}sa önce`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  const sorted = [...activities]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 15);

  return (
    <div className="card">
      <h2>Son İşlemler</h2>
      {sorted.length === 0 ? (
        <div className="activity-empty">Henüz işlem kaydı yok.</div>
      ) : (
        <div className="activity-list">
          {sorted.map((activity, i) => (
            <div key={i} className="activity-item">
              <div className="activity-icon">
                {iconMap[activity.type] || iconMap.default}
              </div>
              <div className="activity-content">
                <div className="activity-message">{activity.message}</div>
                <div className="activity-time">{formatTime(activity.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityLog;