import React, { useEffect, useState } from 'react';
import './SLAMonitor.css';
import { getSLALimit, getSLAWarningThreshold } from '../utils/slaTiers';

const loadJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
};

function SLAMonitor({ incidents }) {
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    const check = () => {
      const now     = new Date();
      const clients = loadJSON('clients', []);
      const w = [];

      incidents.forEach(inc => {
        if (inc.status === 'resolved' || inc.status === 'cancelled') return;
        const elapsed    = Math.floor((now - new Date(inc.startTime)) / 60000);
        const sla        = getSLALimit(inc, clients);
        const warnAt     = getSLAWarningThreshold(inc, clients); // % threshold
        const remaining  = sla - elapsed;
        const pct        = (elapsed / sla) * 100;

        if (remaining <= 0) {
          w.push({ ...inc, slaStatus: 'violated', msg: `SLA ihlali — ${Math.abs(remaining)}dk geçti` });
        } else if (pct >= warnAt) {
          w.push({ ...inc, slaStatus: 'warning', msg: `${remaining}dk kaldı (%${Math.round(pct)} doldu)` });
        }
      });

      setWarnings(w);
    };

    check();
    const t = setInterval(check, 60000);
    return () => clearInterval(t);
  }, [incidents]);

  if (warnings.length === 0) return null;

  return (
    <div className="sla-monitor">
      <div className="sla-monitor-inner">
        <div className="sla-header">
          <h3>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="6"/>
              <path d="M8 5v3l2 2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            SLA Uyarıları
          </h3>
          <span className="sla-count">{warnings.length}</span>
        </div>
        <div className="sla-warnings">
          {warnings.map(w => (
            <div key={w.id} className={`sla-warning ${w.slaStatus}`}>
              <div className="sla-warning-header">
                <span className={`sla-priority ${w.priority}`}></span>
                <span className="sla-description">{w.description}</span>
              </div>
              <div className="sla-warning-message">{w.msg}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SLAMonitor;