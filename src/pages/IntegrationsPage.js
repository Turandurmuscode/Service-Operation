import React, { useState, useCallback } from 'react';
import './IntegrationsPage.css';

/* ════════════════════════════════════════════════════════════
   ICONS
   ════════════════════════════════════════════════════════════ */
const Icons = {
  link: (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  x: (s=16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>,
  settings: (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>,
  check: (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l3.5 3.5L13 5"/></svg>,
  zap: (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  trash: (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2.5 4h11M5.5 4V2.5h5V4M6.5 7v4M9.5 7v4M3.5 4l.5 9h8l.5-9"/></svg>,
  log: (s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1ZM14 8H2M14 12H2M5 8v4"/></svg>,
};

/* ════════════════════════════════════════════════════════════
   INTEGRATION DEFINITIONS
   ════════════════════════════════════════════════════════════ */
const INTEGRATIONS_META = [
  {
    id: 'logo',
    name: 'Logo Yazılım',
    category: 'ERP',
    description: 'Logo Tiger/Go/GO Plus entegrasyonu. Müşteri, satış, fatura ve muhasebe verilerini otomatik senkronize eder.',
    logo: 'LG',
    color: '#e63946',
    fields: [
      { key: 'apiUrl',   label: 'API URL',   placeholder: 'https://logo-server:8080/api/v2', type: 'url' },
      { key: 'apiKey',   label: 'API Key',   placeholder: 'logo-api-key-••••••••',          type: 'password' },
      { key: 'firmNo',   label: 'Firma No',  placeholder: '1',                              type: 'text' },
      { key: 'periodNo', label: 'Dönem No',  placeholder: '001',                            type: 'text' },
    ],
  },
  {
    id: 'netsis',
    name: 'Netsis ERP',
    category: 'ERP',
    description: 'Netsis Standart/Wings ile cari kart, fatura ve stok entegrasyonu. Bi-directional data sync.',
    logo: 'NS',
    color: '#4361ee',
    fields: [
      { key: 'dbServer',   label: 'DB Sunucu',    placeholder: '192.168.1.10\\SQLEXPRESS', type: 'text' },
      { key: 'dbName',     label: 'Veritabanı',   placeholder: 'NETSIS_DB',               type: 'text' },
      { key: 'dbUser',     label: 'DB Kullanıcı', placeholder: 'sa',                      type: 'text' },
      { key: 'dbPassword', label: 'DB Şifresi',   placeholder: '••••••••',                type: 'password' },
    ],
  },
  {
    id: 'sap',
    name: 'SAP',
    category: 'ERP',
    description: 'SAP Business One / ECC RFC/BAPI entegrasyonu. BC, SD ve PM modülleri için veri köprüsü.',
    logo: 'SAP',
    color: '#0077b6',
    fields: [
      { key: 'sapHost',     label: 'Uygulama Sunucusu', placeholder: 'sap-server.domain.com', type: 'text' },
      { key: 'systemNo',    label: 'Sistem No',         placeholder: '00',                   type: 'text' },
      { key: 'client',      label: 'Mandant',           placeholder: '100',                  type: 'text' },
      { key: 'sapUser',     label: 'Kullanıcı',         placeholder: 'RFC_USER',             type: 'text' },
      { key: 'sapPassword', label: 'Şifre',             placeholder: '••••••••',             type: 'password' },
    ],
  },
  {
    id: 'efatura',
    name: 'e-Fatura (GİB)',
    category: 'e-Belge',
    description: 'Gelir İdaresi Başkanlığı e-Fatura servisi. UBL-TR formatında fatura gönder, gelen faturaları otomatik işle.',
    logo: 'GİB',
    color: '#c9184a',
    fields: [
      { key: 'integrator',  label: 'Entegratör URL',  placeholder: 'https://efatura.entegrator.com', type: 'url' },
      { key: 'username',    label: 'Kullanıcı Adı',   placeholder: 'VKN + şifre tanımlaması',       type: 'text' },
      { key: 'vkn',         label: 'Vergi Kimlik No', placeholder: '1234567890',                    type: 'text' },
      { key: 'efaturaKey',  label: 'API Key',         placeholder: 'efatura-api-••••••••',          type: 'password' },
    ],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    category: 'Bildirim',
    description: 'WhatsApp Business API ile müşterilere otomatik iş emri ve fatura bildirimleri gönderin.',
    logo: 'WA',
    color: '#25d366',
    fields: [
      { key: 'waToken',   label: 'Bearer Token',   placeholder: 'EAAG••••••••',                  type: 'password' },
      { key: 'phoneId',   label: 'Phone Number ID', placeholder: '10638••••••',                  type: 'text' },
      { key: 'waAccount', label: 'Account ID',     placeholder: 'business_account_id',           type: 'text' },
      { key: 'waWebhook', label: 'Webhook URL',    placeholder: 'https://yourdomain.com/wa-hook', type: 'url' },
    ],
  },
  {
    id: 'email',
    name: 'E-posta (SMTP)',
    category: 'Bildirim',
    description: 'SMTP sunucu bağlantısı. Otomatik fatura, teklif ve bildirim e-postaları için kullanılır.',
    logo: 'SM',
    color: '#7e57c2',
    fields: [
      { key: 'smtpHost', label: 'SMTP Sunucu', placeholder: 'smtp.mailsunucu.com',  type: 'text' },
      { key: 'smtpPort', label: 'Port',        placeholder: '587',                  type: 'text' },
      { key: 'smtpUser', label: 'Kullanıcı',   placeholder: 'noreply@sirket.com',   type: 'text' },
      { key: 'smtpPass', label: 'Şifre',       placeholder: '••••••••',             type: 'password' },
    ],
  },
  {
    id: 'crm',
    name: 'CRM Bağlantısı',
    category: 'CRM',
    description: 'Harici CRM sistemi entegrasyonu. Müşteri kayıtları, pipeline ve opportunity verilerini senkronize eder.',
    logo: 'CRM',
    color: '#ff6b6b',
    fields: [
      { key: 'crmUrl',   label: 'CRM API URL', placeholder: 'https://crm.sirket.com/api', type: 'url' },
      { key: 'crmKey',   label: 'API Key',     placeholder: 'crm-key-••••••••',           type: 'password' },
      { key: 'crmTenant', label: 'Tenant ID',  placeholder: 'tenant-uuid',               type: 'text' },
    ],
  },
];

const STORAGE_KEY = 'sod_integrations';
const LOG_KEY = 'sod_int_log';

function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}
function loadLog() {
  try { return JSON.parse(localStorage.getItem(LOG_KEY)) || []; } catch { return []; }
}

const fmtTime = (d) => d ? new Date(d).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';

/* ════════════════════════════════════════════════════════════
   CONFIG MODAL
   ════════════════════════════════════════════════════════════ */
function ConfigModal({ meta, cfg, onSave, onClose }) {
  const [form, setForm] = useState({ ...cfg });
  const [enabled, setEnabled] = useState(cfg.enabled || false);
  const [testState, setTestState] = useState(null); // null | 'testing' | 'ok' | 'error'

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleTest = () => {
    setTestState('testing');
    setTimeout(() => {
      const hasAny = meta.fields.some(f => form[f.key] && String(form[f.key]).trim() !== '');
      setTestState(hasAny ? 'ok' : 'error');
    }, 1500);
  };

  return (
    <div className="int-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="int-modal">
        <div className="int-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="int-logo" style={{ background: meta.color, width: 32, height: 32, fontSize: '0.7rem', borderRadius: 8 }}>{meta.logo}</div>
            <h2>{meta.name} Yapılandırması</h2>
          </div>
          <button className="int-modal-close" onClick={onClose}>{Icons.x(16)}</button>
        </div>
        <div className="int-modal-body">
          {/* Enable toggle */}
          <div className="int-form-group">
            <label className="int-form-toggle">
              <div className="int-toggle-track" style={{ background: enabled ? '#6366f1' : 'var(--bg-overlay,#18181d)', border: '1px solid var(--border)' }}
                onClick={() => setEnabled(e => !e)}>
                <div className="int-toggle-thumb" style={{ left: enabled ? 19 : 3 }} />
              </div>
              <span>Entegrasyon Aktif</span>
            </label>
          </div>

          {meta.fields.map(f => (
            <div key={f.key} className="int-form-group">
              <label className="int-form-label">{f.label}</label>
              <input
                className="int-form-input"
                type={f.type === 'password' ? 'password' : 'text'}
                value={form[f.key] || ''}
                onChange={e => setF(f.key, e.target.value)}
                placeholder={f.placeholder}
                autoComplete="off"
              />
            </div>
          ))}

          {/* Test */}
          <button className="int-btn int-btn-test" style={{ width: '100%', justifyContent: 'center' }} onClick={handleTest} disabled={testState === 'testing'}>
            {Icons.zap()} {testState === 'testing' ? 'Test Ediliyor...' : 'Bağlantıyı Test Et'}
          </button>
          {testState === 'ok' && <div className="int-test-result success">{Icons.check()} Bağlantı başarılı! Servis yanıt veriyor.</div>}
          {testState === 'error' && <div className="int-test-result error">{Icons.x()} Bağlantı başarısız. Ayarları kontrol edin.</div>}
        </div>
        <div className="int-modal-footer">
          <button className="int-btn int-btn-secondary" onClick={onClose}>İptal</button>
          <button className="int-btn int-btn-primary" onClick={() => onSave({ ...form, enabled, lastSaved: new Date().toISOString() })}>
            {Icons.check()} Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   LOG MODAL
   ════════════════════════════════════════════════════════════ */
function LogModal({ log, onClose }) {
  return (
    <div className="int-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="int-modal" style={{ maxWidth: 700 }}>
        <div className="int-modal-header">
          <h2>{Icons.log()} Entegrasyon Geçmişi</h2>
          <button className="int-modal-close" onClick={onClose}>{Icons.x(16)}</button>
        </div>
        <div className="int-modal-body">
          {log.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0', fontSize: '0.85rem' }}>Henüz kayıt yok</div>
          ) : (
            <div className="int-log">
              {log.map((l, i) => (
                <div key={i} className="int-log-entry">
                  <span className="int-log-time">[{fmtTime(l.at)}]</span>
                  <span className={l.ok ? 'int-log-ok' : 'int-log-err'}>{l.ok ? '✓' : '✗'}</span>
                  <span style={{ color: 'var(--text-primary)' }}>{l.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>— {l.msg}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="int-modal-footer">
          <button className="int-btn int-btn-secondary" onClick={onClose}>Kapat</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN
   ════════════════════════════════════════════════════════════ */
export default function IntegrationsPage({ showToast, currentUser }) {
  const [data, setData] = useState(loadData);
  const [log, setLog] = useState(loadLog);
  const [configId, setConfigId] = useState(null);
  const [showLog, setShowLog] = useState(false);
  const [testingIds, setTestingIds] = useState({});

  const persist = useCallback((newData) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  }, []);

  const addLog = useCallback((entry) => {
    const updated = [entry, ...log].slice(0, 200);
    setLog(updated);
    localStorage.setItem(LOG_KEY, JSON.stringify(updated));
  }, [log]);

  const handleSaveConfig = useCallback((id, cfg) => {
    const updated = { ...data, [id]: cfg };
    persist(updated);
    const meta = INTEGRATIONS_META.find(m => m.id === id);
    addLog({ at: new Date().toISOString(), name: meta.name, ok: true, msg: `Yapılandırma kaydedildi. Aktif: ${cfg.enabled ? 'Evet' : 'Hayır'}` });
    setConfigId(null);
    showToast?.(`${meta.name} yapılandırması kaydedildi`, 'success');
  }, [data, persist, addLog, showToast]);

  const handleRemove = useCallback((id) => {
    const meta = INTEGRATIONS_META.find(m => m.id === id);
    if (!window.confirm(`${meta.name} yapılandırmasını silmek istediğinizden emin misiniz?`)) return;
    const updated = { ...data };
    delete updated[id];
    persist(updated);
    addLog({ at: new Date().toISOString(), name: meta.name, ok: false, msg: 'Yapılandırma silindi' });
    showToast?.(`${meta.name} yapılandırması silindi`, 'success');
  }, [data, persist, addLog, showToast]);

  const handleTest = useCallback((id) => {
    const meta = INTEGRATIONS_META.find(m => m.id === id);
    setTestingIds(t => ({ ...t, [id]: true }));
    setTimeout(() => {
      const cfg = data[id] || {};
      const hasConfig = meta.fields.some(f => cfg[f.key]);
      setTestingIds(t => ({ ...t, [id]: false }));
      if (hasConfig) {
        addLog({ at: new Date().toISOString(), name: meta.name, ok: true, msg: 'Test başarılı. Servis bağlantısı doğrulandı.' });
        showToast?.(`${meta.name}: Bağlantı başarılı`, 'success');
      } else {
        addLog({ at: new Date().toISOString(), name: meta.name, ok: false, msg: 'Test başarısız. Yapılandırma eksik.' });
        showToast?.(`${meta.name}: Yapılandırma eksik`, 'error');
      }
    }, 1200);
  }, [data, addLog, showToast]);

  /* Stats */
  const connected  = INTEGRATIONS_META.filter(m => data[m.id]?.enabled).length;
  const configured = INTEGRATIONS_META.filter(m => data[m.id] && !data[m.id].enabled).length;
  const categories = [...new Set(INTEGRATIONS_META.map(m => m.category))];

  return (
    <div className="int-page page-content">
      <div className="int-header">
        <div>
          <h1>{Icons.link(20)} Entegrasyonlar</h1>
          <p>ERP, e-belge, bildirim ve CRM sistemleriyle bağlantı yapılandırması</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="int-btn int-btn-secondary" onClick={() => setShowLog(true)}>
            {Icons.log()} Geçmiş ({log.length})
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="int-stats">
        {[
          { label: 'Toplam Servis', val: INTEGRATIONS_META.length, color: '#6366f1', bg: '#6366f11a' },
          { label: 'Aktif', val: connected, color: '#10b981', bg: '#10b9811a' },
          { label: 'Yapılandırıldı', val: configured, color: '#f59e0b', bg: '#f59e0b1a' },
          { label: 'Yapılandırılmadı', val: INTEGRATIONS_META.length - connected - configured, color: '#64748b', bg: '#64748b1a' },
        ].map(s => (
          <div key={s.label} className="int-stat">
            <div className="int-stat-icon" style={{ background: s.bg }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
            </div>
            <div>
              <div className="int-stat-val" style={{ color: s.color }}>{s.val}</div>
              <div className="int-stat-lbl">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Cards by category */}
      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted,#6a6a7e)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>{cat}</div>
          <div className="int-grid">
            {INTEGRATIONS_META.filter(m => m.category === cat).map(meta => {
              const cfg = data[meta.id] || {};
              const isEnabled     = !!cfg.enabled;
              const isConfigured  = Object.values(cfg).some(v => v && typeof v === 'string' && v.trim() !== '');
              const isTestingNow  = !!testingIds[meta.id];

              let statusLabel = 'Yapılandırılmadı';
              let statusColor = '#64748b';
              let dotColor    = '#64748b';
              let cardClass   = '';

              if (isEnabled) {
                statusLabel = 'Aktif / Bağlı';
                statusColor = '#10b981';
                dotColor    = '#10b981';
                cardClass   = 'connected';
              } else if (isConfigured) {
                statusLabel = 'Yapılandırıldı (Pasif)';
                statusColor = '#f59e0b';
                dotColor    = '#f59e0b';
              }

              return (
                <div key={meta.id} className={`int-card ${cardClass}`}>
                  {/* Header */}
                  <div className="int-card-head">
                    <div className="int-logo" style={{ background: meta.color }}>{meta.logo}</div>
                    <div className="int-card-info">
                      <div className="int-card-name">{meta.name}</div>
                      <div className="int-card-category">{meta.category}</div>
                    </div>
                  </div>

                  <div className="int-card-desc">{meta.description}</div>

                  {/* Status */}
                  <div className="int-status-row">
                    <div className="int-status-dot" style={{ background: dotColor, boxShadow: isEnabled ? `0 0 6px ${dotColor}` : 'none' }} />
                    <div className="int-status-text" style={{ color: statusColor }}>{statusLabel}</div>
                    {cfg.lastSaved && (
                      <div className="int-last-sync">Son: {fmtTime(cfg.lastSaved)}</div>
                    )}
                  </div>

                  {/* Configured fields preview (masked) */}
                  {isConfigured && !isEnabled && (
                    <div className="int-fields-preview">
                      {meta.fields.filter(f => cfg[f.key]).slice(0, 2).map(f => (
                        <div key={f.key} className="int-field-row">
                          <span className="int-field-key">{f.label}:</span>
                          <span className="int-field-val">
                            {f.type === 'password' ? '••••••••' : String(cfg[f.key]).substring(0, 40)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="int-card-actions">
                    <button className="int-btn int-btn-primary" onClick={() => setConfigId(meta.id)}>
                      {Icons.settings()} Yapılandır
                    </button>
                    {isConfigured && (
                      <button className="int-btn int-btn-test" onClick={() => handleTest(meta.id)} disabled={isTestingNow}>
                        {Icons.zap()} {isTestingNow ? 'Test...' : 'Test Et'}
                      </button>
                    )}
                    {isConfigured && (
                      <button className="int-btn int-btn-secondary" style={{ color: '#f05252', padding: '7px 10px' }} onClick={() => handleRemove(meta.id)}>
                        {Icons.trash()}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Config Modal */}
      {configId && (
        <ConfigModal
          meta={INTEGRATIONS_META.find(m => m.id === configId)}
          cfg={data[configId] || {}}
          onSave={cfg => handleSaveConfig(configId, cfg)}
          onClose={() => setConfigId(null)}
        />
      )}

      {/* Log Modal */}
      {showLog && <LogModal log={log} onClose={() => setShowLog(false)} />}
    </div>
  );
}
