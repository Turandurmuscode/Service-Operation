import React, { useEffect } from 'react';
import './Sidebar.css';

const Icons = {
  dashboard: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1.5"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5"/>
    </svg>
  ),
  incidents: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2L14 13H2L8 2Z"/>
      <path d="M8 6v4M8 11.5v.5" strokeLinecap="round"/>
    </svg>
  ),
  clients: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="5" r="2.5"/>
      <path d="M2.5 13.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" strokeLinecap="round"/>
    </svg>
  ),
  kanban: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="2" width="4" height="12" rx="1"/>
      <rect x="6" y="2" width="4" height="8" rx="1"/>
      <rect x="11" y="2" width="4" height="10" rx="1"/>
    </svg>
  ),
  analytics: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12L5 7l3 3 4-5 3 2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1.5" y="2.5" width="13" height="12" rx="1.5"/>
      <path d="M5 1.5v2M11 1.5v2M1.5 6.5h13" strokeLinecap="round"/>
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2h7l3 3v9H3V2Z" strokeLinejoin="round"/>
      <path d="M10 2v3h3M5 7h6M5 9.5h6M5 12h4" strokeLinecap="round"/>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="2.5"/>
      <path d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.4 3.4l.85.85M11.75 11.75l.85.85M3.4 12.6l.85-.85M11.75 4.25l.85-.85"/>
    </svg>
  ),
  logo: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2L16 6v6L9 16 2 12V6L9 2Z"/>
      <path d="M9 6v6M6.5 7.5l5 3M11.5 7.5l-5 3"/>
    </svg>
  ),
  chevronLeft:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevronRight: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  close: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round"/></svg>,
};

function Sidebar({
  activeTab, setActiveTab,
  incidentCount, clientCount,
  collapsed, setCollapsed,
  mobileOpen, setMobileOpen,
  currentUser, onLogout,
}) {
  const ROLE_PAGES = {
    admin:      ['dashboard','incidents','clients','kanban','analytics','calendar','reports','settings'],
    manager:    ['dashboard','incidents','clients','kanban','analytics','calendar','reports'],
    technician: ['dashboard','incidents','calendar'],
  };
  const allowedPages = currentUser ? (ROLE_PAGES[currentUser.role] || []) : Object.values(ROLE_PAGES).flat();

  const allSections = [
    {
      label: 'Genel',
      items: [
        { id: 'dashboard', icon: Icons.dashboard, label: 'Dashboard' },
        { id: 'incidents', icon: Icons.incidents, label: 'Arızalar',    badge: incidentCount },
        { id: 'clients',   icon: Icons.clients,   label: 'Müşteriler', badge: clientCount },
      ],
    },
    {
      label: 'İş Yönetimi',
      items: [
        { id: 'kanban',   icon: Icons.kanban,   label: 'Kanban Board' },
        { id: 'calendar', icon: Icons.calendar, label: 'Takvim' },
      ],
    },
    {
      label: 'Raporlama',
      items: [
        { id: 'analytics', icon: Icons.analytics, label: 'Analiz' },
        { id: 'reports',   icon: Icons.reports,   label: 'Raporlar' },
      ],
    },
    {
      label: 'Sistem',
      items: [
        { id: 'settings', icon: Icons.settings, label: 'Ayarlar' },
      ],
    },
  ];
  // Filter sections based on role
  const sections = allSections
    .map(s => ({ ...s, items: s.items.filter(i => allowedPages.includes(i.id)) }))
    .filter(s => s.items.length > 0);
  // Mobil: dışarıya tıklayınca kapat
  useEffect(() => {
    if (!mobileOpen) return;
    const handle = (e) => {
      if (e.target.classList.contains('sidebar-overlay')) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('click', handle);
    return () => document.removeEventListener('click', handle);
  }, [mobileOpen, setMobileOpen]);

  // Mobil: scroll kilitle
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false); // mobilde tıklayınca kapat
  };

  return (
    <>
      {/* Mobil overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" />
      )}

      <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">{Icons.logo}</div>
            {!collapsed && <span className="logo-text">ServisPanel</span>}
          </div>

          {/* Desktop collapse butonu */}
          <button
            className="collapse-btn desktop-only"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Genişlet' : 'Daralt'}
          >
            {collapsed ? Icons.chevronRight : Icons.chevronLeft}
          </button>

          {/* Mobil kapat butonu */}
          <button
            className="collapse-btn mobile-only"
            onClick={() => setMobileOpen(false)}
            title="Kapat"
          >
            {Icons.close}
          </button>
        </div>

        <nav className="sidebar-nav">
          {sections.map((section) => (
            <div key={section.label}>
              <div className="nav-section-label">{section.label}</div>
              {section.items.map(item => (
                <button
                  key={item.id}
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                  title={collapsed ? item.label : ''}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="nav-label">{item.label}</span>
                      {item.badge > 0 && (
                        <span className="nav-badge">{item.badge}</span>
                      )}
                    </>
                  )}
                  {collapsed && item.badge > 0 && (
                    <span className="nav-badge-dot"></span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={onLogout} title="Çıkış Yap">
            <div className="user-avatar">{currentUser?.avatar || 'A'}</div>
            {!collapsed && (
              <div className="user-info">
                <div className="user-name">{currentUser?.name || 'Admin'}</div>
                <div className="user-role">{currentUser?.role === 'admin' ? 'Admin' : currentUser?.role === 'manager' ? 'Yönetici' : 'Teknisyen'}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;