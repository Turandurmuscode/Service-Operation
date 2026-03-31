import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './WorkflowRulesPage.css';

const TRIGGERS = [
  { id: 'incident_created', label: 'Yeni arıza oluşturulduğunda', icon: '' },
  { id: 'incident_critical', label: 'Kritik arıza geldiğinde', icon: '' },
  { id: 'incident_overdue', label: 'SLA süresi aşıldığında', icon: '' },
  { id: 'incident_resolved', label: 'Arıza çözüldüğünde', icon: '' },
  { id: 'incident_status_change', label: 'Arıza durumu değiştiğinde', icon: '' },
  { id: 'client_added', label: 'Yeni müşteri eklendiğinde', icon: '' },
  { id: 'no_update_24h', label: '24 saat güncelleme yapılmadığında', icon: '' },
  { id: 'high_incident_count', label: 'Aktif arıza sayısı eşiği aşıldığında', icon: '' },
];

const ACTIONS = [
  { id: 'notify_admin', label: 'Admin\'e bildirim gönder', icon: '' },
  { id: 'notify_manager', label: 'Yöneticiye bildirim gönder', icon: '' },
  { id: 'notify_all', label: 'Tüm ekibe bildirim gönder', icon: '' },
  { id: 'auto_assign', label: 'Otomatik atama yap', icon: '' },
  { id: 'escalate', label: 'Üst seviyeye yükselt', icon: '' },
  { id: 'add_note', label: 'Otomatik not ekle', icon: '' },
  { id: 'change_priority', label: 'Önceliği değiştir', icon: '' },
  { id: 'log_event', label: 'Olay kaydı oluştur', icon: '' },
];

const CONDITIONS = [
  { id: 'priority_critical', label: 'Öncelik = Kritik', group: 'priority' },
  { id: 'priority_medium', label: 'Öncelik = Orta', group: 'priority' },
  { id: 'priority_low', label: 'Öncelik = Düşük', group: 'priority' },
  { id: 'status_new', label: 'Durum = Yeni', group: 'status' },
  { id: 'status_in_progress', label: 'Durum = Devam Ediyor', group: 'status' },
  { id: 'status_on_hold', label: 'Durum = Beklemede', group: 'status' },
  { id: 'any', label: 'Koşulsuz (her zaman)', group: 'any' },
];

const emptyRule = {
  name: '',
  trigger: 'incident_created',
  conditions: ['any'],
  actions: ['notify_admin'],
  actionParams: {},
  enabled: true,
  description: '',
};

function WorkflowRulesPage({ incidents, currentUser, showToast }) {
  const [rules, setRules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [form, setForm] = useState({ ...emptyRule });
  const [executionLog, setExecutionLog] = useState([]);
  const [activeTab, setActiveTab] = useState('rules'); // rules | log | templates
  const [search, setSearch] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('workflowRules');
    const savedLog = localStorage.getItem('workflowLog');
    if (saved) setRules(JSON.parse(saved));
    if (savedLog) setExecutionLog(JSON.parse(savedLog));
  }, []);

  const saveRules = useCallback((updated) => {
    setRules(updated);
    localStorage.setItem('workflowRules', JSON.stringify(updated));
  }, []);

  const saveLog = useCallback((updated) => {
    setExecutionLog(updated);
    localStorage.setItem('workflowLog', JSON.stringify(updated));
  }, []);

  // CRUD
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { showToast('Kural adı zorunludur.', 'error'); return; }
    if (form.actions.length === 0) { showToast('En az bir aksiyon seçiniz.', 'error'); return; }

    if (editingRule) {
      const updated = rules.map(r => r.id === editingRule.id ? { ...r, ...form, updatedAt: new Date().toISOString() } : r);
      saveRules(updated);
      showToast('Kural güncellendi!', 'success');
    } else {
      const newRule = {
        id: Date.now(), ...form,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.name || 'System',
        triggerCount: 0,
      };
      saveRules([...rules, newRule]);
      showToast('Kural oluşturuldu!', 'success');
    }
    setForm({ ...emptyRule });
    setEditingRule(null);
    setShowForm(false);
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setForm({
      name: rule.name,
      trigger: rule.trigger,
      conditions: rule.conditions || ['any'],
      actions: rule.actions || ['notify_admin'],
      actionParams: rule.actionParams || {},
      enabled: rule.enabled,
      description: rule.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Bu kuralı silmek istediğinize emin misiniz?')) return;
    saveRules(rules.filter(r => r.id !== id));
    showToast('Kural silindi.', 'warning');
  };

  const toggleEnabled = (id) => {
    const updated = rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    saveRules(updated);
  };

  // Simulate rule execution
  const simulateRule = (rule) => {
    const trigger = TRIGGERS.find(t => t.id === rule.trigger);
    const actionLabels = rule.actions.map(a => ACTIONS.find(ac => ac.id === a)?.label).join(', ');

    const logEntry = {
      id: Date.now(),
      ruleId: rule.id,
      ruleName: rule.name,
      trigger: trigger?.label || rule.trigger,
      actions: actionLabels,
      result: 'success',
      date: new Date().toISOString(),
      simulatedBy: currentUser?.name || 'System',
    };

    saveLog([logEntry, ...executionLog]);

    // Update trigger count
    const updated = rules.map(r => r.id === rule.id ? { ...r, triggerCount: (r.triggerCount || 0) + 1 } : r);
    saveRules(updated);

    showToast(`Kural simüle edildi: ${rule.name}`, 'success');
  };

  const clearLog = () => {
    if (!window.confirm('Tüm çalışma logunu temizlemek istediğinize emin misiniz?')) return;
    saveLog([]);
    showToast('Log temizlendi.', 'warning');
  };

  // Templates
  const TEMPLATES = [
    {
      name: 'Kritik Arıza Bildirimi',
      trigger: 'incident_critical',
      conditions: ['priority_critical'],
      actions: ['notify_admin', 'notify_manager'],
      description: 'Kritik öncelikli arıza geldiğinde admin ve yöneticiye bildirim gönder.',
    },
    {
      name: 'SLA Uyarısı',
      trigger: 'incident_overdue',
      conditions: ['any'],
      actions: ['notify_manager', 'escalate'],
      description: 'SLA süresi aşıldığında yöneticiye bildirim gönder ve yükselt.',
    },
    {
      name: 'Yeni Arıza Atama',
      trigger: 'incident_created',
      conditions: ['any'],
      actions: ['auto_assign', 'log_event'],
      description: 'Yeni arıza geldiğinde otomatik teknisyen ata.',
    },
    {
      name: 'Çözüm Bildirimi',
      trigger: 'incident_resolved',
      conditions: ['any'],
      actions: ['notify_all', 'log_event'],
      description: 'Arıza çözüldüğünde tüm ekibe bildirim gönder.',
    },
    {
      name: 'Hareketsizlik Uyarısı',
      trigger: 'no_update_24h',
      conditions: ['status_in_progress'],
      actions: ['notify_admin', 'add_note'],
      description: '24 saattir güncelleme yapılmayan arızalar için uyarı.',
    },
    {
      name: 'Yoğunluk Alarmı',
      trigger: 'high_incident_count',
      conditions: ['any'],
      actions: ['notify_all', 'escalate'],
      description: 'Aktif arıza sayısı eşiği aşıldığında tüm ekibe alarm.',
    },
  ];

  const applyTemplate = (template) => {
    setForm({
      ...emptyRule,
      ...template,
      actionParams: {},
      enabled: true,
    });
    setEditingRule(null);
    setShowForm(true);
    setActiveTab('rules');
    showToast('Şablon yüklendi, düzenleyip kaydedin.', 'info');
  };

  // Helpers
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const toggleCondition = (condId) => {
    if (condId === 'any') {
      setForm({ ...form, conditions: ['any'] });
      return;
    }
    let next = form.conditions.filter(c => c !== 'any');
    if (next.includes(condId)) {
      next = next.filter(c => c !== condId);
    } else {
      next.push(condId);
    }
    if (next.length === 0) next = ['any'];
    setForm({ ...form, conditions: next });
  };

  const toggleAction = (actId) => {
    let next = [...form.actions];
    if (next.includes(actId)) {
      next = next.filter(a => a !== actId);
    } else {
      next.push(actId);
    }
    setForm({ ...form, actions: next });
  };

  // Filtered rules
  const filteredRules = useMemo(() => {
    if (!search) return rules;
    const s = search.toLowerCase();
    return rules.filter(r =>
      r.name.toLowerCase().includes(s) ||
      (r.description || '').toLowerCase().includes(s)
    );
  }, [rules, search]);

  // Stats
  const enabledCount = rules.filter(r => r.enabled).length;
  const totalTriggers = rules.reduce((sum, r) => sum + (r.triggerCount || 0), 0);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title"> İş Akışı Otomasyonu</h1>
          <p className="page-subtitle">If-then kurallarıyla otomatik bildirim ve aksiyonlar tanımlayın</p>
        </div>
        {isAdmin && (
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingRule(null); setForm({ ...emptyRule }); }}>
              + Yeni Kural
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="wf-stats">
        <div className="wf-stat"><span className="wf-stat-val">{rules.length}</span><span className="wf-stat-lbl">Toplam Kural</span></div>
        <div className="wf-stat"><span className="wf-stat-val" style={{ color: '#10b981' }}>{enabledCount}</span><span className="wf-stat-lbl">Aktif</span></div>
        <div className="wf-stat"><span className="wf-stat-val">{rules.length - enabledCount}</span><span className="wf-stat-lbl">Pasif</span></div>
        <div className="wf-stat"><span className="wf-stat-val">{totalTriggers}</span><span className="wf-stat-lbl">Toplam Tetikleme</span></div>
        <div className="wf-stat"><span className="wf-stat-val">{executionLog.length}</span><span className="wf-stat-lbl">Log Kayıt</span></div>
      </div>

      {/* Tabs */}
      <div className="wf-tabs">
        {[
          { id: 'rules', label: 'Kurallar', icon: '', badge: rules.length || null },
          { id: 'log', label: 'Çalışma Logu', icon: '', badge: executionLog.length || null },
          { id: 'templates', label: 'Şablonlar', icon: '', badge: null },
        ].map(tab => (
          <button key={tab.id} className={`wf-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>
            <span>{tab.icon}</span> {tab.label}
            {tab.badge && <span className="wf-tab-badge">{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* ═══ RULES TAB ═══ */}
      {activeTab === 'rules' && (
        <>
          <div className="wf-filters">
            <input type="text" className="filter-input" placeholder="Kural ara..."
              value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, maxWidth: 360 }} />
          </div>

          {filteredRules.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"></div>
              <p>{rules.length === 0 ? 'Henüz kural tanımlanmamış. Şablonlardan başlayabilirsiniz.' : 'Aramayla eşleşen kural bulunamadı.'}</p>
            </div>
          ) : (
            <div className="wf-rules-list">
              {filteredRules.map(rule => {
                const trigger = TRIGGERS.find(t => t.id === rule.trigger);
                const condLabels = (rule.conditions || []).map(c => CONDITIONS.find(co => co.id === c)?.label || c);
                const actionItems = (rule.actions || []).map(a => ACTIONS.find(ac => ac.id === a));

                return (
                  <div key={rule.id} className={`wf-rule-card ${!rule.enabled ? 'disabled' : ''}`}>
                    <div className="wf-rule-header">
                      <div className="wf-rule-title-row">
                        <label className="wf-toggle">
                          <input type="checkbox" checked={rule.enabled} onChange={() => toggleEnabled(rule.id)} />
                          <span className="wf-toggle-slider"></span>
                        </label>
                        <h4 className="wf-rule-name">{rule.name}</h4>
                        {rule.triggerCount > 0 && (
                          <span className="wf-trigger-count">{rule.triggerCount}× tetiklendi</span>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="wf-rule-actions">
                          <button className="btn btn-xs" onClick={() => simulateRule(rule)} title="Simüle Et"> Test</button>
                          <button className="btn-icon" title="Düzenle" onClick={() => handleEdit(rule)}></button>
                          <button className="btn-icon delete" title="Sil" onClick={() => handleDelete(rule.id)}></button>
                        </div>
                      )}
                    </div>
                    {rule.description && <p className="wf-rule-desc">{rule.description}</p>}

                    <div className="wf-rule-flow">
                      {/* Trigger */}
                      <div className="wf-flow-block trigger">
                        <div className="wf-flow-label">EĞER</div>
                        <div className="wf-flow-content">
                          <span className="wf-flow-icon">{trigger?.icon}</span>
                          <span>{trigger?.label}</span>
                        </div>
                      </div>

                      <div className="wf-flow-arrow">→</div>

                      {/* Conditions */}
                      <div className="wf-flow-block condition">
                        <div className="wf-flow-label">VE</div>
                        <div className="wf-flow-content">
                          {condLabels.map((cl, i) => (
                            <span key={i} className="wf-cond-tag">{cl}</span>
                          ))}
                        </div>
                      </div>

                      <div className="wf-flow-arrow">→</div>

                      {/* Actions */}
                      <div className="wf-flow-block action">
                        <div className="wf-flow-label">O ZAMAN</div>
                        <div className="wf-flow-content">
                          {actionItems.filter(Boolean).map((a, i) => (
                            <span key={i} className="wf-action-tag">
                              {a.icon} {a.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="wf-rule-meta">
                      <span>Oluşturan: {rule.createdBy || '—'}</span>
                      <span>{formatDate(rule.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ═══ LOG TAB ═══ */}
      {activeTab === 'log' && (
        <div className="wf-log">
          {executionLog.length > 0 && (
            <div style={{ textAlign: 'right', marginBottom: 12 }}>
              <button className="btn btn-secondary btn-sm" onClick={clearLog}> Logu Temizle</button>
            </div>
          )}
          {executionLog.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"></div>
              <p>Henüz çalışma logu yok. Kuralları test ederek log oluşturabilirsiniz.</p>
            </div>
          ) : (
            <div className="wf-log-list">
              {executionLog.map(log => (
                <div key={log.id} className={`wf-log-item ${log.result}`}>
                  <div className="wf-log-dot"></div>
                  <div className="wf-log-content">
                    <div className="wf-log-header">
                      <strong>{log.ruleName}</strong>
                      <span className={`wf-log-result ${log.result}`}>
                        {log.result === 'success' ? ' Başarılı' : ' Hata'}
                      </span>
                    </div>
                    <div className="wf-log-detail">
                      <span>Tetikleyici: {log.trigger}</span>
                      <span>Aksiyonlar: {log.actions}</span>
                    </div>
                    <div className="wf-log-meta">
                      <span> {log.simulatedBy}</span>
                      <span> {formatDate(log.date)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ TEMPLATES TAB ═══ */}
      {activeTab === 'templates' && (
        <div className="wf-templates">
          <p className="wf-templates-desc">Hazır şablonlardan hızlıca kural oluşturabilirsiniz:</p>
          <div className="wf-templates-grid">
            {TEMPLATES.map((tmpl, idx) => {
              const trigger = TRIGGERS.find(t => t.id === tmpl.trigger);
              const actionItems = tmpl.actions.map(a => ACTIONS.find(ac => ac.id === a)).filter(Boolean);
              return (
                <div key={idx} className="wf-template-card">
                  <div className="wf-template-header">
                    <span className="wf-template-icon">{trigger?.icon}</span>
                    <h4>{tmpl.name}</h4>
                  </div>
                  <p className="wf-template-desc">{tmpl.description}</p>
                  <div className="wf-template-actions-preview">
                    {actionItems.map((a, i) => (
                      <span key={i} className="wf-action-tag small">{a.icon} {a.label}</span>
                    ))}
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => applyTemplate(tmpl)} disabled={!isAdmin}>
                    Kullan
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ FORM MODAL ═══ */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content wf-form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRule ? 'Kuralı Düzenle' : ' Yeni Otomasyon Kuralı'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}></button>
            </div>
            <form onSubmit={handleSubmit} className="wf-form">
              <div className="form-group">
                <label>Kural Adı *</label>
                <input type="text" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="ör: Kritik Arıza Bildirimi" required />
              </div>
              <div className="form-group">
                <label>Açıklama</label>
                <input type="text" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Bu kural ne yapar?" />
              </div>

              {/* Trigger */}
              <div className="wf-form-section">
                <h4> Tetikleyici (EĞER)</h4>
                <div className="wf-option-grid">
                  {TRIGGERS.map(t => (
                    <label key={t.id} className={`wf-option-card ${form.trigger === t.id ? 'selected' : ''}`}>
                      <input type="radio" name="trigger" value={t.id}
                        checked={form.trigger === t.id}
                        onChange={() => setForm({ ...form, trigger: t.id })} />
                      <span className="wf-option-icon">{t.icon}</span>
                      <span className="wf-option-label">{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Conditions */}
              <div className="wf-form-section">
                <h4> Koşullar (VE)</h4>
                <div className="wf-option-grid">
                  {CONDITIONS.map(c => (
                    <label key={c.id} className={`wf-option-card ${form.conditions.includes(c.id) ? 'selected' : ''}`}>
                      <input type="checkbox"
                        checked={form.conditions.includes(c.id)}
                        onChange={() => toggleCondition(c.id)} />
                      <span className="wf-option-label">{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="wf-form-section">
                <h4> Aksiyonlar (O ZAMAN)</h4>
                <div className="wf-option-grid">
                  {ACTIONS.map(a => (
                    <label key={a.id} className={`wf-option-card ${form.actions.includes(a.id) ? 'selected' : ''}`}>
                      <input type="checkbox"
                        checked={form.actions.includes(a.id)}
                        onChange={() => toggleAction(a.id)} />
                      <span className="wf-option-icon">{a.icon}</span>
                      <span className="wf-option-label">{a.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">{editingRule ? 'Güncelle' : 'Kaydet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkflowRulesPage;
