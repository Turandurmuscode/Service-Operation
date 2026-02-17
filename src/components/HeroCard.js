import React, { useState, useEffect } from 'react';
import './HeroCard.css';

const greetings = {
  morning:   { text: 'Günaydın',   sub: 'Bugün nasıl başladı?' },
  afternoon: { text: 'İyi günler', sub: 'Öğleden sonra nasıl gidiyor?' },
  evening:   { text: 'İyi akşamlar', sub: 'Günün özeti:' },
  night:     { text: 'İyi geceler', sub: 'Bugün ne oldu?' },
};

function HeroCard({ incidents, clients, onNavigate }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hour = time.getHours();
  const greeting =
    hour < 12 ? greetings.morning :
    hour < 17 ? greetings.afternoon :
    hour < 21 ? greetings.evening : greetings.night;

  const timeStr = time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });

  // Bugünkü istatistikler
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const active     = incidents.filter(i => i.status !== 'resolved').length;
  const critical   = incidents.filter(i => i.status !== 'resolved' && i.priority === 'critical').length;
  const todaySolved = incidents.filter(i => {
    if (i.status !== 'resolved' || !i.endTime) return false;
    return new Date(i.endTime) >= today;
  }).length;
  const todayNew = incidents.filter(i => new Date(i.startTime) >= today).length;

  // SLA durumu
  const now = new Date();
  const slaLimit = { critical: 120, medium: 480, low: 1440 };
  const slaWarnings = incidents.filter(i => {
    if (i.status === 'resolved') return false;
    const elapsed = Math.floor((now - new Date(i.startTime)) / 60000);
    return elapsed > (slaLimit[i.priority] || 1440) * 0.7;
  }).length;

  // Sistem sağlığı skoru (0-100)
  const total = incidents.length || 1;
  const resolved = incidents.filter(i => i.status === 'resolved').length;
  const healthScore = Math.round(
    ((resolved / total) * 60) +
    (critical === 0 ? 25 : Math.max(0, 25 - critical * 5)) +
    (slaWarnings === 0 ? 15 : Math.max(0, 15 - slaWarnings * 3))
  );

  const healthColor =
    healthScore >= 80 ? 'var(--success)' :
    healthScore >= 50 ? 'var(--warning)' : 'var(--danger)';

  const healthLabel =
    healthScore >= 80 ? 'Sağlıklı' :
    healthScore >= 50 ? 'Dikkat' : 'Kritik';

  return (
    <div className="hero-card">
      {/* Sol — selamlama + saat */}
      <div className="hero-left">
        <div className="hero-greeting">
          <span className="hero-greeting-text">{greeting.text}</span>
          <span className="hero-greeting-sub">{greeting.sub}</span>
        </div>

        <div className="hero-clock">
          <span className="hero-time">{timeStr}</span>
          <span className="hero-date">{dateStr}</span>
        </div>

        {/* Sağlık skoru */}
        <div className="hero-health">
          <div className="health-bar-wrapper">
            <div className="health-bar-track">
              <div
                className="health-bar-fill"
                style={{ width: `${healthScore}%`, background: healthColor }}
              />
            </div>
            <span className="health-label" style={{ color: healthColor }}>
              {healthLabel}
            </span>
          </div>
          <span className="health-score" style={{ color: healthColor }}>
            {healthScore}/100
          </span>
        </div>
      </div>

      {/* Orta — bugünkü istatistikler */}
      <div className="hero-stats">
        <div className="hero-stat" onClick={() => onNavigate('incidents')}>
          <div className="hero-stat-value danger">{active}</div>
          <div className="hero-stat-label">Aktif Arıza</div>
        </div>
        <div className="hero-stat-divider" />
        <div className="hero-stat" onClick={() => onNavigate('incidents')}>
          <div className="hero-stat-value critical">{critical}</div>
          <div className="hero-stat-label">Kritik</div>
        </div>
        <div className="hero-stat-divider" />
        <div className="hero-stat">
          <div className="hero-stat-value success">{todaySolved}</div>
          <div className="hero-stat-label">Bugün Çözüldü</div>
        </div>
        <div className="hero-stat-divider" />
        <div className="hero-stat">
          <div className="hero-stat-value info">{todayNew}</div>
          <div className="hero-stat-label">Bugün Açıldı</div>
        </div>
      </div>

      {/* Sağ — quick actions */}
      <div className="hero-actions">
        <div className="hero-actions-title">Hızlı İşlem</div>
        <button className="hero-action-btn primary" onClick={() => onNavigate('incidents')}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 2L14 13H2L8 2Z"/>
            <path d="M8 6v4M8 11.5v.5" strokeLinecap="round"/>
          </svg>
          Yeni Arıza
        </button>
        <button className="hero-action-btn" onClick={() => onNavigate('clients')}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="5" r="2.5"/>
            <path d="M1.5 13c0-3 2.5-5 5.5-5"/>
            <path d="M12 9v4M10 11h4" strokeLinecap="round"/>
          </svg>
          Yeni Müşteri
        </button>
        <button className="hero-action-btn" onClick={() => onNavigate('kanban')}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="2" width="4" height="12" rx="1"/>
            <rect x="6" y="2" width="4" height="8" rx="1"/>
            <rect x="11" y="2" width="4" height="10" rx="1"/>
          </svg>
          Kanban Board
        </button>

        {slaWarnings > 0 && (
          <div className="hero-sla-alert">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="6"/>
              <path d="M8 5v3l2 2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {slaWarnings} SLA uyarısı var
          </div>
        )}
      </div>
    </div>
  );
}

export default HeroCard;