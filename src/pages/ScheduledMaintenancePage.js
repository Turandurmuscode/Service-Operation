import React, { useState, useEffect, useCallback } from 'react';
import './ScheduledMaintenancePage.css';

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Günlük', days: 1 },
  { value: 'weekly', label: 'Haftalık', days: 7 },
  { value: 'biweekly', label: '2 Haftada Bir', days: 14 },
  { value: 'monthly', label: 'Aylık', days: 30 },
  { value: 'quarterly', label: '3 Ayda Bir', days: 90 },
  { value: 'semiannual', label: '6 Ayda Bir', days: 180 },
  { value: 'annual', label: 'Yıllık', days: 365 },
];

const MAINTENANCE_TYPES = [
  { value: 'preventive', label: 'Önleyici Bakım', icon: '', color: '#3b82f6' },
  { value: 'routine', label: 'Rutin Kontrol', icon: '', color: '#22c55e' },
  { value: 'update', label: 'Güncelleme', icon: '', color: '#8b5cf6' },
  { value: 'backup', label: 'Yedekleme', icon: '', color: '#f59e0b' },
  { value: 'security', label: 'Güvenlik Taraması', icon: '', color: '#ef4444' },
  { value: 'cleaning', label: 'Temizlik', icon: '', color: '#06b6d4' },
  { value: 'inspection', label: 'Muayene', icon: '', color: '#6b7280' },
];

function ScheduledMaintenancePage({ clients, incidents, addIncident, currentUser, showToast }) {
  const [schedules, setSchedules] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [activeView, setActiveView] = useState('upcoming'); // upcoming | schedules | history
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('maintenanceSchedules');
      if (saved) setSchedules(JSON.parse(saved));
      const savedExec = localStorage.getItem('maintenanceExecutions');
      if (savedExec) setExecutions(JSON.parse(savedExec));
    } catch { /* ignore */ }
  }, []);

  const saveSchedules = useCallback((data) => {
    setSchedules(data);
    localStorage.setItem('maintenanceSchedules', JSON.stringify(data));
  }, []);

  const saveExecutions = useCallback((data) => {
    setExecutions(data);
    localStorage.setItem('maintenanceExecutions', JSON.stringify(data));
  }, []);

  // ── CRUD ──────────────────────────
  const addSchedule = (formData) => {
    const newSchedule = {
      id: Date.now(),
      ...formData,
      clientIds: formData.clientIds || [],
      active: true,
      lastExecuted: null,
      executionCount: 0,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Admin',
    };
    saveSchedules([...schedules, newSchedule]);
    showToast('Bakım planı oluşturuldu!', 'success');
    setShowForm(false);
  };

  const updateSchedule = (formData) => {
    const updated = schedules.map(s =>
      s.id === editingSchedule.id
        ? { ...s, ...formData, clientIds: formData.clientIds || [], lastUpdated: new Date().toISOString() }
        : s
    );
    saveSchedules(updated);
    showToast('Bakım planı güncellendi!', 'success');
    setEditingSchedule(null);
    setShowForm(false);
  };

  const deleteSchedule = (id) => {
    if (!window.confirm('Bu bakım planını silmek istediğinize emin misiniz?')) return;
    saveSchedules(schedules.filter(s => s.id !== id));
    showToast('Bakım planı silindi!', 'success');
  };

  const toggleSchedule = (id) => {
    const updated = schedules.map(s =>
      s.id === id ? { ...s, active: !s.active } : s
    );
    saveSchedules(updated);
  };

  // ── EXECUTE MAINTENANCE ────────────
  const executeMaintenance = (schedule, clientId) => {
    const client = clients.find(c => c.id === clientId);
    const typeInfo = MAINTENANCE_TYPES.find(t => t.value === schedule.type);

    // Create incident
    if (addIncident) {
      addIncident({
        clientId: clientId,
        description: `[${typeInfo?.label || 'Bakım'}] ${schedule.title}${schedule.description ? ' — ' + schedule.description : ''}`,
        priority: 'low',
        category: schedule.category || 'other',
        technicianId: schedule.technicianId || '',
      });
    }

    // Log execution
    const execution = {
      id: Date.now() + Math.random(),
      scheduleId: schedule.id,
      scheduleTitle: schedule.title,
      clientId,
      clientName: client?.name || 'Bilinmeyen',
      type: schedule.type,
      executedAt: new Date().toISOString(),
      executedBy: currentUser?.name || 'Admin',
      status: 'created', // created, completed, skipped
    };
    saveExecutions([execution, ...executions]);

    // Update schedule
    const updated = schedules.map(s =>
      s.id === schedule.id
        ? { ...s, lastExecuted: new Date().toISOString(), executionCount: (s.executionCount || 0) + 1 }
        : s
    );
    saveSchedules(updated);

    showToast(`${client?.name} için bakım arızası oluşturuldu`, 'success');
  };

  const executeAllForSchedule = (schedule) => {
    const targetClients = schedule.clientIds?.length > 0
      ? schedule.clientIds
      : clients.map(c => c.id);
    targetClients.forEach(clientId => executeMaintenance(schedule, clientId));
    showToast(`${targetClients.length} müşteri için bakım arızaları oluşturuldu`, 'success');
  };

  // ── UPCOMING CALCULATIONS ──────────
  const getNextDue = (schedule) => {
    if (!schedule.active) return null;
    const freq = FREQUENCY_OPTIONS.find(f => f.value === schedule.frequency);
    if (!freq) return null;
    const lastDate = schedule.lastExecuted ? new Date(schedule.lastExecuted) : new Date(schedule.createdAt);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + freq.days);
    return nextDate;
  };

  const getUpcomingTasks = () => {
    const now = new Date();
    const tasks = [];
    schedules.filter(s => s.active).forEach(schedule => {
      const nextDue = getNextDue(schedule);
      if (!nextDue) return;
      const daysUntil = Math.ceil((nextDue - now) / (1000 * 60 * 60 * 24));
      const isOverdue = daysUntil < 0;
      const isDueSoon = daysUntil <= 3;

      const targetClients = schedule.clientIds?.length > 0
        ? schedule.clientIds.map(id => clients.find(c => c.id === id)).filter(Boolean)
        : [{ id: 'all', name: 'Tüm Müşteriler' }];

      targetClients.forEach(client => {
        tasks.push({
          schedule,
          client,
          nextDue,
          daysUntil,
          isOverdue,
          isDueSoon,
        });
      });
    });
    return tasks.sort((a, b) => a.nextDue - b.nextDue);
  };

  const upcomingTasks = getUpcomingTasks();
  const overdueTasks = upcomingTasks.filter(t => t.isOverdue);
  const dueSoonTasks = upcomingTasks.filter(t => t.isDueSoon && !t.isOverdue);

  // Filters
  const filteredSchedules = schedules.filter(s => {
    if (search && !s.title?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== 'all' && s.type !== filterType) return false;
    return true;
  });

  return (
    <div className="page-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-title"> Periyodik Bakım Planlama</h1>
          <p className="page-subtitle">Otomatik bakım görevleri ve tekrarlayan iş planları</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingSchedule(null); setShowForm(true); }}>
          + Bakım Planı Ekle
        </button>
      </div>

      {/* Stats */}
      <div className="sm-stats">
        <div className="sm-stat-card">
          <div className="sm-stat-value">{schedules.length}</div>
          <div className="sm-stat-label">Toplam Plan</div>
        </div>
        <div className="sm-stat-card">
          <div className="sm-stat-value" style={{ color: '#22c55e' }}>
            {schedules.filter(s => s.active).length}
          </div>
          <div className="sm-stat-label">Aktif Plan</div>
        </div>
        <div className={`sm-stat-card ${overdueTasks.length > 0 ? 'danger-card' : ''}`}>
          <div className="sm-stat-value" style={{ color: '#ef4444' }}>{overdueTasks.length}</div>
          <div className="sm-stat-label">Gecikmiş</div>
        </div>
        <div className={`sm-stat-card ${dueSoonTasks.length > 0 ? 'warning-card' : ''}`}>
          <div className="sm-stat-value" style={{ color: '#f59e0b' }}>{dueSoonTasks.length}</div>
          <div className="sm-stat-label">Yaklaşan (3 gün)</div>
        </div>
        <div className="sm-stat-card">
          <div className="sm-stat-value">{executions.length}</div>
          <div className="sm-stat-label">Toplam Çalıştırma</div>
        </div>
      </div>

      {/* Overdue Banner */}
      {overdueTasks.length > 0 && (
        <div className="sm-alert-banner danger">
          <span></span>
          <div>
            <strong>{overdueTasks.length} bakım görevi gecikmiş durumda!</strong>
            <div className="sm-alert-list">
              {overdueTasks.slice(0, 5).map((t, i) => (
                <span key={i}>
                  {t.schedule.title} — {t.client.name} ({Math.abs(t.daysUntil)} gün gecikmiş)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="sm-tabs">
        <button className={`sm-tab ${activeView === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveView('upcoming')}> Yaklaşan İşler ({upcomingTasks.length})</button>
        <button className={`sm-tab ${activeView === 'schedules' ? 'active' : ''}`}
          onClick={() => setActiveView('schedules')}> Planlar ({schedules.length})</button>
        <button className={`sm-tab ${activeView === 'history' ? 'active' : ''}`}
          onClick={() => setActiveView('history')}> Geçmiş ({executions.length})</button>
      </div>

      {/* ── UPCOMING VIEW ─────────── */}
      {activeView === 'upcoming' && (
        <div className="sm-upcoming">
          {upcomingTasks.length === 0 ? (
            <div className="empty-state"><p>Yaklaşan bakım görevi yok.</p></div>
          ) : (
            <div className="sm-task-list">
              {upcomingTasks.map((task, i) => {
                const typeInfo = MAINTENANCE_TYPES.find(t => t.value === task.schedule.type);
                const freq = FREQUENCY_OPTIONS.find(f => f.value === task.schedule.frequency);
                return (
                  <div key={i} className={`sm-task-card ${task.isOverdue ? 'overdue' : task.isDueSoon ? 'due-soon' : ''}`}>
                    <div className="sm-task-left">
                      <div className="sm-task-icon" style={{ background: `${typeInfo?.color || '#6b7280'}15`, color: typeInfo?.color }}>
                        {typeInfo?.icon || ''}
                      </div>
                      <div>
                        <div className="sm-task-title">{task.schedule.title}</div>
                        <div className="sm-task-meta">
                          {typeInfo?.label} | {freq?.label} |  {task.client.name}
                        </div>
                      </div>
                    </div>
                    <div className="sm-task-right">
                      <div className={`sm-task-due ${task.isOverdue ? 'overdue' : task.isDueSoon ? 'soon' : ''}`}>
                        {task.isOverdue
                          ? `${Math.abs(task.daysUntil)} gün gecikmiş`
                          : task.daysUntil === 0
                            ? 'Bugün'
                            : `${task.daysUntil} gün sonra`}
                      </div>
                      <div className="sm-task-date">{task.nextDue.toLocaleDateString('tr-TR')}</div>
                      {task.client.id !== 'all' && (
                        <button className="btn-sm btn-primary"
                          onClick={() => executeMaintenance(task.schedule, task.client.id)}>
                           Çalıştır
                        </button>
                      )}
                      {task.client.id === 'all' && (
                        <button className="btn-sm btn-primary"
                          onClick={() => executeAllForSchedule(task.schedule)}>
                           Tümünü Çalıştır
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SCHEDULES VIEW ─────────── */}
      {activeView === 'schedules' && (
        <>
          <div className="sm-filters">
            <input type="text" className="filter-input" placeholder="Plan adı ara..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">Tüm Türler</option>
              {MAINTENANCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
            </select>
          </div>
          {filteredSchedules.length === 0 ? (
            <div className="empty-state"><p>Henüz bakım planı oluşturulmamış.</p></div>
          ) : (
            <div className="sm-schedules-grid">
              {filteredSchedules.map(schedule => {
                const typeInfo = MAINTENANCE_TYPES.find(t => t.value === schedule.type);
                const freq = FREQUENCY_OPTIONS.find(f => f.value === schedule.frequency);
                const nextDue = getNextDue(schedule);
                const targetClients = schedule.clientIds?.length > 0
                  ? schedule.clientIds.map(id => clients.find(c => c.id === id)).filter(Boolean)
                  : [];
                return (
                  <div key={schedule.id} className={`sm-schedule-card ${!schedule.active ? 'inactive' : ''}`}>
                    <div className="sm-schedule-header">
                      <div className="sm-schedule-type" style={{ color: typeInfo?.color }}>
                        {typeInfo?.icon} {typeInfo?.label}
                      </div>
                      <label className="sm-toggle">
                        <input type="checkbox" checked={schedule.active}
                          onChange={() => toggleSchedule(schedule.id)} />
                        <span className="sm-toggle-slider"></span>
                      </label>
                    </div>
                    <h3 className="sm-schedule-title">{schedule.title}</h3>
                    {schedule.description && (
                      <p className="sm-schedule-desc">{schedule.description}</p>
                    )}
                    <div className="sm-schedule-info">
                      <div> {freq?.label || schedule.frequency}</div>
                      <div> {targetClients.length > 0 ? targetClients.map(c => c.name).join(', ') : 'Tüm Müşteriler'}</div>
                      {nextDue && <div> Sonraki: {nextDue.toLocaleDateString('tr-TR')}</div>}
                      <div> {schedule.executionCount || 0} kez çalıştırıldı</div>
                    </div>
                    <div className="sm-schedule-actions">
                      <button className="btn-sm btn-primary"
                        onClick={() => executeAllForSchedule(schedule)} disabled={!schedule.active}>
                         Şimdi Çalıştır
                      </button>
                      <button className="btn-sm btn-ghost"
                        onClick={() => { setEditingSchedule(schedule); setShowForm(true); }}></button>
                      <button className="btn-sm btn-ghost" style={{ color: '#ef4444' }}
                        onClick={() => deleteSchedule(schedule.id)}></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── HISTORY VIEW ──────────── */}
      {activeView === 'history' && (
        <div className="sm-history">
          {executions.length === 0 ? (
            <div className="empty-state"><p>Henüz bakım geçmişi yok.</p></div>
          ) : (
            <div className="sm-table-wrapper">
              <table className="sm-table">
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>Plan</th>
                    <th>Tür</th>
                    <th>Müşteri</th>
                    <th>Çalıştıran</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.map(exec => {
                    const typeInfo = MAINTENANCE_TYPES.find(t => t.value === exec.type);
                    return (
                      <tr key={exec.id}>
                        <td>{new Date(exec.executedAt).toLocaleString('tr-TR')}</td>
                        <td><strong>{exec.scheduleTitle}</strong></td>
                        <td>{typeInfo?.icon} {typeInfo?.label || exec.type}</td>
                        <td>{exec.clientName}</td>
                        <td>{exec.executedBy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ScheduleFormModal
          schedule={editingSchedule}
          clients={clients}
          onSave={editingSchedule ? updateSchedule : addSchedule}
          onClose={() => { setShowForm(false); setEditingSchedule(null); }}
        />
      )}
    </div>
  );
}

function ScheduleFormModal({ schedule, clients, onSave, onClose }) {
  const [form, setForm] = useState({
    title: schedule?.title || '',
    description: schedule?.description || '',
    type: schedule?.type || 'preventive',
    frequency: schedule?.frequency || 'monthly',
    category: schedule?.category || 'other',
    clientIds: schedule?.clientIds || [],
    technicianId: schedule?.technicianId || '',
    priority: schedule?.priority || 'low',
  });
  const [technicians, setTechnicians] = useState([]);
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  useEffect(() => {
    try {
      const saved = localStorage.getItem('technicians');
      if (saved) setTechnicians(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const toggleClient = (clientId) => {
    const current = form.clientIds || [];
    const updated = current.includes(clientId)
      ? current.filter(id => id !== clientId)
      : [...current, clientId];
    set('clientIds', updated);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal sm-modal">
        <div className="modal-header">
          <h2>{schedule ? 'Plan Düzenle' : 'Yeni Bakım Planı'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Plan Başlığı *</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="ör: Haftalık Yedekleme Kontrolü" />
          </div>
          <div className="form-group">
            <label>Açıklama</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows="2"
              placeholder="Bakım planının detayları..." />
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Bakım Türü</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}>
                {MAINTENANCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Tekrar Sıklığı</label>
              <select value={form.frequency} onChange={e => set('frequency', e.target.value)}>
                {FREQUENCY_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Kategori</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="software">Yazılım</option>
                <option value="hardware">Donanım</option>
                <option value="network">Ağ</option>
                <option value="other">Diğer</option>
              </select>
            </div>
            <div className="form-group">
              <label>Atanacak Teknisyen</label>
              <select value={form.technicianId} onChange={e => set('technicianId', e.target.value)}>
                <option value="">Atanmamış</option>
                {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Müşteriler (boş bırakılırsa tüm müşterilere uygulanır)</label>
            <div className="sm-client-select">
              {clients.map(client => (
                <label key={client.id} className="sm-client-option">
                  <input type="checkbox"
                    checked={(form.clientIds || []).includes(client.id)}
                    onChange={() => toggleClient(client.id)} />
                  <span>{client.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>İptal</button>
          <button className="btn btn-primary"
            onClick={() => form.title.trim() && onSave(form)}
            disabled={!form.title.trim()}>
            {schedule ? 'Güncelle' : 'Oluştur'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScheduledMaintenancePage;
