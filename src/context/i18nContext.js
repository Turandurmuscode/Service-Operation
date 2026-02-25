import React, { createContext, useContext, useState, useCallback } from 'react';

// ── Çeviri sözlükleri ────────────────────────────────────────────
const translations = {
  tr: {
    // Genel
    'app.name': 'Servis Operasyon Paneli',
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
    'nav.general': 'Genel',
    'nav.workManagement': 'İş Yönetimi',
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
  },

  en: {
    // General
    'app.name': 'Service Operations Dashboard',
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
    'nav.general': 'General',
    'nav.workManagement': 'Work Management',
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
