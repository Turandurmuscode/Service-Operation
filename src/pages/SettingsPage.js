import React, { useRef, useState } from 'react';
import { useI18n } from '../context/i18nContext';
import AuditLogViewer from '../components/AuditLogViewer';
import { ROUTING_MODES, SKILL_OPTIONS, getRoutingMode, setRoutingMode } from '../utils/autoRouter';

const loadJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
};

const DEFAULT_TEMPLATES = {
  software: [
    'Uygulama açılmıyor / crash veriyor',
    'Güncelleme sonrası hata alınıyor',
    'Lisans sorunu / aktivasyon hatası',
    'Yavaş çalışma / performans sorunu',
  ],
  hardware: [
    'Bilgisayar açılmıyor',
    'Ekran görüntüsü yok / monitör sorunu',
    'Klavye / mouse çalışmıyor',
    'Printer / yazıcı bağlantı sorunu',
  ],
  network: [
    'İnternet bağlantısı yok',
    'VPN bağlanamıyor',
    'Paylaşım ağına erişilemiyor',
    'DNS / IP yapılandırma sorunu',
  ],
  other: [
    'Genel teknik destek talebi',
    'Kullanıcı şifresi sıfırlama',
    'E-posta yapılandırma sorunu',
    'Yeni cihaz kurulumu',
  ],
};

function SettingsPage({
  darkMode, toggleDarkMode, showToast,
  clients, incidents, activities,
  setClients, setIncidents, setActivities,
}) {
  const importRef = useRef(null);
  const { language, setLanguage } = useI18n();

  // ── Teknisyenler ──
  const [technicians, setTechnicians] = useState(() => loadJSON('technicians', []));
  const [techName,  setTechName]  = useState('');
  const [techRole,  setTechRole]  = useState('Teknisyen');
  const [techSkills, setTechSkills] = useState([]);

  // ── Routing mode ──
  const [routingMode, setRoutingModeState] = useState(() => getRoutingMode());

  const handleRoutingModeChange = (mode) => {
    setRoutingMode(mode);
    setRoutingModeState(mode);
    if (showToast) showToast(`✅ Atama modu: ${ROUTING_MODES[mode]?.label}`, 'success');
  };

  const toggleTechSkill = (skill) => {
    setTechSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const saveTechnicians = (list) => {
    setTechnicians(list);
    localStorage.setItem('technicians', JSON.stringify(list));
  };

  const addTechnician = () => {
    if (!techName.trim()) return;
    saveTechnicians([...technicians, { id: Date.now(), name: techName.trim(), role: techRole, skills: techSkills }]);
    setTechName(''); setTechSkills([]);
    if (showToast) showToast('✅ Teknisyen eklendi!', 'success');
  };

  const deleteTechnician = (id) => {
    saveTechnicians(technicians.filter(t => t.id !== id));
    if (showToast) showToast('🗑️ Teknisyen silindi.', 'warning');
  };

  // ── Şablon açıklamalar ──
  const [templates, setTemplates] = useState(() => loadJSON('incidentTemplates', DEFAULT_TEMPLATES));
  const [activeCategory, setActiveCategory] = useState('software');
  const [newTemplate, setNewTemplate] = useState('');

  const saveTemplates = (updated) => {
    setTemplates(updated);
    localStorage.setItem('incidentTemplates', JSON.stringify(updated));
  };

  const addTemplate = () => {
    if (!newTemplate.trim()) return;
    saveTemplates({ ...templates, [activeCategory]: [...(templates[activeCategory] || []), newTemplate.trim()] });
    setNewTemplate('');
    if (showToast) showToast('✅ Şablon eklendi!', 'success');
  };

  const deleteTemplate = (cat, idx) => {
    saveTemplates({ ...templates, [cat]: templates[cat].filter((_, i) => i !== idx) });
  };

  const categoryLabels = {
    software: '💻 Yazılım',
    hardware: '🖥️ Donanım',
    network:  '🌐 Network',
    other:    '📦 Diğer',
  };

  // ── Yedekleme ──
  const handleBackup = () => {
    const data = {
      clients:           loadJSON('clients', []),
      incidents:         loadJSON('incidents', []),
      activities:        loadJSON('activities', []),
      technicians:       loadJSON('technicians', []),
      incidentTemplates: loadJSON('incidentTemplates', DEFAULT_TEMPLATES),
      darkMode:          loadJSON('darkMode', false),
      exportDate:        new Date().toISOString(),
      version: '1.1',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `servis-panel-yedek-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (showToast) showToast('✅ Yedek dosyası indirildi!', 'success');
  };

  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.clients || !data.incidents) { if (showToast) showToast('❌ Geçersiz yedek!', 'error'); return; }
        localStorage.setItem('clients',           JSON.stringify(data.clients));
        localStorage.setItem('incidents',         JSON.stringify(data.incidents));
        localStorage.setItem('activities',        JSON.stringify(data.activities || []));
        localStorage.setItem('technicians',       JSON.stringify(data.technicians || []));
        localStorage.setItem('incidentTemplates', JSON.stringify(data.incidentTemplates || DEFAULT_TEMPLATES));
        if (data.darkMode !== undefined) localStorage.setItem('darkMode', JSON.stringify(data.darkMode));
        if (showToast) showToast('✅ Veriler geri yüklendi! Sayfa yenilenecek...', 'success');
        setTimeout(() => window.location.reload(), 1800);
      } catch (err) { if (showToast) showToast('❌ Dosya okunamadı: ' + err.message, 'error'); }
    };
    reader.readAsText(file);
    if (importRef.current) importRef.current.value = '';
  };

  const handleClearAll = () => {
    if (!window.confirm('Tüm veriler silinecek! Geri alınamaz.')) return;
    ['clients', 'incidents', 'activities', 'technicians', 'incidentTemplates'].forEach(k => localStorage.removeItem(k));
    if (showToast) showToast('🗑️ Tüm veriler silindi!', 'warning');
    setTimeout(() => window.location.reload(), 1500);
  };

  const storageSizeKB = () => {
    let total = 0;
    ['clients', 'incidents', 'activities', 'technicians', 'incidentTemplates'].forEach(k => { total += (localStorage.getItem(k) || '').length; });
    return (total / 1024).toFixed(1);
  };

  const inputStyle = {
    flex: 1, padding: '8px 12px', borderRadius: '8px', fontSize: '13px',
    border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)', color: 'var(--text-primary)',
  };
  const tagStyle = (color) => ({
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '7px 12px', borderRadius: '8px', fontSize: '13px',
    background: `${color}15`, border: `1px solid ${color}30`, marginBottom: '6px',
  });
  const xBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '16px', padding: '2px 6px' };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>⚙️ Ayarlar</h1>
        <p>Uygulama ayarlarını yönet</p>
      </div>

      {/* Görünüm */}
      <div className="card">
        <h2>🎨 Görünüm</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Karanlık Mod</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Göz yorgunluğunu azaltır</div>
          </div>
          <button className={`btn ${darkMode ? 'btn-warning' : 'btn-secondary'}`} onClick={toggleDarkMode}>
            {darkMode ? '☀️ Aydınlık' : '🌙 Karanlık'}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Dil / Language</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Uygulama dilini seçin</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn ${language === 'tr' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setLanguage('tr')}
            >🇹🇷 Türkce</button>
            <button
              className={`btn ${language === 'en' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setLanguage('en')}
            >🇬🇧 English</button>
          </div>
        </div>
      </div>

      {/* Teknisyen Yönetimi */}
      <div className="card" style={{ marginTop: '16px' }}>
        <h2>👷 Teknisyen Yönetimi</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Arızalara atanabilecek teknisyenleri buradan yönetin.
        </p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            style={inputStyle}
            placeholder="Ad Soyad..."
            value={techName}
            onChange={e => setTechName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTechnician()}
          />
          <select style={{ ...inputStyle, flex: '0 0 170px' }} value={techRole} onChange={e => setTechRole(e.target.value)}>
            <option>Teknisyen</option>
            <option>Kıdemli Teknisyen</option>
            <option>Network Uzmanı</option>
            <option>Yazılım Uzmanı</option>
            <option>Saha Teknisyeni</option>
          </select>
          <button className="btn btn-primary" onClick={addTechnician}>+ Ekle</button>
        </div>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Yetenekler:</span>
          {SKILL_OPTIONS.map(s => (
            <button key={s.value} type="button" onClick={() => toggleTechSkill(s.value)} style={{
              padding: '3px 10px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer',
              border: '1px solid var(--border-strong)',
              background: techSkills.includes(s.value) ? 'var(--accent)' : 'var(--bg-elevated)',
              color: techSkills.includes(s.value) ? '#000' : 'var(--text-secondary)',
              fontWeight: techSkills.includes(s.value) ? '700' : '400',
            }}>{s.label}</button>
          ))}
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(boş = tümüne uygun)</span>
        </div>

        {technicians.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>Henüz teknisyen eklenmedi.</p>
        ) : technicians.map(tech => (
          <div key={tech.id} style={tagStyle('#3b82f6')}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: '#3b82f620', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '700', fontSize: '13px', color: '#3b82f6',
            }}>
              {tech.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600' }}>{tech.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{tech.role}</div>
              {tech.skills?.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                  {tech.skills.map(s => {
                    const label = SKILL_OPTIONS.find(o => o.value === s)?.label || s;
                    return (
                      <span key={s} style={{
                        padding: '1px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: '600',
                        background: 'var(--accent)', color: '#000',
                      }}>{label}</span>
                    );
                  })}
                </div>
              )}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: '8px' }}>
              {(incidents || []).filter(i => i.technicianId === tech.id && i.status !== 'resolved').length} aktif arıza
            </div>
            <button style={xBtn} onClick={() => deleteTechnician(tech.id)}>✕</button>
          </div>
        ))}
      </div>

      {/* Otomatik Atama */}
      <div className="card" style={{ marginTop: '16px' }}>
        <h2>🎯 Otomatik Atama (Auto-Routing)</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Yeni arıza oluşturulunca teknisyen otomatik atama modu.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
          {Object.entries(ROUTING_MODES).map(([key, mode]) => {
            const active = routingMode === key;
            return (
              <button key={key} type="button" onClick={() => handleRoutingModeChange(key)} style={{
                padding: '14px 12px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                border: `2px solid ${active ? 'var(--primary)' : 'var(--border-strong)'}`,
                background: active ? 'var(--primary)15' : 'var(--bg-elevated)',
                color: 'var(--text-primary)', transition: 'all 0.15s',
                boxShadow: active ? '0 0 0 2px var(--primary)30' : 'none',
              }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{mode.icon}</div>
                <div style={{ fontWeight: active ? '700' : '600', fontSize: '13px' }}>{mode.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>{mode.desc}</div>
              </button>
            );
          })}
        </div>
        {routingMode === 'skill_based' && (
          <div style={{
            padding: '10px 14px', borderRadius: '8px', fontSize: '12px',
            background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#8b5cf6',
          }}>
            ℹ️ Teknisyene yetenek eklemediyseniz tüm arızalara atanabilir (zayıf eşleşme). Yukarıdan teknisyenlerin yeteneklerini ayarlayın.
          </div>
        )}
      </div>

      {/* Şablon Açıklamalar */}
      <div className="card" style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ margin: 0 }}>📝 Şablon Açıklamalar</h2>
          <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '4px 10px' }} onClick={() => { saveTemplates(DEFAULT_TEMPLATES); if (showToast) showToast('↩️ Sıfırlandı.', 'success'); }}>
            ↩️ Sıfırla
          </button>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Arıza oluştururken kategori seçilince bu şablonlar otomatik önerilir.
        </p>

        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {Object.keys(categoryLabels).map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
              background: activeCategory === cat ? 'var(--accent)' : 'var(--bg-elevated)',
              color: activeCategory === cat ? '#000' : 'var(--text-secondary)',
            }}>
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        {(templates[activeCategory] || []).length === 0 && (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '8px 0' }}>Bu kategoride şablon yok.</p>
        )}
        {(templates[activeCategory] || []).map((tpl, idx) => (
          <div key={idx} style={tagStyle('#10b981')}>
            <span style={{ flex: 1, fontSize: '13px' }}>📌 {tpl}</span>
            <button style={xBtn} onClick={() => deleteTemplate(activeCategory, idx)}>✕</button>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <input
            style={inputStyle}
            placeholder="Yeni şablon ekle..."
            value={newTemplate}
            onChange={e => setNewTemplate(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTemplate()}
          />
          <button className="btn btn-primary" onClick={addTemplate}>+ Ekle</button>
        </div>
      </div>

      {/* Veri Yedekleme */}
      <div className="card" style={{ marginTop: '16px' }}>
        <h2>💾 Veri Yedekleme & Geri Yükleme</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Verilerinizi JSON dosyası olarak yedekleyin. Tarayıcı önbelleği temizlenirse veriler silinebilir.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <button onClick={handleBackup} className="btn btn-primary">📥 Yedek Al (JSON)</button>
          <label className="btn btn-warning" style={{ cursor: 'pointer' }}>
            📤 Yedeği Geri Yükle
            <input ref={importRef} type="file" accept=".json" onChange={handleRestore} style={{ display: 'none' }} />
          </label>
          <button onClick={handleClearAll} className="btn btn-danger">🗑️ Tüm Verileri Sil</button>
        </div>
        <div style={{ padding: '10px 14px', background: 'rgba(59,130,246,0.08)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <strong>📊 Depolama:</strong> &nbsp;
          {(clients || []).length} müşteri · {(incidents || []).length} arıza · {technicians.length} teknisyen · ~{storageSizeKB()} KB
        </div>
      </div>

      {/* Denetim Logu */}
      <div className="card" style={{ marginTop: '16px' }}>
        <h2>📋 Denetim Logu</h2>
        <AuditLogViewer />
      </div>

      {/* Hakkında */}
      <div className="card" style={{ marginTop: '16px' }}>
        <h2>ℹ️ Hakkında</h2>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <p><strong>Servis Operasyon Paneli</strong></p>
          <p>Versiyon: 1.1.0</p>
          <p>Müşteri destek ve arıza takip sistemi</p>
          <p style={{ marginTop: '12px' }}>©Sphenyx 2026 Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;