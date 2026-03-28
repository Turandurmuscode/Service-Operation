import React, { useEffect, useState, useCallback } from 'react';
import './Sidebar.css';
import { getEnabledModules } from '../pages/ModulesPage';

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
    <svg viewBox="0 0 18 18" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Scorpion body */}
      <ellipse cx="9" cy="10.5" rx="3" ry="2" stroke="currentColor" strokeWidth="1.4"/>
      {/* Tail curving up like } bracket */}
      <path d="M12 9.5C13.5 8.5 14 7 14 5.5S13.2 2.8 12.8 2.5" stroke="currentColor" strokeWidth="1.5"/>
      {/* Stinger dot */}
      <circle cx="12.8" cy="2.5" r="1" fill="currentColor"/>
      {/* Left claw < */}
      <path d="M6 8.5L3.5 6.8 6 5.2" stroke="currentColor" strokeWidth="1.4"/>
      {/* Right claw > */}
      <path d="M12 5.2L14.5 6.8 12 8.5" stroke="currentColor" strokeWidth="1.4"/>
      {/* Legs - left */}
      <path d="M7 12L5 14.5" stroke="currentColor" strokeWidth="1"/>
      <path d="M8 12.2L6.5 15" stroke="currentColor" strokeWidth="1"/>
      {/* Legs - right */}
      <path d="M11 12L13 14.5" stroke="currentColor" strokeWidth="1"/>
      <path d="M10 12.2L11.5 15" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  assets: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="12" height="10" rx="1.5"/>
      <path d="M5 7h6M5 10h3" strokeLinecap="round"/>
    </svg>
  ),
  timesheet: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6.5"/>
      <path d="M8 4.5v4l2.5 1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  messaging: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 2.5h12v9H6l-3 2.5v-2.5H2v-9Z" strokeLinejoin="round"/>
      <path d="M5 6h6M5 8.5h4" strokeLinecap="round"/>
    </svg>
  ),
  checklists: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="1.5" width="12" height="13" rx="1.5"/>
      <path d="M5 5.5l1.5 1.5L9 4.5M5 9l1.5 1.5L9 8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.5 5.5h1M10.5 9h1" strokeLinecap="round"/>
    </svg>
  ),
  costtracking: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="12" height="12" rx="2"/>
      <path d="M8 5v6M6 9h4" strokeLinecap="round"/>
      <path d="M5 7h1M10 7h1M5 11h6" strokeLinecap="round"/>
    </svg>
  ),
  announcements: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h8v7H2zM10 5.5l4-2v8l-4-2" strokeLinejoin="round"/>
      <path d="M4 11v2" strokeLinecap="round"/>
    </svg>
  ),
  contactlog: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="1.5" width="10" height="13" rx="1.5"/>
      <circle cx="8" cy="6" r="2"/>
      <path d="M5 11c0-1.5 1.3-2.5 3-2.5s3 1 3 2.5" strokeLinecap="round"/>
      <path d="M1 4h2M1 8h2M1 12h2" strokeLinecap="round"/>
    </svg>
  ),
  activityfeed: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 3h12M2 7h8M2 11h10" strokeLinecap="round"/>
      <circle cx="13" cy="7" r="1.5" fill="currentColor"/>
    </svg>
  ),
  workflowrules: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3h4v3H3zM9 3h4v3H9zM6 10h4v3H6z" strokeLinejoin="round"/>
      <path d="M5 6v2h0M11 6v2l-2 2M5 8h2l1 2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  spareparts: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6"/>
      <circle cx="8" cy="8" r="2"/>
      <path d="M8 2v2M8 12v2M2 8h2M12 8h2" strokeLinecap="round"/>
    </svg>
  ),
  contracts: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2h7l3 3v9H3V2Z" strokeLinejoin="round"/>
      <path d="M10 2v3h3" strokeLinecap="round"/>
      <path d="M5.5 8h5M5.5 10.5h3" strokeLinecap="round"/>
      <circle cx="6" cy="12.5" r="1"/>
    </svg>
  ),
  knowledgebase: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 3h5v10H2zM7 3h5v10H7z" strokeLinejoin="round"/>
      <path d="M12 5h2v8h-2" strokeLinejoin="round"/>
    </svg>
  ),
  documents: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 1.5h6.5L13 5v9.5H3V1.5Z" strokeLinejoin="round"/>
      <path d="M9.5 1.5v3.5H13" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.5 8h5M5.5 10.5h5M5.5 13h3" strokeLinecap="round"/>
    </svg>
  ),
  projects: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="3" width="14" height="3" rx="1"/>
      <rect x="3" y="7.5" width="10" height="2" rx="0.5"/>
      <rect x="5" y="11" width="7" height="2" rx="0.5"/>
      <path d="M1 4.5h14" strokeLinecap="round"/>
    </svg>
  ),
  quotations: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2h7l3 3v9H3V2Z" strokeLinejoin="round"/>
      <path d="M10 2v3h3" strokeLinecap="round"/>
      <path d="M6 8h4M6 10h2" strokeLinecap="round"/>
      <circle cx="10" cy="11" r="2"/>
      <path d="M9 11h2M10 10v2" strokeLinecap="round"/>
    </svg>
  ),
  modules: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="5" height="5" rx="1"/>
      <rect x="10" y="1" width="5" height="5" rx="1"/>
      <rect x="1" y="10" width="5" height="5" rx="1"/>
      <rect x="10" y="10" width="5" height="5" rx="1" strokeDasharray="2 1"/>
    </svg>
  ),
  crmdeals: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="4" cy="4" r="2"/>
      <circle cx="12" cy="4" r="2"/>
      <circle cx="8" cy="12" r="2"/>
      <path d="M5.7 5.2L7.2 9.8M10.3 5.2L8.8 9.8" strokeLinecap="round"/>
    </svg>
  ),
  followups: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2a6 6 0 1 1-4.24 1.76" strokeLinecap="round"/>
      <path d="M3 1.5v3h3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 4.5v3.5l2.4 1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  techsummary: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="5" cy="4" r="2"/>
      <path d="M1.5 10.5c0-2 1.6-3.5 3.5-3.5S8.5 8.5 8.5 10.5" strokeLinecap="round"/>
      <path d="M9.5 4.5h5M9.5 7h5M9.5 9.5h5" strokeLinecap="round"/>
    </svg>
  ),
  recurringissues: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 4h8a2 2 0 0 1 0 4H5" strokeLinecap="round"/>
      <path d="M13 12H5a2 2 0 0 1 0-4h6" strokeLinecap="round"/>
      <path d="M3 3.5L1.5 5 3 6.5M13 9.5L14.5 11 13 12.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  approvals: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="12" height="12" rx="2"/>
      <path d="M5 8l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  workorders: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 2a4 4 0 0 1 1 7.9L6 14.5a1.5 1.5 0 0 1-2-2l4.6-4.9A4 4 0 0 1 10 2Z" strokeLinejoin="round"/>
      <path d="M3.5 12.5l10-10" strokeLinecap="round"/>
    </svg>
  ),
  invoices: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2h7l3 3v9H3V2Z" strokeLinejoin="round"/>
      <path d="M10 2v3h3" strokeLinecap="round"/>
      <path d="M6 8h4M6 10h2" strokeLinecap="round"/>
      <path d="M6 12l1 .5 1-.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  rbac: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1.5L2.5 4v4c0 3 2.5 5.5 5.5 6 3-0.5 5.5-3 5.5-6V4L8 1.5Z" strokeLinejoin="round"/>
      <path d="M5.5 8l1.5 1.5L10.5 6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  fieldteam: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10.5 2.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/>
      <path d="M3 13c0-2.5 2.3-4 5.5-4S14 10.5 14 13" strokeLinecap="round"/>
      <circle cx="3.5" cy="5.5" r="1.5"/>
      <path d="M1 13c0-1.5 1-2.5 2.5-2.5" strokeLinecap="round"/>
    </svg>
  ),
  integrations: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9.5 6A3 3 0 0 1 6.5 9M9 5l-.7-.7a3 3 0 0 0-4.6 3.8l.7.7M7 11l.7.7a3 3 0 0 0 4.6-3.8L11.6 7" strokeLinecap="round"/>
      <circle cx="11" cy="5" r="1.5" fill="currentColor"/>
      <circle cx="5" cy="11" r="1.5" fill="currentColor"/>
    </svg>
  ),
  scheduledmaintenance: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6.5"/>
      <path d="M8 4.5v4l2 2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 2l1.5 1.5M4 2L2.5 3.5" strokeLinecap="round"/>
    </svg>
  ),
  remoteaccess: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <path d="M8 21h8M12 17v4"/>
      <path d="M7 10h.01M12 10h.01M17 10h.01" strokeLinecap="round"/>
    </svg>
  ),
  chevronLeft:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevronRight: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevronDown:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  close: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round"/></svg>,
};

function Sidebar({
  activeTab, setActiveTab,
  incidentCount, clientCount,
  collapsed, setCollapsed,
  mobileOpen, setMobileOpen,
  currentUser, onLogout,
}) {
  // Track mobile viewport — collapsed state is ignored on mobile
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' && window.innerWidth <= 1024
  );

  // ── Collapsible section state (persisted in localStorage) ──
  const [openSections, setOpenSections] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebar_sections');
      return saved ? JSON.parse(saved) : {};  // {} means all open by default
    } catch { return {}; }
  });

  const toggleSection = useCallback((label) => {
    setOpenSections(prev => {
      const isOpen = prev[label] === undefined ? true : !!prev[label];
      const next = { ...prev, [label]: !isOpen };
      localStorage.setItem('sidebar_sections', JSON.stringify(next));
      return next;
    });
  }, []);

  // A section is open if it has no explicit entry (default open) or explicitly true
  const isSectionOpen = (label, state) => {
    const s = state || openSections;
    return s[label] === undefined ? true : !!s[label];
  };

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  // ── Module on/off filtering ──
  const [enabledMods, setEnabledMods] = useState(() => getEnabledModules());

  useEffect(() => {
    const handler = () => setEnabledMods(getEnabledModules());
    window.addEventListener('modules-changed', handler);
    return () => window.removeEventListener('modules-changed', handler);
  }, []);

  const ROLE_PAGES = {
    admin:      ['dashboard','incidents','clients','kanban','analytics','calendar','reports','assets','timesheet','messaging','checklists','costtracking','announcements','contactlog','activityfeed','workflowrules','settings','spareparts','contracts','knowledgebase','scheduledmaintenance','remoteaccess','documents','projects','quotations','modules','crmdeals','followups','techsummary','recurringissues','approvals','workorders','invoices','rbac','fieldteam','integrations'],
    manager:    ['dashboard','incidents','clients','kanban','analytics','calendar','reports','assets','timesheet','messaging','checklists','costtracking','announcements','contactlog','activityfeed','workflowrules','spareparts','contracts','knowledgebase','scheduledmaintenance','remoteaccess','documents','projects','quotations','crmdeals','followups','techsummary','recurringissues','approvals','workorders','invoices','fieldteam'],
    technician: ['dashboard','incidents','calendar','timesheet','messaging','checklists','announcements','activityfeed','spareparts','knowledgebase','documents','projects','fieldteam','techsummary','followups'],
  };
  const allowedPages = currentUser ? (ROLE_PAGES[currentUser.role] || []) : Object.values(ROLE_PAGES).flat();

  const allSections = [
    {
      label: 'Genel',
      items: [
        { id: 'dashboard', icon: Icons.dashboard, label: 'Dashboard' },
        { id: 'incidents', icon: Icons.incidents, label: 'Arızalar',    badge: incidentCount },
        { id: 'clients',   icon: Icons.clients,   label: 'Müşteriler', badge: clientCount },
        { id: 'contactlog', icon: Icons.contactlog, label: 'İletişim Geçmişi' },
        { id: 'announcements', icon: Icons.announcements, label: 'Duyurular' },
        { id: 'activityfeed', icon: Icons.activityfeed, label: 'Canlı Akış' },
      ],
    },
    {
      label: 'İş Yönetimi',
      items: [
        { id: 'kanban',   icon: Icons.kanban,   label: 'Kanban Board' },
        { id: 'crmdeals', icon: Icons.kanban, label: 'CRM Kanban' },
        { id: 'followups', icon: Icons.followups, label: 'Geri Arama / Takip' },
        { id: 'techsummary', icon: Icons.techsummary, label: 'Teknisyen Gun Sonu' },
        { id: 'approvals', icon: Icons.approvals, label: 'Bekleyen Onaylar' },
        { id: 'workorders', icon: Icons.workorders, label: 'İş Emirleri' },
        { id: 'fieldteam', icon: Icons.fieldteam, label: 'Saha Ekip Yönetimi' },
        { id: 'calendar', icon: Icons.calendar, label: 'Takvim' },
        { id: 'timesheet', icon: Icons.timesheet, label: 'Saat Takibi' },
        { id: 'checklists', icon: Icons.checklists, label: 'Kontrol Listeleri' },
        { id: 'projects', icon: Icons.projects, label: 'Proje Yönetimi' },
        { id: 'scheduledmaintenance', icon: Icons.scheduledmaintenance, label: 'Periyodik Bakım' },
      ],
    },
    {
      label: 'Kaynaklar',
      items: [
        { id: 'assets',        icon: Icons.assets,        label: 'Envanter' },
        { id: 'spareparts',    icon: Icons.spareparts,    label: 'Yedek Parça' },
        { id: 'knowledgebase', icon: Icons.knowledgebase, label: 'Bilgi Bankası' },
        { id: 'documents',     icon: Icons.documents,     label: 'Dokümanlar' },
        { id: 'remoteaccess',  icon: Icons.remoteaccess,  label: 'Uzak Erişim' },
        { id: 'messaging',     icon: Icons.messaging,     label: 'Mesajlar' },
      ],
    },
    {
      label: 'Raporlama',
      items: [
        { id: 'analytics',    icon: Icons.analytics,    label: 'Analiz' },
        { id: 'recurringissues', icon: Icons.recurringissues, label: 'Tekrarlayan Ariza' },
        { id: 'reports',      icon: Icons.reports,      label: 'Raporlar' },
        { id: 'costtracking', icon: Icons.costtracking, label: 'Maliyet Takibi' },
        { id: 'contracts',    icon: Icons.contracts,    label: 'Sözleşmeler' },
        { id: 'quotations',  icon: Icons.quotations,  label: 'Teklifler' },
        { id: 'invoices',     icon: Icons.invoices,     label: 'Faturalar' },
      ],
    },
    {
      label: 'Sistem',
      items: [
        { id: 'workflowrules', icon: Icons.workflowrules, label: 'Otomasyon' },
        { id: 'rbac', icon: Icons.rbac, label: 'Yetki & Rol Matrisi' },
        { id: 'integrations', icon: Icons.integrations, label: 'Entegrasyonlar' },
        { id: 'modules', icon: Icons.modules, label: 'Modüller' },
        { id: 'settings', icon: Icons.settings, label: 'Ayarlar' },
      ],
    },
  ];
  // Filter sections based on role AND enabled modules
  const sections = allSections
    .map(s => ({ ...s, items: s.items.filter(i => allowedPages.includes(i.id) && enabledMods.includes(i.id)) }))
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

      <div className={`sidebar ${collapsed && !isMobile ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">{Icons.logo}</div>
            <span className="logo-text">Scor-Pi</span>
          </div>

          {/* Sidebar aç/kapat butonu */}
          <button
            className="collapse-btn"
            onClick={() => {
              if (isMobile) {
                setMobileOpen(false);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            title={isMobile ? 'Menüyü Kapat' : (collapsed ? 'Menüyü Aç' : 'Menüyü Kapat')}
          >
            {isMobile ? Icons.close : (collapsed ? Icons.chevronRight : Icons.chevronLeft)}
          </button>
        </div>

        <nav className="sidebar-nav">
          {sections.map((section) => {
            const isOpen = isSectionOpen(section.label);
            const hasActiveItem = section.items.some(i => i.id === activeTab);
            return (
            <div key={section.label} className="nav-section">
              <button
                className={`nav-section-label ${hasActiveItem ? 'has-active' : ''}`}
                onClick={() => toggleSection(section.label)}
                title={section.label}
              >
                <span className="nav-section-text">{section.label}</span>
                <span className={`nav-section-chevron ${isOpen ? 'open' : ''}`}>
                  {Icons.chevronDown}
                </span>
              </button>
              <div className={`nav-section-items ${isOpen ? 'expanded' : 'collapsed-section'}`}>
                <div className="nav-section-inner">
                  {section.items.map(item => (
                    <button
                      key={item.id}
                      className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                      onClick={() => handleNavClick(item.id)}
                      title={item.label}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                      {item.badge > 0 && (
                        <span className="nav-badge">{item.badge}</span>
                      )}
                      {item.badge > 0 && (
                        <span className="nav-badge-dot"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );})}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={onLogout} title="Çıkış Yap">
            <div className="user-avatar">{currentUser?.avatar || 'A'}</div>
            <div className="user-info">
              <div className="user-name">{currentUser?.name || 'Admin'}</div>
              <div className="user-role">{currentUser?.role === 'admin' ? 'Admin' : currentUser?.role === 'manager' ? 'Yönetici' : 'Teknisyen'}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;