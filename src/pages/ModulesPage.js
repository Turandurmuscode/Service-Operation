import React, { useState, useEffect, useCallback } from 'react';
import './ModulesPage.css';

/* ════════════════════════════════════════════════════════════
   SVG ICONS
   ════════════════════════════════════════════════════════════ */
const Icons = {
  modules: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="10" y="1" width="5" height="5" rx="1"/><rect x="1" y="10" width="5" height="5" rx="1"/><rect x="10" y="10" width="5" height="5" rx="1"/></svg>,
  search: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14" strokeLinecap="round"/></svg>,
  reset: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 8a6 6 0 0110.5-4M14 8a6 6 0 01-10.5 4"/><path d="M12.5 1v3h-3M3.5 15v-3h3"/></svg>,
};

/* ════════════════════════════════════════════════════════════
   ALL AVAILABLE MODULES
   ════════════════════════════════════════════════════════════ */
const ALL_MODULES = [
  // Genel
  { id: 'dashboard',     label: 'Dashboard',          category: 'Genel',        description: 'Ana kontrol paneli ve özet görünüm', core: true },
  { id: 'incidents',     label: 'Arıza Yönetimi',     category: 'Genel',        description: 'Arıza ve servis talebi takibi' },
  { id: 'clients',       label: 'Müşteri Yönetimi',   category: 'Genel',        description: 'Müşteri bilgileri ve iletişim' },
  { id: 'contactlog',    label: 'İletişim Geçmişi',   category: 'Genel',        description: 'Müşteri iletişim kayıtları' },
  { id: 'announcements', label: 'Duyurular',          category: 'Genel',        description: 'Şirket içi duyuru paneli' },
  { id: 'activityfeed',  label: 'Canlı Akış',         category: 'Genel',        description: 'Gerçek zamanlı aktivite takibi' },
  { id: 'crmdeals',      label: 'CRM Fırsat Takibi',  category: 'Genel',        description: 'Lead, teklif ve kazanım pipeline yönetimi' },
  // İş Yönetimi
  { id: 'kanban',        label: 'Kanban Board',       category: 'İş Yönetimi',  description: 'Sürükle-bırak görev yönetimi' },
  { id: 'calendar',      label: 'Takvim',             category: 'İş Yönetimi',  description: 'Tarih bazlı planlama' },
  { id: 'timesheet',     label: 'Saat Takibi',        category: 'İş Yönetimi',  description: 'Çalışma saati kayıtları' },
  { id: 'checklists',    label: 'Kontrol Listeleri',  category: 'İş Yönetimi',  description: 'Şablon bazlı kontrol listeleri' },
  { id: 'projects',      label: 'Proje Yönetimi',     category: 'İş Yönetimi',  description: 'Gantt grafik ile proje takibi' },
  { id: 'scheduledmaintenance', label: 'Periyodik Bakım', category: 'İş Yönetimi', description: 'Planlı bakım takvimi' },
  // Kaynaklar
  { id: 'assets',        label: 'Envanter',           category: 'Kaynaklar',    description: 'Cihaz ve ekipman yönetimi' },
  { id: 'spareparts',    label: 'Yedek Parça',        category: 'Kaynaklar',    description: 'Yedek parça stok takibi' },
  { id: 'knowledgebase', label: 'Bilgi Bankası',      category: 'Kaynaklar',    description: 'Teknik doküman ve çözüm arşivi' },
  { id: 'documents',     label: 'Dokümanlar',         category: 'Kaynaklar',    description: 'Dosya yönetimi ve arşiv' },
  { id: 'remoteaccess',  label: 'Uzak Erişim',        category: 'Kaynaklar',    description: 'Uzaktan bağlantı yönetimi' },
  { id: 'messaging',     label: 'Mesajlar',           category: 'Kaynaklar',    description: 'Ekip içi mesajlaşma' },
  // Raporlama
  { id: 'analytics',     label: 'Analiz',             category: 'Raporlama',    description: 'Grafiksel analiz ve istatistik' },
  { id: 'reports',       label: 'Raporlar',           category: 'Raporlama',    description: 'Detaylı rapor oluşturma' },
  { id: 'costtracking',  label: 'Maliyet Takibi',     category: 'Raporlama',    description: 'Maliyet ve fatura takibi' },
  { id: 'contracts',     label: 'Sözleşmeler',        category: 'Raporlama',    description: 'Müşteri sözleşme yönetimi' },
  { id: 'quotations',    label: 'Teklifler',          category: 'Raporlama',    description: 'Teklif oluşturma ve takip' },
  { id: 'csat',          label: 'Müşteri Memnuniyeti', category: 'Raporlama',   description: 'Memnuniyet anketleri' },
  { id: 'techperformance', label: 'Teknisyen Performans', category: 'Raporlama', description: 'Teknisyen değerlendirme' },
  { id: 'sladashboard',  label: 'SLA Analizi',        category: 'Raporlama',    description: 'SLA uyum takibi' },
  // Sektörel
  { id: 'kumescalculator', label: 'Kümes Hesaplayıcı', category: 'Sektörel',   description: 'Kümes boyut → malzeme → fiyat hesabı' },
  // Saha & Süreç Zinciri
  { id: 'workorders',    label: 'İş Emirleri',          category: 'İş Yönetimi',  description: 'Teklif > İş Emri zinciri ve teknisyen atama' },
  { id: 'invoices',      label: 'Fatura Yönetimi',      category: 'Raporlama',    description: 'Fatura oluşturma, takip ve yazdırma' },
  { id: 'fieldteam',     label: 'Saha Ekip Yönetimi',  category: 'İş Yönetimi',  description: 'Teknisyen atama, check-in/out ve fotoğraf kanıt' },
  // Sistem (always enabled)
  { id: 'workflowrules', label: 'Otomasyon',            category: 'Sistem',       description: 'İş akışı kuralları', core: true },
  { id: 'rbac',          label: 'Yetki & Rol Matrisi', category: 'Sistem',       description: 'Departman bazlı ekran/aksiyon yetkileri', core: true },
  { id: 'integrations',  label: 'Entegrasyonlar',       category: 'Sistem',       description: 'Logo, Netsis, SAP, e-Fatura, WhatsApp, SMTP' },
  { id: 'settings',      label: 'Ayarlar',              category: 'Sistem',       description: 'Sistem ayarları', core: true },
  { id: 'modules',       label: 'Modül Yönetimi',       category: 'Sistem',       description: 'Modülleri aç/kapat', core: true },
];

const STORAGE_KEY = 'sod_enabled_modules';
const CATEGORIES = ['Genel', 'İş Yönetimi', 'Kaynaklar', 'Raporlama', 'Sektörel', 'Sistem'];

// Default enabled modules (all except new sektörel modules)
const DEFAULT_ENABLED = ALL_MODULES.filter(m => m.id !== 'kumescalculator').map(m => m.id);

/* ── Public helper used by Sidebar ── */
export function getEnabledModules() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_ENABLED;
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function ModulesPage({ darkMode }) {
  const [enabledModules, setEnabledModules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  useEffect(() => {
    setEnabledModules(getEnabledModules());
  }, []);

  const persist = useCallback((data) => {
    setEnabledModules(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Dispatch event so Sidebar can react in real-time
    window.dispatchEvent(new Event('modules-changed'));
  }, []);

  const toggleModule = (id) => {
    const mod = ALL_MODULES.find(m => m.id === id);
    if (mod?.core) return; // Core modules can't be disabled
    if (enabledModules.includes(id)) {
      persist(enabledModules.filter(x => x !== id));
    } else {
      persist([...enabledModules, id]);
    }
  };

  const enableAll = () => persist(ALL_MODULES.map(m => m.id));
  const disableAll = () => persist(ALL_MODULES.filter(m => m.core).map(m => m.id));
  const resetDefaults = () => persist(DEFAULT_ENABLED);

  const filtered = ALL_MODULES.filter(m => {
    if (filterCat !== 'all' && m.category !== filterCat) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return m.label.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
    }
    return true;
  });

  const grouped = CATEGORIES.map(cat => ({
    category: cat,
    modules: filtered.filter(m => m.category === cat),
  })).filter(g => g.modules.length > 0);

  const enabledCount = enabledModules.length;
  const totalCount = ALL_MODULES.length;

  return (
    <div className={`modules-page ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <div className="mod-page-header">
        <div className="mod-header-left">
          <h1>{Icons.modules(22)} Modül Yönetimi</h1>
          <p>Aktif modülleri yönetin — ihtiyacınız olmayan modülleri kapatarak arayüzü sadeleştirin</p>
        </div>
        <div className="mod-header-right">
          <span className="mod-counter">{enabledCount} / {totalCount} aktif</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mod-toolbar">
        <div className="mod-search-box">
          {Icons.search(14)}
          <input
            type="text"
            placeholder="Modül ara..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && <button className="mod-search-clear" onClick={() => setSearchTerm('')}>×</button>}
        </div>
        <select className="mod-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="all">Tüm Kategoriler</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="mod-toolbar-actions">
          <button className="mod-btn mod-btn-sm mod-btn-success" onClick={enableAll}>Tümünü Aç</button>
          <button className="mod-btn mod-btn-sm mod-btn-danger" onClick={disableAll}>Tümünü Kapat</button>
          <button className="mod-btn mod-btn-sm mod-btn-secondary" onClick={resetDefaults} title="Varsayılana dön">
            {Icons.reset(14)} Sıfırla
          </button>
        </div>
      </div>

      {/* Module Grid */}
      {grouped.map(group => (
        <div key={group.category} className="mod-category-section">
          <h3 className="mod-category-title">{group.category}</h3>
          <div className="mod-grid">
            {group.modules.map(mod => {
              const isEnabled = enabledModules.includes(mod.id);
              const isCore = mod.core;
              return (
                <div
                  key={mod.id}
                  className={`mod-card ${isEnabled ? 'enabled' : 'disabled'} ${isCore ? 'core' : ''}`}
                  onClick={() => toggleModule(mod.id)}
                >
                  <div className="mod-card-header">
                    <span className="mod-card-name">{mod.label}</span>
                    <div className={`mod-toggle ${isEnabled ? 'on' : 'off'} ${isCore ? 'locked' : ''}`}>
                      <div className="mod-toggle-knob" />
                    </div>
                  </div>
                  <p className="mod-card-desc">{mod.description}</p>
                  <div className="mod-card-footer">
                    <span className="mod-card-cat">{mod.category}</span>
                    {isCore && <span className="mod-card-core">Çekirdek</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="mod-empty">
          <p>Aramanızla eşleşen modül bulunamadı.</p>
        </div>
      )}
    </div>
  );
}
