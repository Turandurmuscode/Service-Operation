import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
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
import ErrorBoundary from './components/ErrorBoundary';
import SyncStatusBadge from './components/SyncStatusBadge';
import SyncControlPanel from './components/SyncControlPanel';
import { readLocalJSON, writeLocalJSON, readSessionJSON, writeSessionJSON } from './services/storageService';
import { createNotificationOrchestrator } from './services/notification/orchestrator';
import { createApiClient, createClientsApi, createIncidentsApi } from './services/api';
import { createSyncEngine } from './services/sync/syncEngine';

// Contexts
import { AuthProvider, useAuth } from './context/AuthContext';
import { I18nProvider, useI18n } from './context/i18nContext';
import { AuditProvider, useAudit } from './context/AuditContext';

import { processWorkflowRules } from './utils/workflowEngine';

// Pages (route-level code splitting)
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const IncidentsPage = lazy(() => import('./pages/IncidentsPage'));
const ClientsPage = lazy(() => import('./pages/ClientsPage'));
const KanbanPage = lazy(() => import('./pages/KanbanPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AssetsPage = lazy(() => import('./pages/AssetsPage'));
const TimesheetPage = lazy(() => import('./pages/TimesheetPage'));
const MessagingPage = lazy(() => import('./pages/MessagingPage'));
const ChecklistsPage = lazy(() => import('./pages/ChecklistsPage'));
const CostTrackingPage = lazy(() => import('./pages/CostTrackingPage'));
const AnnouncementsPage = lazy(() => import('./pages/AnnouncementsPage'));
const ContactLogPage = lazy(() => import('./pages/ContactLogPage'));
const ActivityFeedPage = lazy(() => import('./pages/ActivityFeedPage'));
const WorkflowRulesPage = lazy(() => import('./pages/WorkflowRulesPage'));
const SparePartsPage = lazy(() => import('./pages/SparePartsPage'));
const ContractsPage = lazy(() => import('./pages/ContractsPage'));
const KnowledgeBasePage = lazy(() => import('./pages/KnowledgeBasePage'));
const ScheduledMaintenancePage = lazy(() => import('./pages/ScheduledMaintenancePage'));
const CSATPage = lazy(() => import('./pages/CSATPage'));
const RemoteAccessPage = lazy(() => import('./pages/RemoteAccessPage'));
const TechPerformancePage = lazy(() => import('./pages/TechPerformancePage'));
const SLADashboardPage = lazy(() => import('./pages/SLADashboardPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const QuotationsPage = lazy(() => import('./pages/QuotationsPage'));
const ModulesPage = lazy(() => import('./pages/ModulesPage'));
const KumesCalculatorPage = lazy(() => import('./pages/KumesCalculatorPage'));
const CRMDealsPage = lazy(() => import('./pages/CRMDealsPage'));
const WorkOrderPage = lazy(() => import('./pages/WorkOrderPage'));
const InvoicePage = lazy(() => import('./pages/InvoicePage'));
const RBACPage = lazy(() => import('./pages/RBACPage'));
const FieldTeamPage = lazy(() => import('./pages/FieldTeamPage'));
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage'));

function AppContent() {
  const { currentUser, logout, canAccessPage, canAccessFeature } = useAuth();
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
  const [syncStatus, setSyncStatus] = useState({ queueSize: 0, deadLetterSize: 0 });
  const [showSyncPanel, setShowSyncPanel] = useState(false);
  const [deadLetters, setDeadLetters] = useState([]);
  const notifierRef = useRef(
    createNotificationOrchestrator({
      showToast: (message, type = 'success') => setToast({ message, type }),
      quietHours: { startHour: 22, endHour: 7 },
    })
  );

  // Bildirim gönderilen ID'leri tut — aynı arıza için tekrar bildirme
  const notifiedRef = useRef(
    new Set(readSessionJSON('notifiedDeadlines', []))
  );
  const crmReminderNotifiedRef = useRef(
    new Set(readSessionJSON('notifiedCrmFollowUps', []))
  );
  const apiClientRef = useRef(createApiClient({ baseUrl: '/api' }));
  const clientsApiRef = useRef(createClientsApi(apiClientRef.current));
  const incidentsApiRef = useRef(createIncidentsApi(apiClientRef.current));
  const syncEngineRef = useRef(
    createSyncEngine({
      clientsApi: clientsApiRef.current,
      incidentsApi: incidentsApiRef.current,
    })
  );

  const refreshSyncStats = useCallback(() => {
    setSyncStatus(syncEngineRef.current.getSyncStats());
    setDeadLetters(syncEngineRef.current.getDeadLetters());
  }, []);

  const flushSyncQueue = useCallback(async () => {
    const result = await syncEngineRef.current.flushQueue();
    refreshSyncStats();
    if (result.succeeded > 0) {
      notifierRef.current.notify({
        message: `${result.succeeded} bekleyen islem senkronize edildi`,
        type: 'success',
        channels: ['toast'],
      });
    }
    if (result.deadLettered > 0) {
      notifierRef.current.notify({
        message: `${result.deadLettered} islem dead-letter listesine tasindi`,
        type: 'warning',
        channels: ['toast'],
      });
    }
    return result;
  }, [refreshSyncStats]);

  // ── VERİ YÜKLE ──────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;

    const loadData = async () => {
      const savedClients = readLocalJSON('clients', []);
      const savedIncidents = readLocalJSON('incidents', []);
      const savedActivities = readLocalJSON('activities', []);
      const savedDarkMode = readLocalJSON('darkMode', null);
      const savedCollapsed = readLocalJSON('sidebarCollapsed', null);

      if (!alive) return;
      setClients(savedClients);
      setIncidents(savedIncidents);
      setActivities(savedActivities);
      if (savedDarkMode !== null) setDarkMode(savedDarkMode);
      if (savedCollapsed !== null) setSidebarCollapsed(savedCollapsed);

      try {
        const [remoteClients, remoteIncidents] = await Promise.all([
          clientsApiRef.current.list(),
          incidentsApiRef.current.list(),
        ]);

        if (alive && Array.isArray(remoteClients)) {
          setClients(remoteClients);
          writeLocalJSON('clients', remoteClients);
        }
        if (alive && Array.isArray(remoteIncidents)) {
          setIncidents(remoteIncidents);
          writeLocalJSON('incidents', remoteIncidents);
        }
      } catch {
        // Keep local fallback silently when API is unavailable.
      } finally {
        if (alive) {
          refreshSyncStats();
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(loadData, 300);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [refreshSyncStats]);

  // ── BİLDİRİM İZNİ ───────────────────────────────────────────────
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      const t = setTimeout(() => Notification.requestPermission(), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  // ── OFFLINE QUEUE SYNC RETRY ───────────────────────────────────
  useEffect(() => {
    const interval = setInterval(flushSyncQueue, 45 * 1000);
    window.addEventListener('online', flushSyncQueue);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', flushSyncQueue);
    };
  }, [flushSyncQueue]);

  const requeueDeadLetters = useCallback(() => {
    const moved = syncEngineRef.current.requeueDeadLetters();
    refreshSyncStats();
    if (moved > 0) {
      notifierRef.current.notify({
        message: `${moved} dead-letter kaydi tekrar kuyruğa alindi`,
        type: 'success',
        channels: ['toast'],
      });
    }
  }, [refreshSyncStats]);

  const clearDeadLetters = useCallback(() => {
    syncEngineRef.current.clearDeadLetters();
    refreshSyncStats();
    notifierRef.current.notify({
      message: 'Dead-letter listesi temizlendi',
      type: 'success',
      channels: ['toast'],
    });
  }, [refreshSyncStats]);

  // ── KUYRUGA ALINAN BİLDİRİMLERİ BOŞALT ─────────────────────────
  useEffect(() => {
    const flush = () => notifierRef.current.flushQueue();
    const interval = setInterval(flush, 2 * 60 * 1000);

    const onVisibility = () => {
      if (!document.hidden) flush();
    };

    window.addEventListener('focus', flush);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', flush);
      document.removeEventListener('visibilitychange', onVisibility);
    };
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

        notifierRef.current.notify({
          title: isOverdue ? 'Gecikmiş Arıza' : 'Deadline Yaklaşıyor',
          message: `${isOverdue ? 'Gecikmiş' : 'Yaklaşan deadline'}: ${client?.name} — ${timeLabel}`,
          body: `${client?.name || 'Müşteri'}: ${inc.description} — ${timeLabel}`,
          type: isOverdue ? 'error' : 'warning',
          channels: ['toast', 'browser'],
          dedupeKey: `deadline-${inc.id}`,
          cooldownMs: 60 * 60 * 1000,
          queueIfSuppressed: true,
          priority: isOverdue ? 'critical' : 'normal',
          icon: '/logo192.png',
          tag: `deadline-${inc.id}`,
          requireInteraction: isOverdue,
        });

        // Bir kez bildir, tekrarlama
        notifiedRef.current.add(inc.id);
        writeSessionJSON('notifiedDeadlines', [...notifiedRef.current]);
      });
    };

    checkDeadlines(); // sayfa açılınca hemen kontrol et
    const interval = setInterval(checkDeadlines, 60 * 1000);
    return () => clearInterval(interval);
  }, [incidents, clients]); // eslint-disable-line

  // ── CRM FOLLOW-UP BİLDİRİM KONTROLÜ ─────────────────────────────
  useEffect(() => {
    const checkCrmFollowUps = () => {
      let reminders = [];
      try {
        reminders = JSON.parse(localStorage.getItem('sod_crm_followup_reminders')) || [];
      } catch {
        reminders = [];
      }

      const today = new Date().toISOString().split('T')[0];

      reminders.forEach((reminder) => {
        if (reminder.status !== 'pending' || !reminder.followUpDate) return;
        if (reminder.followUpDate > today) return;
        if (crmReminderNotifiedRef.current.has(reminder.id)) return;

        const isOverdue = reminder.followUpDate < today;

        notifierRef.current.notify({
          title: isOverdue ? 'Geciken CRM Takibi' : 'CRM Takibi Bugün',
          message: `${reminder.title} - ${new Date(reminder.followUpDate).toLocaleDateString('tr-TR')}`,
          body: `${reminder.owner || 'Atanmadı'} sorumlusunda CRM takip görevi bekliyor`,
          type: isOverdue ? 'warning' : 'info',
          channels: ['toast', 'browser'],
          dedupeKey: `crm-followup-${reminder.id}`,
          cooldownMs: 6 * 60 * 60 * 1000,
          queueIfSuppressed: true,
          priority: isOverdue ? 'high' : 'normal',
          icon: '/logo192.png',
          tag: `crm-followup-${reminder.id}`,
        });

        crmReminderNotifiedRef.current.add(reminder.id);
      });

      writeSessionJSON('notifiedCrmFollowUps', [...crmReminderNotifiedRef.current]);
    };

    checkCrmFollowUps();
    const interval = setInterval(checkCrmFollowUps, 60 * 1000);
    window.addEventListener('focus', checkCrmFollowUps);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkCrmFollowUps);
    };
  }, []);

  // ── SIDEBAR ─────────────────────────────────────────────────────
  useEffect(() => {
    writeLocalJSON('sidebarCollapsed', sidebarCollapsed);
  }, [sidebarCollapsed]);

  // ── ACTIVITY ────────────────────────────────────────────────────
  const addActivity = useCallback((type, message) => {
    const newActivity = { type, message, timestamp: new Date().toISOString() };
    const updated = [newActivity, ...activities].slice(0, 50);
    setActivities(updated);
    writeLocalJSON('activities', updated);
  }, [activities]);

  // ── TOAST ───────────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    notifierRef.current.notify({ message, type, channels: ['toast'] });
  }, []);

  // ── MÜŞTERİ EKLE ────────────────────────────────────────────────
  const addClient = useCallback(async (client) => {
    const newClient = {
      id: Date.now(), ...client,
      createdAt: new Date().toISOString(), notes: [], favorite: false,
    };
    const updated = [...clients, newClient];
    setClients(updated);
    writeLocalJSON('clients', updated);
    addActivity('client_added', `Yeni müşteri eklendi: ${client.name}`);
    addAuditEntry(currentUser, 'CREATE', 'client', newClient.id, `Müşteri oluşturuldu: ${client.name}`);
    showToast(t('toast.clientAdded'), 'success');
    const syncResult = await syncEngineRef.current.syncClientCreate(newClient);
    refreshSyncStats();
    if (syncResult.status === 'queued') {
      showToast('Musteri offline kuyruğa alindi', 'warning');
    }
  }, [clients, addActivity, addAuditEntry, currentUser, showToast, t, refreshSyncStats]);

  // ── MÜŞTERİYE NOT ───────────────────────────────────────────────
  const addClientNote = useCallback(async (clientId, noteText) => {
    const updated = clients.map(c =>
      c.id === clientId
        ? { ...c, notes: [...(c.notes || []), { text: noteText, timestamp: new Date().toISOString() }] }
        : c
    );
    setClients(updated);
    writeLocalJSON('clients', updated);
    const changed = updated.find(c => c.id === clientId);
    if (changed) {
      const syncResult = await syncEngineRef.current.syncClientUpdate(clientId, changed);
      refreshSyncStats();
      if (syncResult.status === 'queued') {
        showToast('Musteri notu offline kuyruğa alindi', 'warning');
      }
    }
    addAuditEntry(currentUser, 'UPDATE', 'client', clientId, 'Not eklendi');
    showToast('Not eklendi!', 'success');
  }, [clients, addAuditEntry, currentUser, showToast, refreshSyncStats]);

  // ── ARIZA EKLE ──────────────────────────────────────────────────
  const addIncident = useCallback(async (incident) => {
    const newIncident = {
      id: Date.now(), ...incident,
      status: 'new', startTime: new Date().toISOString(),
      endTime: null, duration: null, notes: [],
    };
    const updated = [...incidents, newIncident];
    setIncidents(updated);
    writeLocalJSON('incidents', updated);
    const client = clients.find(c => c.id === incident.clientId);
    addActivity('incident_created', `${client?.name || 'Müşteri'} için yeni arıza kaydı oluşturuldu`);
    addAuditEntry(currentUser, 'CREATE', 'incident', newIncident.id, `Arıza oluşturuldu: ${incident.description}`);
    showToast(t('toast.incidentCreated'), 'warning');
    const syncResult = await syncEngineRef.current.syncIncidentCreate(newIncident);
    refreshSyncStats();
    if (syncResult.status === 'queued') {
      showToast('Ariza offline kuyruğa alindi', 'warning');
    }
    // Workflow engine: trigger on new incident
    const wfClient = clients.find(c => c.id === incident.clientId);
    processWorkflowRules('incident_created', newIncident, wfClient, { showToast, addIncidentNote });
    if (newIncident.priority === 'critical') {
      processWorkflowRules('incident_critical', newIncident, wfClient, { showToast, addIncidentNote });
    }
  }, [incidents, clients, addActivity, addAuditEntry, currentUser, showToast, t, refreshSyncStats]); // eslint-disable-line

  // ── ARIZA GÜNCELLE (YENİ) ───────────────────────────────────────
  const updateIncident = useCallback(async (updatedIncident) => {
    const updated = incidents.map(inc =>
      inc.id === updatedIncident.id ? { ...inc, ...updatedIncident } : inc
    );
    setIncidents(updated);
    writeLocalJSON('incidents', updated);
    // Deadline değiştiyse bildirim sayacını sıfırla
    notifiedRef.current.delete(updatedIncident.id);
    writeSessionJSON('notifiedDeadlines', [...notifiedRef.current]);
    addActivity('incident_updated', `Arıza güncellendi: ${updatedIncident.description}`);
    addAuditEntry(currentUser, 'UPDATE', 'incident', updatedIncident.id, `Arıza güncellendi: ${updatedIncident.description}`);
    showToast(t('toast.incidentUpdated'), 'success');
    const syncResult = await syncEngineRef.current.syncIncidentUpdate(updatedIncident.id, updatedIncident);
    refreshSyncStats();
    if (syncResult.status === 'queued') {
      showToast('Ariza guncellemesi offline kuyruğa alindi', 'warning');
    }
  }, [incidents, addActivity, addAuditEntry, currentUser, showToast, t, refreshSyncStats]);

  // ── DURUM GÜNCELLE ──────────────────────────────────────────────
  const updateIncidentStatus = useCallback(async (id, newStatus) => {
    const updated = incidents.map(inc =>
      inc.id === id ? { ...inc, status: newStatus } : inc
    );
    setIncidents(updated);
    writeLocalJSON('incidents', updated);
    addAuditEntry(currentUser, 'UPDATE', 'incident', id, `Durum güncellendi: ${newStatus}`);
    showToast('Durum güncellendi!', 'success');
    const syncResult = await syncEngineRef.current.syncIncidentStatus(id, newStatus);
    refreshSyncStats();
    if (syncResult.status === 'queued') {
      showToast('Durum degisikligi offline kuyruğa alindi', 'warning');
    }
  }, [incidents, addAuditEntry, currentUser, showToast, refreshSyncStats]);

  // ── ARIZA NOTU ──────────────────────────────────────────────────
  const addIncidentNote = useCallback(async (incidentId, noteText) => {
    const updated = incidents.map(inc =>
      inc.id === incidentId
        ? { ...inc, notes: [...(inc.notes || []), { text: noteText, timestamp: new Date().toISOString() }] }
        : inc
    );
    setIncidents(updated);
    writeLocalJSON('incidents', updated);
    const changed = updated.find(inc => inc.id === incidentId);
    if (changed) {
      const syncResult = await syncEngineRef.current.syncIncidentUpdate(incidentId, changed);
      refreshSyncStats();
      if (syncResult.status === 'queued') {
        showToast('Ariza notu offline kuyruğa alindi', 'warning');
      }
    }
    showToast('Not eklendi!', 'success');
  }, [incidents, showToast, refreshSyncStats]);

  // ── ARIZA ÇÖZDÜ ─────────────────────────────────────────────────
  const resolveIncident = useCallback(async (id) => {
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
    writeLocalJSON('incidents', updated);
    addAuditEntry(currentUser, 'UPDATE', 'incident', id, 'Arıza çözüldü');
    showToast('Arıza çözüldü!', 'success');
    const syncResult = await syncEngineRef.current.syncIncidentStatus(id, 'resolved');
    refreshSyncStats();
    if (syncResult.status === 'queued') {
      showToast('Cozum durumu offline kuyruğa alindi', 'warning');
    }
    // Workflow engine: trigger on resolve
    const resolvedInc = updated.find(i => i.id === id);
    if (resolvedInc) {
      const wfClient = clients.find(c => c.id === resolvedInc.clientId);
      processWorkflowRules('incident_resolved', resolvedInc, wfClient, { showToast, addIncidentNote });
    }
  }, [incidents, clients, addActivity, addAuditEntry, currentUser, showToast, refreshSyncStats]); // eslint-disable-line

  // ── DARK MODE ───────────────────────────────────────────────────
  const toggleDarkMode = useCallback(() => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    writeLocalJSON('darkMode', newMode);
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
      canAccessFeature,
      onNavigate: handleSetActiveTab,
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
      case 'crmdeals':     return <CRMDealsPage     {...commonProps} />;
      case 'workorders':   return <WorkOrderPage    {...commonProps} onNavigate={handleSetActiveTab} />;
      case 'invoices':     return <InvoicePage       {...commonProps} onNavigate={handleSetActiveTab} />;
      case 'rbac':         return <RBACPage          {...commonProps} />;
      case 'fieldteam':    return <FieldTeamPage     {...commonProps} />;
      case 'integrations': return <IntegrationsPage  {...commonProps} />;
      default:             return <DashboardPage     {...commonProps} onNavigate={handleSetActiveTab} />;
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
          notifications={<NotificationCenter incidents={incidents} clients={clients} onNavigate={handleSetActiveTab} />}
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
            <Suspense fallback={<LoadingSpinner message={t('app.loading')} />}>
              {renderPage()}
            </Suspense>
          </div>
        </main>
      </div>

      <QuickActions onAction={handleSetActiveTab} />
      <ThemeCustomizer darkMode={darkMode} />
      <PWAInstallBanner />
      {showSyncPanel && (
        <SyncControlPanel
          status={syncStatus}
          deadLetters={deadLetters}
          onFlush={flushSyncQueue}
          onRequeueDead={requeueDeadLetters}
          onClearDead={clearDeadLetters}
        />
      )}
      <div onClick={() => setShowSyncPanel(v => !v)}>
        <SyncStatusBadge status={syncStatus} />
      </div>

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
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </AuditProvider>
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;