import React, { useState, useEffect } from 'react';
import './DashboardWidgets.css';

const loadJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
};

// ── İkonlar ──────────────────────────────────────────
const Icon = ({ d, viewBox = "0 0 16 16" }) => (
  <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);

function DashboardWidgets({ incidents, clients, onNavigate }) {
  const [technicians, setTechnicians] = useState([]);

  useEffect(() => {
    setTechnicians(loadJSON('technicians', []));
  }, []);

  const now   = new Date();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const active   = incidents.filter(i => i.status !== 'resolved' && i.status !== 'cancelled');
  const resolved = incidents.filter(i => i.status === 'resolved' && i.duration);

  const todayResolved = incidents.filter(i =>
    i.status === 'resolved' && i.endTime && new Date(i.endTime) >= today
  ).length;

  const critical = active.filter(i => i.priority === 'critical').length;

  const overdue = active.filter(i =>
    i.deadline && new Date(i.deadline) < now
  );

  const dueSoon = active.filter(i => {
    if (!i.deadline) return false;
    const diff = new Date(i.deadline) - now;
    return diff > 0 && diff < 3 * 60 * 60 * 1000; // 3 saat içinde
  });

  const avgResolution = resolved.length
    ? Math.round(resolved.reduce((s, i) => s + i.duration, 0) / resolved.length)
    : null;

  const slaViolations = resolved.filter(i => {
    const lim = { critical: 120, medium: 480, low: 1440 };
    return i.duration > (lim[i.priority] || 1440);
  }).length;

  const slaRate = resolved.length
    ? Math.round(((resolved.length - slaViolations) / resolved.length) * 100)
    : null;

  // Teknisyen iş yükü
  const techWorkload = technicians.map(tech => ({
    ...tech,
    active: active.filter(i => i.technicianId === tech.id).length,
    overdue: overdue.filter(i => i.technicianId === tech.id).length,
  })).sort((a, b) => b.active - a.active);

  // Kategori dağılımı
  const categories = { software: 0, hardware: 0, network: 0, other: 0 };
  active.forEach(i => { if (categories[i.category] !== undefined) categories[i.category]++; });
  const catMax = Math.max(...Object.values(categories), 1);
  const catLabels = { software: 'Yazılım', hardware: 'Donanım', network: 'Network', other: 'Diğer' };
  const catColors = { software: '#3b82f6', hardware: '#f59e0b', network: '#10b981', other: '#a855f7' };

  return (
    <div style={{ padding: '0 32px 24px', maxWidth: '1600px' }}>

      {/* ── KRİTİK UYARI BANDI ── */}
      {(overdue.length > 0 || critical > 0) && (
        <div style={{
          display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap',
        }}>
          {overdue.length > 0 && (
            <div style={{
              flex: 1, minWidth: '260px', padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
            }} onClick={() => onNavigate && onNavigate('incidents')}>
              <span style={{ color: '#ef4444' }}><Icon d="M8 2L14 14H2L8 2ZM8 6v4M8 12h.01" /></span>
              <div>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#ef4444' }}>
                  {overdue.length} arıza deadline'ı geçti
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Hemen müdahale gerekiyor → Arızalara git
                </div>
              </div>
            </div>
          )}
          {dueSoon.length > 0 && (
            <div style={{
              flex: 1, minWidth: '260px', padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <span style={{ color: '#f59e0b' }}><Icon d="M8 2a6 6 0 1 1 0 12A6 6 0 0 1 8 2Zm0 2v4l2 1" /></span>
              <div>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#f59e0b' }}>
                  {dueSoon.length} arıza 3 saat içinde bitiyor
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Yaklaşan deadline'lar</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ANA METRİK KARTLARI ── */}
      <div className="dashboard-widgets" style={{ padding: 0, marginBottom: '20px' }}>

        <div className="widget widget-info">
          <div className="widget-icon"><Icon d="M8 2L14 6v4L8 14 2 10V6L8 2ZM8 6v4M8 11v1" /></div>
          <div>
            <div className="widget-title">Aktif Arıza</div>
            <div className="widget-value">{active.length}</div>
            <div className="widget-subtitle">{critical > 0 ? `${critical} kritik` : 'tümü normal'}</div>
          </div>
        </div>

        <div className="widget widget-success">
          <div className="widget-icon"><Icon d="M5.5 8l2 2 3-3" /></div>
          <div>
            <div className="widget-title">Bugün Çözülen</div>
            <div className="widget-value">{todayResolved}</div>
            <div className="widget-subtitle">toplam {resolved.length} çözüldü</div>
          </div>
        </div>

        <div className={`widget widget-${overdue.length > 0 ? 'danger' : 'success'}`}>
          <div className="widget-icon"><Icon d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 5v3l2 2" /></div>
          <div>
            <div className="widget-title">Gecikmiş</div>
            <div className="widget-value">{overdue.length}</div>
            <div className="widget-subtitle">deadline geçildi</div>
          </div>
        </div>

        <div className="widget widget-accent">
          <div className="widget-icon"><Icon d="M2 12l3-4 3 2 3-5 3 3" /></div>
          <div>
            <div className="widget-title">SLA Uyum</div>
            <div className="widget-value">{slaRate !== null ? `%${slaRate}` : '—'}</div>
            <div className="widget-subtitle">{slaViolations} ihlal</div>
          </div>
        </div>

        <div className="widget widget-primary">
          <div className="widget-icon"><Icon d="M8 2L8 14M4 6l4-4 4 4" /></div>
          <div>
            <div className="widget-title">Ort. Çözüm</div>
            <div className="widget-value">{avgResolution ? `${avgResolution}dk` : '—'}</div>
            <div className="widget-subtitle">{resolved.length} çözümden</div>
          </div>
        </div>

        <div className="widget widget-warning">
          <div className="widget-icon"><Icon d="M2 12h12M4 12V7l4-5 4 5v5M6 12V9h4v3" /></div>
          <div>
            <div className="widget-title">Müşteri</div>
            <div className="widget-value">{clients.length}</div>
            <div className="widget-subtitle">kayıtlı</div>
          </div>
        </div>

      </div>

      {/* ── ALT BÖLÜM: Teknisyen + Kategori ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Teknisyen İş Yükü */}
        <div className="card" style={{ margin: 0 }}>
          <h2 style={{ marginBottom: '16px' }}>Teknisyen İş Yükü</h2>
          {techWorkload.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              Henüz teknisyen eklenmedi.<br />
              <span style={{ fontSize: '12px' }}>Ayarlar → Teknisyen Yönetimi</span>
            </p>
          ) : (
            <div>
              {techWorkload.map(tech => {
                const pct = Math.min((tech.active / Math.max(...techWorkload.map(t => t.active), 1)) * 100, 100);
                return (
                  <div key={tech.id} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: '#3b82f620', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: '700', color: '#3b82f6',
                        }}>
                          {tech.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600' }}>{tech.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tech.role}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700' }}>{tech.active}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>aktif</span>
                        {tech.overdue > 0 && (
                          <span style={{ marginLeft: '8px', fontSize: '11px', color: '#ef4444', fontWeight: '600' }}>
                            {tech.overdue} gecikmiş
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px' }}>
                      <div style={{
                        height: '100%', borderRadius: '2px', width: `${pct}%`,
                        background: tech.overdue > 0 ? '#ef4444' : tech.active > 3 ? '#f59e0b' : '#3b82f6',
                        transition: 'width 0.4s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
              {/* Atanmamış arızalar */}
              {(() => {
                const unassigned = active.filter(i => !i.technicianId).length;
                return unassigned > 0 ? (
                  <div style={{
                    marginTop: '8px', padding: '8px 12px', borderRadius: '8px',
                    background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                    fontSize: '12px', color: '#f59e0b',
                  }}>
                    {unassigned} arıza atanmamış
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>

        {/* Aktif Arıza Kategori Dağılımı */}
        <div className="card" style={{ margin: 0 }}>
          <h2 style={{ marginBottom: '16px' }}>Kategori Dağılımı</h2>
          {active.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              Aktif arıza yok.
            </p>
          ) : (
            <div>
              {Object.entries(categories).map(([cat, count]) => {
                const pct = Math.round((count / catMax) * 100);
                return (
                  <div key={cat} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>{catLabels[cat]}</span>
                      <span style={{ fontSize: '13px', fontWeight: '700' }}>{count}</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px' }}>
                      <div style={{
                        height: '100%', borderRadius: '2px', width: `${pct}%`,
                        background: catColors[cat], transition: 'width 0.4s ease',
                      }} />
                    </div>
                  </div>
                );
              })}

              {/* Son 5 aktif arıza */}
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                  Son Açılan Arızalar
                </div>
                {active.slice(0, 4).map(inc => {
                  const client = clients.find(c => c.id === inc.clientId);
                  const priColor = { critical: '#ef4444', medium: '#f59e0b', low: '#10b981' }[inc.priority] || '#94a3b8';
                  return (
                    <div key={inc.id} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '6px 0', borderBottom: '1px solid var(--border)',
                    }}>
                      <div style={{ width: '3px', height: '28px', borderRadius: '2px', background: priColor, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {inc.description}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{client?.name || '—'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default DashboardWidgets;