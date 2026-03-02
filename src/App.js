import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import LoadingSpinner from './components/LoadingSpinner';
import NotificationCenter from './components/NotificationCenter';
import GlobalSearch from './components/GlobalSearch';
import QuickActions from './components/QuickActions';
import PerformanceMonitor from './components/PerformanceMonitor';
import QuickNotes from './components/QuickNotes';
import Breadcrumb from './components/Breadcrumb';
import PWAInstallBanner from './components/PWAInstallBanner';
import LoginScreen from './components/LoginScreen';
import ThemeCustomizer from './components/ThemeCustomizer';

// Contexts
import { AuthProvider, useAuth, ROLE_PERMISSIONS } from './context/AuthContext';
import { I18nProvider, useI18n } from './context/i18nContext';
import { AuditProvider, useAudit } from './context/AuditContext';

// Pages
import DashboardPage from './pages/DashboardPage';
import IncidentsPage from './pages/IncidentsPage';
import ClientsPage from './pages/ClientsPage';
import KanbanPage from './pages/KanbanPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CalendarPage from './pages/CalendarPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import AssetsPage from './pages/AssetsPage';
import TimesheetPage from './pages/TimesheetPage';
import MessagingPage from './pages/MessagingPage';
import ChecklistsPage from './pages/ChecklistsPage';
import CostTrackingPage from './pages/CostTrackingPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import ContactLogPage from './pages/ContactLogPage';
import ActivityFeedPage from './pages/ActivityFeedPage';
import WorkflowRulesPage from './pages/WorkflowRulesPage';
import SparePartsPage from './pages/SparePartsPage';
import ContractsPage from './pages/ContractsPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import ScheduledMaintenancePage from './pages/ScheduledMaintenancePage';
import CSATPage from './pages/CSATPage';
import RemoteAccessPage from './pages/RemoteAccessPage';
import TechPerformancePage from './pages/TechPerformancePage';
import SLADashboardPage from './pages/SLADashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import ProjectsPage from './pages/ProjectsPage';
import QuotationsPage from './pages/QuotationsPage';
import ModulesPage from './pages/ModulesPage';
import KumesCalculatorPage from './pages/KumesCalculatorPage';
import { processWorkflowRules } from './utils/workflowEngine';

function AppContent() {
  const { currentUser, logout, canAccessPage } = useAuth();
  const { t } = useI18n();
  const { addAuditEntry } = useAudit();
  const [clients,    setClients]    = useState([]);
  const [incidents,  setIncidents]  = useState([]);
  const [activities, setActivities] = useState([]);
  const [darkMode,   setDarkMode]   = useState(false);
  const [toast,      setToast]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen,      setSidebarOpen]      = useState(false);

  // Bildirim gönderilen ID'leri tut — aynı arıza için tekrar bildirme
  const notifiedRef = useRef(
    new Set(JSON.parse(sessionStorage.getItem('notifiedDeadlines') || '[]'))
  );

  // ── VERİ YÜKLE ──────────────────────────────────────────────────
  useEffect(() => {
    setTimeout(() => {
      const savedClients    = localStorage.getItem('clients');
      const savedIncidents  = localStorage.getItem('incidents');
      const savedActivities = localStorage.getItem('activities');
      const savedDarkMode   = localStorage.getItem('darkMode');
      const savedCollapsed  = localStorage.getItem('sidebarCollapsed');

      if (savedClients)    setClients(JSON.parse(savedClients));
      if (savedIncidents)  setIncidents(JSON.parse(savedIncidents));
      if (savedActivities) setActivities(JSON.parse(savedActivities));
      if (savedDarkMode)   setDarkMode(JSON.parse(savedDarkMode));
      if (savedCollapsed)  setSidebarCollapsed(JSON.parse(savedCollapsed));

      setLoading(false);
    }, 800);
  }, []);

  // ── BİLDİRİM İZNİ ───────────────────────────────────────────────
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      const t = setTimeout(() => Notification.requestPermission(), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  // ── DEADLINE BİLDİRİM KONTROLÜ (her 60 saniye) ──────────────────
  useEffect(() => {
    if (!incidents.length) return;

    const checkDeadlines = () => {
      const now     = new Date();
      const oneHour = 60 * 60 * 1000;

      incidents.forEach(inc => {
        if (!inc.deadline) return;
        if (inc.status === 'resolved' || inc.status === 'cancelled') return;
        if (notifiedRef.current.has(inc.id)) return;

        const diff      = new Date(inc.deadline) - now;
        const isOverdue = diff < 0;

        // Sadece 1 saat içinde veya geçmiş olanları bildir
        if (diff > oneHour) return;

        const client = clients.find(c => c.id === inc.clientId);
        const timeLabel = isOverdue
          ? `${Math.floor(Math.abs(diff) / 60000)} dakika gecikmiş`
          : `${Math.ceil(diff / 60000)} dakika kaldı`;

        // Tarayıcı push bildirimi
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(
            isOverdue ? 'Gecikmiş Arıza' : 'Deadline Yaklaşıyor',
            {
              body: `${client?.name || 'Müşteri'}: ${inc.description} — ${timeLabel}`,
              icon: '/logo192.png',
              tag: `deadline-${inc.id}`,
              requireInteraction: isOverdue, // gecikmiş olanlar otomatik kapanmasın
            }
          );
        }

        // Uygulama içi toast
        showToast(
          `${isOverdue ? 'Gecikmiş' : 'Yaklaşan deadline'}: ${client?.name} — ${timeLabel}`,
          isOverdue ? 'error' : 'warning'
        );

        // Bir kez bildir, tekrarlama
        notifiedRef.current.add(inc.id);
        sessionStorage.setItem(
          'notifiedDeadlines',
          JSON.stringify([...notifiedRef.current])
        );
      });
    };

    checkDeadlines(); // sayfa açılınca hemen kontrol et
    const interval = setInterval(checkDeadlines, 60 * 1000);
    return () => clearInterval(interval);
  }, [incidents, clients]); // eslint-disable-line

  // ── SIDEBAR ─────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // ── ACTIVITY ────────────────────────────────────────────────────
  const addActivity = useCallback((type, message) => {
    const newActivity = { type, message, timestamp: new Date().toISOString() };
    const updated = [newActivity, ...activities].slice(0, 50);
    setActivities(updated);
    localStorage.setItem('activities', JSON.stringify(updated));
  }, [activities]);

  // ── TOAST ───────────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // ── MÜŞTERİ EKLE ────────────────────────────────────────────────
  const addClient = useCallback((client) => {
    const newClient = {
      id: Date.now(), ...client,
      createdAt: new Date().toISOString(), notes: [], favorite: false,
    };
    const updated = [...clients, newClient];
    setClients(updated);
    localStorage.setItem('clients', JSON.stringify(updated));
    addActivity('client_added', `Yeni müşteri eklendi: ${client.name}`);
    addAuditEntry(currentUser, 'CREATE', 'client', newClient.id, `Müşteri oluşturuldu: ${client.name}`);
    showToast(t('toast.clientAdded'), 'success');
  }, [clients, addActivity, addAuditEntry, currentUser, showToast, t]);

  // ── MÜŞTERİYE NOT ───────────────────────────────────────────────
  const addClientNote = useCallback((clientId, noteText) => {
    const updated = clients.map(c =>
      c.id === clientId
        ? { ...c, notes: [...(c.notes || []), { text: noteText, timestamp: new Date().toISOString() }] }
        : c
    );
    setClients(updated);
    localStorage.setItem('clients', JSON.stringify(updated));
    addAuditEntry(currentUser, 'UPDATE', 'client', clientId, 'Not eklendi');
    showToast('Not eklendi!', 'success');
  }, [clients, addAuditEntry, currentUser, showToast]);

  // ── ARIZA EKLE ──────────────────────────────────────────────────
  const addIncident = useCallback((incident) => {
    const newIncident = {
      id: Date.now(), ...incident,
      status: 'new', startTime: new Date().toISOString(),
      endTime: null, duration: null, notes: [],
    };
    const updated = [...incidents, newIncident];
    setIncidents(updated);
    localStorage.setItem('incidents', JSON.stringify(updated));
    const client = clients.find(c => c.id === incident.clientId);
    addActivity('incident_created', `${client?.name || 'Müşteri'} için yeni arıza kaydı oluşturuldu`);
    addAuditEntry(currentUser, 'CREATE', 'incident', newIncident.id, `Arıza oluşturuldu: ${incident.description}`);
    showToast(t('toast.incidentCreated'), 'warning');
    // Workflow engine: trigger on new incident
    const wfClient = clients.find(c => c.id === incident.clientId);
    processWorkflowRules('incident_created', newIncident, wfClient, { showToast, addIncidentNote });
    if (newIncident.priority === 'critical') {
      processWorkflowRules('incident_critical', newIncident, wfClient, { showToast, addIncidentNote });
    }
  }, [incidents, clients, addActivity, addAuditEntry, currentUser, showToast, t]); // eslint-disable-line

  // ── ARIZA GÜNCELLE (YENİ) ───────────────────────────────────────
  const updateIncident = useCallback((updatedIncident) => {
    const updated = incidents.map(inc =>
      inc.id === updatedIncident.id ? { ...inc, ...updatedIncident } : inc
    );
    setIncidents(updated);
    localStorage.setItem('incidents', JSON.stringify(updated));
    // Deadline değiştiyse bildirim sayacını sıfırla
    notifiedRef.current.delete(updatedIncident.id);
    sessionStorage.setItem('notifiedDeadlines', JSON.stringify([...notifiedRef.current]));
    addActivity('incident_updated', `Arıza güncellendi: ${updatedIncident.description}`);
    addAuditEntry(currentUser, 'UPDATE', 'incident', updatedIncident.id, `Arıza güncellendi: ${updatedIncident.description}`);
    showToast(t('toast.incidentUpdated'), 'success');
  }, [incidents, addActivity, addAuditEntry, currentUser, showToast, t]);

  // ── DURUM GÜNCELLE ──────────────────────────────────────────────
  const updateIncidentStatus = useCallback((id, newStatus) => {
    const updated = incidents.map(inc =>
      inc.id === id ? { ...inc, status: newStatus } : inc
    );
    setIncidents(updated);
    localStorage.setItem('incidents', JSON.stringify(updated));
    addAuditEntry(currentUser, 'UPDATE', 'incident', id, `Durum güncellendi: ${newStatus}`);
    showToast('Durum güncellendi!', 'success');
  }, [incidents, addAuditEntry, currentUser, showToast]);

  // ── ARIZA NOTU ──────────────────────────────────────────────────
  const addIncidentNote = useCallback((incidentId, noteText) => {
    const updated = incidents.map(inc =>
      inc.id === incidentId
        ? { ...inc, notes: [...(inc.notes || []), { text: noteText, timestamp: new Date().toISOString() }] }
        : inc
    );
    setIncidents(updated);
    localStorage.setItem('incidents', JSON.stringify(updated));
    showToast('Not eklendi!', 'success');
  }, [incidents, showToast]);

  // ── ARIZA ÇÖZDÜ ─────────────────────────────────────────────────
  const resolveIncident = useCallback((id) => {
    const updated = incidents.map(inc => {
      if (inc.id === id && inc.status !== 'resolved') {
        const endTime  = new Date().toISOString();
        const duration = Math.floor((new Date(endTime) - new Date(inc.startTime)) / 1000 / 60);
        const slaLimit = inc.slaDeadline || 1440;
        if (duration > slaLimit) addActivity('sla_violation', `Arıza ${duration - slaLimit} dakika geç çözüldü`);
        const client = clients.find(c => c.id === inc.clientId);
        addActivity('incident_resolved', `${client?.name || 'Müşteri'} arızası ${duration} dakikada çözüldü`);
        return { ...inc, status: 'resolved', endTime, duration };
      }
      return inc;
    });
    setIncidents(updated);
    localStorage.setItem('incidents', JSON.stringify(updated));
    addAuditEntry(currentUser, 'UPDATE', 'incident', id, 'Arıza çözüldü');
    showToast('Arıza çözüldü!', 'success');
    // Workflow engine: trigger on resolve
    const resolvedInc = updated.find(i => i.id === id);
    if (resolvedInc) {
      const wfClient = clients.find(c => c.id === resolvedInc.clientId);
      processWorkflowRules('incident_resolved', resolvedInc, wfClient, { showToast, addIncidentNote });
    }
  }, [incidents, clients, addActivity, addAuditEntry, currentUser, showToast]); // eslint-disable-line

  // ── DARK MODE ───────────────────────────────────────────────────
  const toggleDarkMode = useCallback(() => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  }, [darkMode]);

  // ── RENDER ──────────────────────────────────────────────────────
  const renderPage = () => {
    const commonProps = {
      incidents, clients, activities,
      addIncident, resolveIncident, updateIncidentStatus, addIncidentNote,
      updateIncident,
      addClient, setClients, setIncidents, setActivities,
      addClientNote, showToast, darkMode, toggleDarkMode,
      currentUser,
    };
    // Sayfa erişim kontrolü
    if (activeTab !== 'dashboard' && !canAccessPage(activeTab)) {
      return (
        <div className="page-content">
          <div className="empty-state" style={{ height: '60vh' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{ opacity: 0.25 }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <p>{t('auth.accessDenied')}</p>
          </div>
        </div>
      );
    }
    switch (activeTab) {
      case 'dashboard': return <DashboardPage {...commonProps} onNavigate={handleSetActiveTab} />;
      case 'incidents': return <IncidentsPage {...commonProps} />;
      case 'clients':   return <ClientsPage   {...commonProps} />;
      case 'kanban':    return <KanbanPage     {...commonProps} />;
      case 'analytics': return <AnalyticsPage  {...commonProps} />;
      case 'calendar':  return <CalendarPage   {...commonProps} />;
      case 'reports':   return <ReportsPage    {...commonProps} />;
      case 'settings':  return <SettingsPage   {...commonProps} />;
      case 'assets':    return <AssetsPage     {...commonProps} />;
      case 'timesheet': return <TimesheetPage  {...commonProps} />;
      case 'messaging': return <MessagingPage  {...commonProps} />;
      case 'checklists': return <ChecklistsPage {...commonProps} />;
      case 'costtracking': return <CostTrackingPage {...commonProps} />;
      case 'announcements': return <AnnouncementsPage {...commonProps} />;
      case 'contactlog': return <ContactLogPage {...commonProps} />;
      case 'activityfeed': return <ActivityFeedPage {...commonProps} />;
      case 'workflowrules': return <WorkflowRulesPage {...commonProps} />;
      case 'spareparts': return <SparePartsPage {...commonProps} />;
      case 'contracts': return <ContractsPage {...commonProps} />;
      case 'knowledgebase': return <KnowledgeBasePage {...commonProps} />;
      case 'scheduledmaintenance': return <ScheduledMaintenancePage {...commonProps} />;
      case 'csat': return <CSATPage {...commonProps} />;
      case 'remoteaccess': return <RemoteAccessPage {...commonProps} />;
      case 'techperformance': return <TechPerformancePage {...commonProps} />;
      case 'sladashboard': return <SLADashboardPage {...commonProps} />;
      case 'documents': return <DocumentsPage {...commonProps} />;
      case 'projects': return <ProjectsPage {...commonProps} />;
      case 'quotations': return <QuotationsPage {...commonProps} />;
      case 'modules': return <ModulesPage {...commonProps} />;
      case 'kumescalculator': return <KumesCalculatorPage {...commonProps} />;
      default:          return <DashboardPage {...commonProps} onNavigate={handleSetActiveTab} />;
    }
  };

  const handleSetActiveTab = useCallback((tab) => {
    if (!canAccessPage(tab)) {
      showToast(t('auth.accessDenied'), 'error');
      return;
    }
    setActiveTab(tab);
  }, [canAccessPage, showToast, t]);

  if (!currentUser) return <LoginScreen />;

  if (loading) {
    return (
      <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
        <LoadingSpinner message={t('app.loading')} />
      </div>
    );
  }

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <Sidebar
        activeTab={activeTab} setActiveTab={handleSetActiveTab}
        incidentCount={incidents.filter(i => i.status !== 'resolved' && i.status !== 'cancelled').length}
        clientCount={clients.length}
        collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed}
        mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen}
        currentUser={currentUser}
        onLogout={() => { logout(); addAuditEntry(currentUser, 'LOGOUT', 'auth', currentUser?.id, `${currentUser?.name} çıkış yaptı`); }}
      />

      <div className={`main-layout ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Header
          darkMode={darkMode} toggleDarkMode={toggleDarkMode}
          notifications={<NotificationCenter incidents={incidents} clients={clients} />}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          searchComponent={
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
              <GlobalSearch incidents={incidents} clients={clients} onNavigate={handleSetActiveTab} />
            </div>
          }
          performanceMonitor={<PerformanceMonitor />}
          quickNotes={<QuickNotes />}
          breadcrumb={<Breadcrumb activeTab={activeTab} setActiveTab={setActiveTab} />}
        />
        <main className="main-content">
          <div className="page-transition" key={activeTab}>
            {renderPage()}
          </div>
        </main>
      </div>

      <QuickActions onAction={handleSetActiveTab} />
      <ThemeCustomizer darkMode={darkMode} />
      <PWAInstallBanner />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <AuditProvider>
          <AppContent />
        </AuditProvider>
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;