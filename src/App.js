import { useState, useEffect, useCallback } from 'react';
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


// Pages
import DashboardPage from './pages/DashboardPage';
import IncidentsPage from './pages/IncidentsPage';
import ClientsPage from './pages/ClientsPage';
import KanbanPage from './pages/KanbanPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CalendarPage from './pages/CalendarPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const [clients, setClients] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);


  // LocalStorage'dan veri yükle
  useEffect(() => {
    setTimeout(() => {
      const savedClients = localStorage.getItem('clients');
      const savedIncidents = localStorage.getItem('incidents');
      const savedActivities = localStorage.getItem('activities');
      const savedDarkMode = localStorage.getItem('darkMode');
      const savedCollapsed = localStorage.getItem('sidebarCollapsed');
      
      if (savedClients) setClients(JSON.parse(savedClients));
      if (savedIncidents) setIncidents(JSON.parse(savedIncidents));
      if (savedActivities) setActivities(JSON.parse(savedActivities));
      if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
      if (savedCollapsed) setSidebarCollapsed(JSON.parse(savedCollapsed));
      
      setLoading(false);
    }, 800);
  }, []);

  // Sidebar collapsed state'i kaydet
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Activity ekle
  const addActivity = useCallback((type, message) => {
    const newActivity = {
      type,
      message,
      timestamp: new Date().toISOString()
    };
    
    const updatedActivities = [newActivity, ...activities].slice(0, 50);
    setActivities(updatedActivities);
    localStorage.setItem('activities', JSON.stringify(updatedActivities));
  }, [activities]);

  // Toast göster
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Müşteri ekle
  const addClient = useCallback((client) => {
    const newClient = {
      id: Date.now(),
      ...client,
      createdAt: new Date().toISOString(),
      notes: [],
      favorite: false
    };
    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    
    addActivity('client_added', `Yeni müşteri eklendi: ${client.name}`);
    showToast('✓ Müşteri eklendi!', 'success');
  }, [clients, addActivity, showToast]);

  // Müşteriye not ekle
  const addClientNote = useCallback((clientId, noteText) => {
    const updatedClients = clients.map(client => {
      if (client.id === clientId) {
        const newNote = {
          text: noteText,
          timestamp: new Date().toISOString()
        };
        return {
          ...client,
          notes: [...(client.notes || []), newNote]
        };
      }
      return client;
    });
    
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    showToast('✓ Not eklendi!', 'success');
  }, [clients, showToast]);

  // Incident ekle
  const addIncident = useCallback((incident) => {
    const newIncident = {
      id: Date.now(),
      ...incident,
      status: 'new',
      startTime: new Date().toISOString(),
      endTime: null,
      duration: null,
      notes: []
    };
    const updatedIncidents = [...incidents, newIncident];
    setIncidents(updatedIncidents);
    localStorage.setItem('incidents', JSON.stringify(updatedIncidents));
    
    const client = clients.find(c => c.id === incident.clientId);
    addActivity('incident_created', `${client?.name || 'Müşteri'} için yeni arıza kaydı oluşturuldu`);
    showToast('✓ Arıza kaydı oluşturuldu!', 'warning');
  }, [incidents, clients, addActivity, showToast]);

  // Incident durumu güncelle
  const updateIncidentStatus = useCallback((id, newStatus) => {
    const updatedIncidents = incidents.map(inc => {
      if (inc.id === id) {
        return { ...inc, status: newStatus };
      }
      return inc;
    });
    setIncidents(updatedIncidents);
    localStorage.setItem('incidents', JSON.stringify(updatedIncidents));
    showToast('✓ Durum güncellendi!', 'success');
  }, [incidents, showToast]);

  // Incident'e not ekle
  const addIncidentNote = useCallback((incidentId, noteText) => {
    const updatedIncidents = incidents.map(inc => {
      if (inc.id === incidentId) {
        const newNote = {
          text: noteText,
          timestamp: new Date().toISOString()
        };
        return {
          ...inc,
          notes: [...(inc.notes || []), newNote]
        };
      }
      return inc;
    });
    
    setIncidents(updatedIncidents);
    localStorage.setItem('incidents', JSON.stringify(updatedIncidents));
    showToast('✓ Not eklendi!', 'success');
  }, [incidents, showToast]);

  // Incident'i çöz (KONFETTI EKLE)
  const resolveIncident = useCallback((id) => {
    const updatedIncidents = incidents.map(inc => {
      if (inc.id === id && inc.status !== 'resolved') {
        const endTime = new Date().toISOString();
        const duration = Math.floor((new Date(endTime) - new Date(inc.startTime)) / 1000 / 60);
        
        const slaLimit = inc.slaDeadline || 1440;
        if (duration > slaLimit) {
          addActivity('sla_violation', `Arıza ${duration - slaLimit} dakika geç çözüldü`);
        }
        
        const client = clients.find(c => c.id === inc.clientId);
        addActivity('incident_resolved', `${client?.name || 'Müşteri'} arızası ${duration} dakikada çözüldü`);
        
        // KONFETTI TETIKLE!
        
        return { ...inc, status: 'resolved', endTime, duration };
      }
      return inc;
    });
    setIncidents(updatedIncidents);
    localStorage.setItem('incidents', JSON.stringify(updatedIncidents));
    showToast('🎉 Arıza çözüldü!', 'success');
  }, [incidents, clients, addActivity, showToast]);

  // Dark mode toggle
  const toggleDarkMode = useCallback(() => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  }, [darkMode]);
  // Render active page
  const renderPage = () => {
    const commonProps = {
      incidents,
      clients,
      activities,
      addIncident,
      resolveIncident,
      updateIncidentStatus,
      addIncidentNote,
      addClient,
      setClients,
      setIncidents,
      setActivities,
      addClientNote,
      showToast,
      darkMode,
      toggleDarkMode
    };

    switch(activeTab) {
     case 'dashboard':
  return <DashboardPage
    {...commonProps}
    onNavigate={setActiveTab}
  />;

      case 'incidents':
        return <IncidentsPage {...commonProps} />;
      case 'clients':
        return <ClientsPage {...commonProps} />;
      case 'kanban':
        return <KanbanPage {...commonProps} />;
      case 'analytics':
        return <AnalyticsPage {...commonProps} />;
      case 'calendar':
        return <CalendarPage {...commonProps} />;
      case 'reports':
        return <ReportsPage {...commonProps} />;
      case 'settings':
        return <SettingsPage {...commonProps} />;
      default:
        return <DashboardPage {...commonProps} />;
    }
  };

  if (loading) {
    return (
      <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
        <LoadingSpinner message="Panel yükleniyor..." />
      </div>
    );
  }

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        incidentCount={incidents.filter(inc => inc.status !== 'resolved' && inc.status !== 'cancelled').length}
        clientCount={clients.length}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      
      <div className={`main-layout ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Header 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode}
          notifications={<NotificationCenter incidents={incidents} clients={clients} />}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          searchComponent={
  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
    <GlobalSearch incidents={incidents} clients={clients} onNavigate={setActiveTab} />
  </div>
}
          performanceMonitor={<PerformanceMonitor />}
          quickNotes={<QuickNotes />}
          breadcrumb={<Breadcrumb activeTab={activeTab} setActiveTab={setActiveTab} />}
        />
        
        <main className="main-content">
          {renderPage()}
        </main>
      </div>

      <QuickActions onAction={setActiveTab} />
      <PWAInstallBanner />

      
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;