import React, { createContext, useContext, useState, useCallback } from 'react';

// ── Çeviri sözlükleri ────────────────────────────────────────────
const translations = {
  tr: {
    // Genel
    'app.name': 'Scor-Pi',
    'app.loading': 'Panel yükleniyor...',
    'lang.tr': 'Türkçe',
    'lang.en': 'English',

    // Navigasyon
    'nav.dashboard': 'Dashboard',
    'nav.incidents': 'Arızalar',
    'nav.clients': 'Müşteriler',
    'nav.kanban': 'Kanban Board',
    'nav.analytics': 'Analiz',
    'nav.calendar': 'Takvim',
    'nav.reports': 'Raporlar',
    'nav.settings': 'Ayarlar',
    'nav.assets': 'Envanter',
    'nav.timesheet': 'Saat Takibi',
    'nav.messaging': 'Mesajlar',
    'nav.checklists': 'Kontrol Listeleri',
    'nav.costtracking': 'Maliyet Takibi',
    'nav.announcements': 'Duyurular',
    'nav.contactlog': 'İletişim Geçmişi',
    'nav.activityfeed': 'Canlı Akış',
    'nav.workflowrules': 'Otomasyon',
    'nav.general': 'Genel',
    'nav.workManagement': 'İş Yönetimi',
    'nav.resources': 'Kaynaklar',
    'nav.reporting': 'Raporlama',

    // Dashboard
    'dashboard.greeting.morning': 'Günaydın',
    'dashboard.greeting.afternoon': 'İyi günler',
    'dashboard.greeting.evening': 'İyi akşamlar',
    'dashboard.greeting.night': 'İyi geceler',
    'dashboard.activeIncidents': 'Aktif Arıza',
    'dashboard.resolvedToday': 'Bugün Çözülen',
    'dashboard.overdue': 'Gecikmiş',
    'dashboard.slaCompliance': 'SLA Uyum',
    'dashboard.avgResolution': 'Ort. Çözüm',
    'dashboard.clients': 'Müşteri',

    // Arızalar
    'incidents.title': 'Arıza Yönetimi',
    'incidents.subtitle': 'Tüm servis taleplerini takip et ve yönet',
    'incidents.new': 'Yeni Arıza',
    'incidents.search': 'Arıza açıklamasında ara...',
    'incidents.status.all': 'Tüm Durumlar',
    'incidents.status.new': 'Yeni',
    'incidents.status.in_progress': 'Devam Ediyor',
    'incidents.status.on_hold': 'Beklemede',
    'incidents.status.resolved': 'Çözüldü',
    'incidents.status.cancelled': 'İptal',
    'incidents.priority.all': 'Tüm Öncelikler',
    'incidents.priority.critical': 'Kritik',
    'incidents.priority.medium': 'Orta',
    'incidents.priority.low': 'Düşük',
    'incidents.resolve': 'Çöz',
    'incidents.resolved': 'Çözüldü!',
    'incidents.noData': 'Henüz arıza kaydı bulunmuyor.',

    // Müşteriler
    'clients.title': 'Müşteri Yönetimi',
    'clients.subtitle': 'Müşteri bilgilerini görüntüle ve düzenle',
    'clients.new': 'Yeni Müşteri',
    'clients.search': 'Müşteri ara...',
    'clients.favorites': 'Favoriler',
    'clients.noData': 'Müşteri bulunamadı',
    'clients.edit': 'Müşteri Düzenle',
    'clients.save': 'Kaydet',
    'clients.cancel': 'İptal',
    'clients.delete.confirm': 'müşterisini silmek istediğinize emin misiniz?',

    // Ayarlar
    'settings.title': 'Ayarlar',
    'settings.appearance': 'Görünüm',
    'settings.darkMode': 'Karanlık Mod',
    'settings.language': 'Dil / Language',
    'settings.technicians': 'Teknisyen Yönetimi',
    'settings.templates': 'Arıza Şablonları',
    'settings.data': 'Veri Yönetimi',
    'settings.auditLog': 'Denetim Logu',
    'settings.roles': 'Rol & Kullanıcı Yönetimi',
    'settings.about': 'Hakkında',

    // Denetim logu
    'audit.title': 'Denetim Logu',
    'audit.time': 'Zaman',
    'audit.user': 'Kullanıcı',
    'audit.action': 'İşlem',
    'audit.detail': 'Detay',
    'audit.noData': 'Henüz denetim kaydı yok.',
    'audit.clear': 'Temizle',
    'audit.export': 'Dışa Aktar',

    // Auth
    'auth.login': 'Giriş Yap',
    'auth.username': 'Kullanıcı Adı',
    'auth.password': 'Şifre',
    'auth.loginBtn': 'Giriş',
    'auth.logout': 'Çıkış',
    'auth.role': 'Rol',
    'auth.demoAccounts': 'Demo Hesaplar',
    'auth.accessDenied': 'Bu sayfaya erişim yetkiniz yok.',
    'auth.admin': 'Admin',
    'auth.manager': 'Yönetici',
    'auth.technician': 'Teknisyen',

    // Filtreler
    'filters.save': 'Filtreyi Kaydet',
    'filters.saved': 'Kayıtlı Filtreler',
    'filters.name': 'Filtre adı...',
    'filters.clear': 'Sıfırla',
    'filters.delete': 'Sil',
    'filters.noSaved': 'Kayıtlı filtre yok',

    // Toast
    'toast.clientAdded': 'Müşteri eklendi!',
    'toast.clientUpdated': 'Müşteri güncellendi!',
    'toast.clientDeleted': 'Müşteri silindi.',
    'toast.incidentCreated': 'Arıza kaydı oluşturuldu!',
    'toast.incidentResolved': 'Arıza çözüldü!',
    'toast.incidentUpdated': 'Arıza güncellendi!',
    'toast.noteAdded': 'Not eklendi!',
    'toast.saved': 'Kaydedildi!',
    'toast.permissionDenied': 'Bu işlem için yetkiniz yok.',

    // Varlık Yönetimi
    'assets.title': 'Varlık / Envanter Yönetimi',
    'assets.subtitle': 'Cihaz ve ekipman envanterini takip edin',
    'assets.new': 'Yeni Varlık',
    'assets.search': 'Varlık ara...',
    'assets.noData': 'Varlık bulunamadı.',

    // Hizmet Saati
    'timesheet.title': 'Hizmet Saati Takibi',
    'timesheet.subtitle': 'Teknisyen çalışma saatlerini kayıt edin',
    'timesheet.new': 'Süre Kaydet',
    'timesheet.noData': 'Henüz kayıt yok.',

    // Mesajlaşma
    'messaging.title': 'Dahili Mesajlaşma',
    'messaging.subtitle': 'Ekip içi iletişim',
    'messaging.newChannel': 'Yeni Kanal',
    'messaging.send': 'Gönder',

    // Kontrol Listeleri
    'checklists.title': 'Kontrol Listeleri',
    'checklists.subtitle': 'Şablonlardan kontrol listesi oluşturun ve takip edin',
    'checklists.new': 'Yeni Kontrol Listesi',
    'checklists.noData': 'Kontrol listesi bulunamadı.',

    // Maliyet Takibi
    'costtracking.title': 'Maliyet / Fatura Takibi',
    'costtracking.subtitle': 'Arıza maliyetlerini takip edin, fatura oluşturun',
    'costtracking.new': 'Maliyet Ekle',
    'costtracking.noData': 'Maliyet kaydı bulunamadı.',

    // Duyurular
    'announcements.title': 'Duyuru / İlan Panosu',
    'announcements.subtitle': 'Şirket içi duyuruları ve ilanları yönetin',
    'announcements.new': 'Yeni Duyuru',
    'announcements.noData': 'Duyuru bulunamadı.',

    // İletişim Geçmişi
    'contactlog.title': 'İletişim Geçmişi',
    'contactlog.subtitle': 'Müşteri iletişim kayıtlarını takip edin',
    'contactlog.new': 'Yeni İletişim',
    'contactlog.noData': 'İletişim kaydı bulunamadı.',

    // Canlı Akış
    'activityfeed.title': 'Canlı Akış',
    'activityfeed.subtitle': 'Tüm sistem olaylarını ve ekip paylaşımlarını takip edin',

    // İş Akışı Otomasyonu
    'workflowrules.title': 'İş Akışı Otomasyonu',
    'workflowrules.subtitle': 'If-then kurallarıyla otomatik bildirim ve aksiyonlar',

    // Doküman Yönetimi
    'documents.title': 'Doküman Yönetimi',
    'documents.subtitle': 'Dosya ve dokümanları yükleyin, kategorileyin ve yönetin',
    'documents.upload': 'Doküman Yükle',
    'documents.newFolder': 'Yeni Klasör',
    'documents.search': 'Doküman ara...',
    'documents.noData': 'Doküman bulunamadı.',
    'nav.documents': 'Dokümanlar',

    // Proje Yönetimi
    'projects.title': 'Proje Yönetimi',
    'projects.subtitle': 'Projeleri, görevleri ve zaman çizelgelerini yönetin',
    'nav.projects': 'Proje Yönetimi',

    // Teklif Yönetimi
    'quotations.title': 'Teklif Yönetimi',
    'quotations.subtitle': 'Teklifleri oluşturun, takip edin ve faturaya dönüştürün',
    'nav.quotations': 'Teklifler',

    // Modül Yönetimi
    'modules.title': 'Modül Yönetimi',
    'modules.subtitle': 'Modülleri açıp kapatarak sistemi özelleştirin',
    'nav.modules': 'Modüller',

    // Kümes Hesaplayıcı
    'kumescalculator.title': 'Kümes Hesaplayıcı',
    'kumescalculator.subtitle': 'Kümes boyutlarına göre malzeme ve maliyet hesaplayın',
    'nav.kumescalculator': 'Kümes Hesaplayıcı',
  },

  en: {
    // General
    'app.name': 'Scor-Pi',
    'app.loading': 'Loading dashboard...',
    'lang.tr': 'Türkçe',
    'lang.en': 'English',

    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.incidents': 'Incidents',
    'nav.clients': 'Clients',
    'nav.kanban': 'Kanban Board',
    'nav.analytics': 'Analytics',
    'nav.calendar': 'Calendar',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'nav.assets': 'Assets',
    'nav.timesheet': 'Timesheet',
    'nav.messaging': 'Messages',
    'nav.checklists': 'Checklists',
    'nav.costtracking': 'Cost Tracking',
    'nav.announcements': 'Announcements',
    'nav.contactlog': 'Contact Log',
    'nav.activityfeed': 'Activity Feed',
    'nav.workflowrules': 'Automation',
    'nav.general': 'General',
    'nav.workManagement': 'Work Management',
    'nav.resources': 'Resources',
    'nav.reporting': 'Reporting',

    // Dashboard
    'dashboard.greeting.morning': 'Good morning',
    'dashboard.greeting.afternoon': 'Good afternoon',
    'dashboard.greeting.evening': 'Good evening',
    'dashboard.greeting.night': 'Good night',
    'dashboard.activeIncidents': 'Active Incidents',
    'dashboard.resolvedToday': 'Resolved Today',
    'dashboard.overdue': 'Overdue',
    'dashboard.slaCompliance': 'SLA Compliance',
    'dashboard.avgResolution': 'Avg Resolution',
    'dashboard.clients': 'Clients',

    // Incidents
    'incidents.title': 'Incident Management',
    'incidents.subtitle': 'Track and manage all service requests',
    'incidents.new': 'New Incident',
    'incidents.search': 'Search incidents...',
    'incidents.status.all': 'All Statuses',
    'incidents.status.new': 'New',
    'incidents.status.in_progress': 'In Progress',
    'incidents.status.on_hold': 'On Hold',
    'incidents.status.resolved': 'Resolved',
    'incidents.status.cancelled': 'Cancelled',
    'incidents.priority.all': 'All Priorities',
    'incidents.priority.critical': 'Critical',
    'incidents.priority.medium': 'Medium',
    'incidents.priority.low': 'Low',
    'incidents.resolve': 'Resolve',
    'incidents.resolved': 'Resolved!',
    'incidents.noData': 'No incidents found.',

    // Clients
    'clients.title': 'Client Management',
    'clients.subtitle': 'View and manage client information',
    'clients.new': 'New Client',
    'clients.search': 'Search clients...',
    'clients.favorites': 'Favorites',
    'clients.noData': 'No clients found',
    'clients.edit': 'Edit Client',
    'clients.save': 'Save',
    'clients.cancel': 'Cancel',
    'clients.delete.confirm': 'Are you sure you want to delete',

    // Settings
    'settings.title': 'Settings',
    'settings.appearance': 'Appearance',
    'settings.darkMode': 'Dark Mode',
    'settings.language': 'Dil / Language',
    'settings.technicians': 'Technician Management',
    'settings.templates': 'Incident Templates',
    'settings.data': 'Data Management',
    'settings.auditLog': 'Audit Log',
    'settings.roles': 'Roles & User Management',
    'settings.about': 'About',

    // Audit log
    'audit.title': 'Audit Log',
    'audit.time': 'Time',
    'audit.user': 'User',
    'audit.action': 'Action',
    'audit.detail': 'Detail',
    'audit.noData': 'No audit records yet.',
    'audit.clear': 'Clear',
    'audit.export': 'Export',

    // Auth
    'auth.login': 'Sign In',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.loginBtn': 'Sign In',
    'auth.logout': 'Sign Out',
    'auth.role': 'Role',
    'auth.demoAccounts': 'Demo Accounts',
    'auth.accessDenied': 'You do not have permission to access this page.',
    'auth.admin': 'Admin',
    'auth.manager': 'Manager',
    'auth.technician': 'Technician',

    // Filters
    'filters.save': 'Save Filter',
    'filters.saved': 'Saved Filters',
    'filters.name': 'Filter name...',
    'filters.clear': 'Reset',
    'filters.delete': 'Delete',
    'filters.noSaved': 'No saved filters',

    // Toast
    'toast.clientAdded': 'Client added!',
    'toast.clientUpdated': 'Client updated!',
    'toast.clientDeleted': 'Client deleted.',
    'toast.incidentCreated': 'Incident created!',
    'toast.incidentResolved': 'Incident resolved!',
    'toast.incidentUpdated': 'Incident updated!',
    'toast.noteAdded': 'Note added!',
    'toast.saved': 'Saved!',
    'toast.permissionDenied': 'You do not have permission for this action.',

    // Asset Management
    'assets.title': 'Asset / Inventory Management',
    'assets.subtitle': 'Track devices and equipment inventory',
    'assets.new': 'New Asset',
    'assets.search': 'Search assets...',
    'assets.noData': 'No assets found.',

    // Timesheet
    'timesheet.title': 'Timesheet',
    'timesheet.subtitle': 'Track technician work hours',
    'timesheet.new': 'Log Time',
    'timesheet.noData': 'No entries yet.',

    // Messaging
    'messaging.title': 'Internal Messaging',
    'messaging.subtitle': 'Team communication',
    'messaging.newChannel': 'New Channel',
    'messaging.send': 'Send',

    // Checklists
    'checklists.title': 'Checklists',
    'checklists.subtitle': 'Create and track checklists from templates',
    'checklists.new': 'New Checklist',
    'checklists.noData': 'No checklists found.',

    // Cost Tracking
    'costtracking.title': 'Cost / Invoice Tracking',
    'costtracking.subtitle': 'Track incident costs and generate invoices',
    'costtracking.new': 'Add Cost',
    'costtracking.noData': 'No cost entries found.',

    // Announcements
    'announcements.title': 'Announcements Board',
    'announcements.subtitle': 'Manage company announcements and notices',
    'announcements.new': 'New Announcement',
    'announcements.noData': 'No announcements found.',

    // Contact Log
    'contactlog.title': 'Contact Log',
    'contactlog.subtitle': 'Track client communication history',
    'contactlog.new': 'New Contact',
    'contactlog.noData': 'No contact records found.',

    // Activity Feed
    'activityfeed.title': 'Activity Feed',
    'activityfeed.subtitle': 'Track all system events and team updates',

    // Workflow Automation
    'workflowrules.title': 'Workflow Automation',
    'workflowrules.subtitle': 'Define if-then rules for automatic notifications and actions',

    // Document Management
    'documents.title': 'Document Management',
    'documents.subtitle': 'Upload, categorize and manage your documents',
    'documents.upload': 'Upload Document',
    'documents.newFolder': 'New Folder',
    'documents.search': 'Search documents...',
    'documents.noData': 'No documents found.',
    'nav.documents': 'Documents',

    // Project Management
    'projects.title': 'Project Management',
    'projects.subtitle': 'Manage projects, tasks and timelines',
    'nav.projects': 'Project Management',

    // Quotation Management
    'quotations.title': 'Quotation Management',
    'quotations.subtitle': 'Create, track and convert quotations to invoices',
    'nav.quotations': 'Quotations',

    // Module Management
    'modules.title': 'Module Management',
    'modules.subtitle': 'Customize the system by enabling or disabling modules',
    'nav.modules': 'Modules',

    // Poultry House Calculator
    'kumescalculator.title': 'Poultry House Calculator',
    'kumescalculator.subtitle': 'Calculate materials and costs based on house dimensions',
    'nav.kumescalculator': 'House Calculator',
  },
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'tr');

  const t = useCallback((key, vars = {}) => {
    let str = translations[lang]?.[key] ?? translations['tr']?.[key] ?? key;
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(`{{${k}}}`, v);
    });
    return str;
  }, [lang]);

  const setLanguage = useCallback((newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  }, []);

  return (
    <I18nContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
