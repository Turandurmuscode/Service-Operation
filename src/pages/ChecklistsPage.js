import React, { useState, useEffect, useCallback } from 'react';
import './ChecklistsPage.css';

const DEFAULT_TEMPLATES = [
  {
    id: 'tpl_software', name: 'Yazılım Arıza Çözüm', category: 'software', color: '#3b82f6',
    items: [
      'Sorun tanımını müşteriden al',
      'Hata loglarını kontrol et',
      'Yazılım sürümünü doğrula',
      'Güncelleme / patch uygula',
      'Yapılandırma dosyalarını kontrol et',
      'Servisleri yeniden başlat',
      'Test et ve doğrula',
      'Müşteriye bilgi ver',
    ],
  },
  {
    id: 'tpl_hardware', name: 'Donanım Arıza Çözüm', category: 'hardware', color: '#f59e0b',
    items: [
      'Cihaz bilgilerini ve garanti durumunu kontrol et',
      'Fiziksel hasar kontrolü yap',
      'Kablo ve bağlantıları kontrol et',
      'Teşhis aracını çalıştır',
      'Arızalı parçayı tespit et',
      'Yedek parça durumunu kontrol et',
      'Parça değişimi / onarım yap',
      'Fonksiyonel test yap',
      'Garanti kaydını güncelle',
    ],
  },
  {
    id: 'tpl_network', name: 'Ağ Sorun Giderme', category: 'network', color: '#8b5cf6',
    items: [
      'Fiziksel bağlantıları kontrol et',
      'IP yapılandırmasını doğrula',
      'Ping / traceroute testi yap',
      'DNS çözümleme kontrolü',
      'Güvenlik duvarı kurallarını kontrol et',
      'Switch / router loglarını incele',
      'Bant genişliği testi yap',
      'Bağlantıyı doğrula ve belge oluştur',
    ],
  },
  {
    id: 'tpl_onboarding', name: 'Yeni Müşteri Kurulum', category: 'procedure', color: '#10b981',
    items: [
      'Müşteri bilgilerini sisteme gir',
      'Sözleşme ve SLA seviyesini belirle',
      'İletişim kişilerini kaydet',
      'Envantere cihazları ekle',
      'Uzak erişim yapılandır',
      'Yedekleme planı oluştur',
      'Acil durum prosedürlerini paylaş',
      'Hoş geldin e-postası gönder',
    ],
  },
  {
    id: 'tpl_maintenance', name: 'Periyodik Bakım', category: 'maintenance', color: '#06b6d4',
    items: [
      'Sistem güncellemelerini kontrol et',
      'Disk alanı ve performans kontrolü',
      'Güvenlik taraması yap',
      'Yedekleme doğrulaması',
      'Log dosyalarını temizle',
      'Lisans durumlarını kontrol et',
      'Donanım sağlık kontrolü',
      'Bakım raporunu oluştur',
    ],
  },
];

function ChecklistsPage({ incidents, clients, currentUser, showToast }) {
  const [templates, setTemplates] = useState([]);
  const [activeChecklists, setActiveChecklists] = useState([]);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({ name: '', category: 'software', items: '' });
  const [tab, setTab] = useState('active'); // active | templates
  const [search, setSearch] = useState('');

  // Load
  useEffect(() => {
    const savedTemplates = localStorage.getItem('checklistTemplates');
    const savedChecklists = localStorage.getItem('activeChecklists');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      setTemplates(DEFAULT_TEMPLATES);
      localStorage.setItem('checklistTemplates', JSON.stringify(DEFAULT_TEMPLATES));
    }
    if (savedChecklists) setActiveChecklists(JSON.parse(savedChecklists));
  }, []);

  const saveTemplates = useCallback((updated) => {
    setTemplates(updated);
    localStorage.setItem('checklistTemplates', JSON.stringify(updated));
  }, []);

  const saveChecklists = useCallback((updated) => {
    setActiveChecklists(updated);
    localStorage.setItem('activeChecklists', JSON.stringify(updated));
  }, []);

  // Start a checklist from a template
  const startChecklist = (template, incidentId = '') => {
    const newChecklist = {
      id: Date.now(),
      templateId: template.id,
      templateName: template.name,
      category: template.category,
      color: template.color,
      incidentId: incidentId || null,
      items: template.items.map((text, i) => ({ id: i, text, checked: false, checkedAt: null, checkedBy: null })),
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'System',
      completedAt: null,
    };
    const updated = [newChecklist, ...activeChecklists];
    saveChecklists(updated);
    setSelectedChecklist(newChecklist);
    setTab('active');
    showToast('Kontrol listesi başlatıldı!', 'success');
  };

  // Toggle item
  const toggleItem = (checklistId, itemId) => {
    const updated = activeChecklists.map(cl => {
      if (cl.id !== checklistId) return cl;
      const items = cl.items.map(item => {
        if (item.id !== itemId) return item;
        const checked = !item.checked;
        return { ...item, checked, checkedAt: checked ? new Date().toISOString() : null, checkedBy: checked ? currentUser?.name : null };
      });
      const allDone = items.every(i => i.checked);
      return { ...cl, items, completedAt: allDone ? new Date().toISOString() : null };
    });
    saveChecklists(updated);
    const updatedCl = updated.find(cl => cl.id === checklistId);
    setSelectedChecklist(updatedCl);
    if (updatedCl?.completedAt) {
      showToast('Kontrol listesi tamamlandı! ✅', 'success');
    }
  };

  // Delete checklist
  const deleteChecklist = (id) => {
    if (!window.confirm('Bu kontrol listesini silmek istediğinize emin misiniz?')) return;
    saveChecklists(activeChecklists.filter(cl => cl.id !== id));
    if (selectedChecklist?.id === id) setSelectedChecklist(null);
    showToast('Kontrol listesi silindi.', 'warning');
  };

  // Template CRUD
  const handleTemplateSubmit = (e) => {
    e.preventDefault();
    if (!templateForm.name.trim() || !templateForm.items.trim()) {
      showToast('İsim ve adımlar zorunludur.', 'error');
      return;
    }
    const items = templateForm.items.split('\n').map(s => s.trim()).filter(Boolean);
    if (items.length < 2) {
      showToast('En az 2 adım girilmelidir.', 'error');
      return;
    }
    if (editingTemplate) {
      const updated = templates.map(t => t.id === editingTemplate.id
        ? { ...t, name: templateForm.name, category: templateForm.category, items }
        : t);
      saveTemplates(updated);
      showToast('Şablon güncellendi!', 'success');
    } else {
      const newTpl = {
        id: `tpl_${Date.now()}`, name: templateForm.name, category: templateForm.category,
        color: { software: '#3b82f6', hardware: '#f59e0b', network: '#8b5cf6', procedure: '#10b981', maintenance: '#06b6d4', other: '#94a3b8' }[templateForm.category] || '#3b82f6',
        items,
      };
      saveTemplates([...templates, newTpl]);
      showToast('Şablon oluşturuldu!', 'success');
    }
    setTemplateForm({ name: '', category: 'software', items: '' });
    setEditingTemplate(null);
    setShowTemplateForm(false);
  };

  const editTemplate = (tpl) => {
    setEditingTemplate(tpl);
    setTemplateForm({ name: tpl.name, category: tpl.category, items: tpl.items.join('\n') });
    setShowTemplateForm(true);
  };

  const deleteTemplate = (id) => {
    if (DEFAULT_TEMPLATES.find(t => t.id === id)) {
      showToast('Varsayılan şablonlar silinemez.', 'error');
      return;
    }
    if (!window.confirm('Bu şablonu silmek istediğinize emin misiniz?')) return;
    saveTemplates(templates.filter(t => t.id !== id));
    showToast('Şablon silindi.', 'warning');
  };

  // Helpers
  const getIncidentLabel = (incidentId) => {
    if (!incidentId) return null;
    const inc = incidents.find(i => i.id === parseInt(incidentId));
    if (!inc) return 'Bilinmeyen arıza';
    const client = clients.find(c => c.id === inc.clientId);
    return `${client?.name || 'Müşteri'}: ${inc.description?.slice(0, 40)}`;
  };

  const getProgress = (items) => {
    const done = items.filter(i => i.checked).length;
    return { done, total: items.length, pct: Math.round((done / items.length) * 100) };
  };

  // Filter active checklists
  const filteredChecklists = activeChecklists.filter(cl => {
    if (!search) return true;
    return cl.templateName.toLowerCase().includes(search.toLowerCase()) ||
      getIncidentLabel(cl.incidentId)?.toLowerCase().includes(search.toLowerCase());
  });

  const pendingCount = activeChecklists.filter(cl => !cl.completedAt).length;
  const completedCount = activeChecklists.filter(cl => cl.completedAt).length;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Kontrol Listeleri</h1>
          <p className="page-subtitle">Arıza çözüm adımlarını şablon bazlı takip edin</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="cl-tabs">
        <button className={`cl-tab ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>
          Aktif Listeler
          {pendingCount > 0 && <span className="cl-tab-badge">{pendingCount}</span>}
        </button>
        <button className={`cl-tab ${tab === 'completed' ? 'active' : ''}`} onClick={() => setTab('completed')}>
          Tamamlananlar
          {completedCount > 0 && <span className="cl-tab-badge done">{completedCount}</span>}
        </button>
        <button className={`cl-tab ${tab === 'templates' ? 'active' : ''}`} onClick={() => setTab('templates')}>
          Şablonlar ({templates.length})
        </button>
      </div>

      {/* ─── ACTIVE CHECKLISTS ─── */}
      {(tab === 'active' || tab === 'completed') && (
        <div className="cl-layout">
          <div className="cl-list-panel">
            <div className="cl-toolbar">
              <input type="text" placeholder="Kontrol listesi ara..." className="filter-input"
                value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
            </div>

            {filteredChecklists.filter(cl => tab === 'active' ? !cl.completedAt : !!cl.completedAt).length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="44" height="44" style={{ opacity: 0.2 }}>
                  <path d="M9 11l3 3 8-8M4 4h16v16H4V4Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p>{tab === 'active' ? 'Aktif kontrol listesi yok. Şablonlardan başlatabilirsiniz.' : 'Tamamlanmış kontrol listesi yok.'}</p>
              </div>
            ) : (
              <div className="cl-cards">
                {filteredChecklists
                  .filter(cl => tab === 'active' ? !cl.completedAt : !!cl.completedAt)
                  .map(cl => {
                    const progress = getProgress(cl.items);
                    return (
                      <div
                        key={cl.id}
                        className={`cl-card ${selectedChecklist?.id === cl.id ? 'selected' : ''} ${cl.completedAt ? 'completed' : ''}`}
                        onClick={() => setSelectedChecklist(cl)}
                      >
                        <div className="cl-card-header">
                          <div className="cl-card-color" style={{ background: cl.color }} />
                          <div className="cl-card-info">
                            <div className="cl-card-name">{cl.templateName}</div>
                            {cl.incidentId && (
                              <div className="cl-card-incident">🔧 {getIncidentLabel(cl.incidentId)}</div>
                            )}
                          </div>
                        </div>
                        <div className="cl-progress-bar">
                          <div className="cl-progress-fill" style={{ width: `${progress.pct}%`, background: cl.completedAt ? '#10b981' : cl.color }} />
                        </div>
                        <div className="cl-card-footer">
                          <span className="cl-card-progress">{progress.done}/{progress.total}</span>
                          <span className="cl-card-date">{new Date(cl.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selectedChecklist && (
            <div className="cl-detail-panel">
              <div className="cl-detail-header">
                <div>
                  <h3 style={{ color: selectedChecklist.color }}>{selectedChecklist.templateName}</h3>
                  {selectedChecklist.incidentId && (
                    <div className="cl-detail-incident">🔧 {getIncidentLabel(selectedChecklist.incidentId)}</div>
                  )}
                  <div className="cl-detail-meta">
                    {selectedChecklist.createdBy} • {new Date(selectedChecklist.createdAt).toLocaleDateString('tr-TR')}
                    {selectedChecklist.completedAt && (
                      <span className="cl-completed-badge">✅ Tamamlandı — {new Date(selectedChecklist.completedAt).toLocaleString('tr-TR')}</span>
                    )}
                  </div>
                </div>
                <div className="cl-detail-actions">
                  <button className="btn-icon delete" title="Sil" onClick={() => deleteChecklist(selectedChecklist.id)}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                      <path d="M3 4h10M6 4V3h4v1M5 4v9h6V4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button className="modal-close" onClick={() => setSelectedChecklist(null)}>✕</button>
                </div>
              </div>

              {/* Progress */}
              {(() => {
                const p = getProgress(selectedChecklist.items);
                return (
                  <div className="cl-detail-progress">
                    <div className="cl-progress-bar large">
                      <div className="cl-progress-fill" style={{ width: `${p.pct}%`, background: selectedChecklist.completedAt ? '#10b981' : selectedChecklist.color }} />
                    </div>
                    <span className="cl-progress-label">{p.pct}% ({p.done}/{p.total})</span>
                  </div>
                );
              })()}

              {/* Items */}
              <div className="cl-items">
                {selectedChecklist.items.map(item => (
                  <div key={item.id} className={`cl-item ${item.checked ? 'checked' : ''}`}
                    onClick={() => !selectedChecklist.completedAt && toggleItem(selectedChecklist.id, item.id)}>
                    <div className={`cl-checkbox ${item.checked ? 'checked' : ''}`}>
                      {item.checked && (
                        <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2.5" width="10" height="10">
                          <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div className="cl-item-content">
                      <span className="cl-item-text">{item.text}</span>
                      {item.checked && item.checkedBy && (
                        <span className="cl-item-meta">{item.checkedBy} — {new Date(item.checkedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TEMPLATES ─── */}
      {tab === 'templates' && (
        <div className="cl-templates-section">
          <div className="cl-templates-toolbar">
            <button className="btn btn-primary" onClick={() => { setShowTemplateForm(true); setEditingTemplate(null); setTemplateForm({ name: '', category: 'software', items: '' }); }}>
              + Yeni Şablon
            </button>
          </div>

          <div className="cl-templates-grid">
            {templates.map(tpl => (
              <div key={tpl.id} className="cl-template-card">
                <div className="cl-template-header" style={{ borderTopColor: tpl.color }}>
                  <h4>{tpl.name}</h4>
                  <span className="cl-template-count">{tpl.items.length} adım</span>
                </div>
                <ul className="cl-template-items">
                  {tpl.items.slice(0, 4).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                  {tpl.items.length > 4 && (
                    <li className="more">+{tpl.items.length - 4} adım daha...</li>
                  )}
                </ul>
                <div className="cl-template-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => startChecklist(tpl)}>
                    ▶ Başlat
                  </button>
                  <select className="cl-start-with-incident" onChange={(e) => { if (e.target.value) { startChecklist(tpl, e.target.value); e.target.value = ''; } }}>
                    <option value="">Arıza ile başlat...</option>
                    {incidents.filter(i => i.status !== 'resolved' && i.status !== 'cancelled').map(inc => {
                      const cl = clients.find(c => c.id === inc.clientId);
                      return <option key={inc.id} value={inc.id}>{cl?.name}: {inc.description?.slice(0, 35)}</option>;
                    })}
                  </select>
                  <div className="cl-template-edit-btns">
                    <button className="btn-icon" title="Düzenle" onClick={() => editTemplate(tpl)}>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13"><path d="M11 2l3 3-8 8H3v-3l8-8z" strokeLinejoin="round" /></svg>
                    </button>
                    <button className="btn-icon delete" title="Sil" onClick={() => deleteTemplate(tpl.id)}>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13"><path d="M3 4h10M6 4V3h4v1M5 4v9h6V4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template Form Modal */}
      {showTemplateForm && (
        <div className="modal-overlay" onClick={() => setShowTemplateForm(false)}>
          <div className="modal-content cl-template-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTemplate ? 'Şablon Düzenle' : 'Yeni Şablon'}</h2>
              <button className="modal-close" onClick={() => setShowTemplateForm(false)}>✕</button>
            </div>
            <form onSubmit={handleTemplateSubmit} className="cl-template-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Şablon Adı *</label>
                  <input type="text" value={templateForm.name} onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })}
                    placeholder="ör: Sunucu Bakım Kontrol Listesi" required />
                </div>
                <div className="form-group">
                  <label>Kategori</label>
                  <select value={templateForm.category} onChange={e => setTemplateForm({ ...templateForm, category: e.target.value })}>
                    <option value="software">💿 Yazılım</option>
                    <option value="hardware">🔧 Donanım</option>
                    <option value="network">🌐 Ağ</option>
                    <option value="procedure">📋 Prosedür</option>
                    <option value="maintenance">⚙️ Bakım</option>
                    <option value="other">📦 Diğer</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Kontrol Adımları * <span className="hint">(her satıra bir adım)</span></label>
                <textarea value={templateForm.items} onChange={e => setTemplateForm({ ...templateForm, items: e.target.value })}
                  rows={10} placeholder="Adım 1&#10;Adım 2&#10;Adım 3&#10;..." required />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTemplateForm(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">{editingTemplate ? 'Güncelle' : 'Kaydet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChecklistsPage;
