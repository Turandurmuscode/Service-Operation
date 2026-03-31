import React, { useState, useEffect, useCallback } from 'react';
import './TimesheetPage.css';

function TimesheetPage({ incidents, clients, currentUser, showToast }) {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ incidentId: '', date: new Date().toISOString().slice(0, 10), hours: '', minutes: '', description: '', technician: currentUser?.name || '' });
  const [filterDate, setFilterDate] = useState('week'); // week | month | all
  const [filterTechnician, setFilterTechnician] = useState('all');
  const [editingEntry, setEditingEntry] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('timesheetEntries');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  const saveEntries = useCallback((updated) => {
    setEntries(updated);
    localStorage.setItem('timesheetEntries', JSON.stringify(updated));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const hours = parseInt(form.hours || 0);
    const minutes = parseInt(form.minutes || 0);
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes <= 0) {
      showToast('Geçerli bir süre girin.', 'error');
      return;
    }
    if (!form.description.trim()) {
      showToast('Açıklama zorunludur.', 'error');
      return;
    }

    if (editingEntry) {
      const updated = entries.map(e => e.id === editingEntry.id ? {
        ...e, ...form, totalMinutes,
        updatedAt: new Date().toISOString(),
      } : e);
      saveEntries(updated);
      showToast('Kayıt güncellendi!', 'success');
    } else {
      const newEntry = {
        id: Date.now(),
        ...form,
        totalMinutes,
        technician: form.technician || currentUser?.name || 'Bilinmiyor',
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.name || 'System',
      };
      saveEntries([...entries, newEntry]);
      showToast('Çalışma saati kaydedildi!', 'success');
    }

    setForm({ incidentId: '', date: new Date().toISOString().slice(0, 10), hours: '', minutes: '', description: '', technician: currentUser?.name || '' });
    setEditingEntry(null);
    setShowForm(false);
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setForm({
      incidentId: entry.incidentId || '',
      date: entry.date,
      hours: Math.floor(entry.totalMinutes / 60).toString(),
      minutes: (entry.totalMinutes % 60).toString(),
      description: entry.description,
      technician: entry.technician,
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
    saveEntries(entries.filter(e => e.id !== id));
    showToast('Kayıt silindi.', 'warning');
  };

  const formatDuration = (totalMinutes) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0) return `${m}dk`;
    if (m === 0) return `${h}s`;
    return `${h}s ${m}dk`;
  };

  const getIncidentLabel = (incidentId) => {
    if (!incidentId) return 'Genel';
    const inc = incidents.find(i => i.id === parseInt(incidentId));
    if (!inc) return 'Bilinmiyor';
    const client = clients.find(c => c.id === inc.clientId);
    return `${client?.name || 'Müşteri'}: ${inc.description?.slice(0, 40)}`;
  };

  // Filter by date range
  const now = new Date();
  const getFilteredEntries = () => {
    let filtered = [...entries];

    if (filterDate === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(e => new Date(e.date) >= weekAgo);
    } else if (filterDate === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(e => new Date(e.date) >= monthAgo);
    }

    if (filterTechnician !== 'all') {
      filtered = filtered.filter(e => e.technician === filterTechnician);
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const filteredEntries = getFilteredEntries();

  // Stats
  const totalMinutes = filteredEntries.reduce((sum, e) => sum + e.totalMinutes, 0);
  const uniqueDays = new Set(filteredEntries.map(e => e.date)).size;
  const avgPerDay = uniqueDays > 0 ? Math.round(totalMinutes / uniqueDays) : 0;

  // Technician list
  const technicians = [...new Set(entries.map(e => e.technician))];

  // Group by date
  const groupedByDate = filteredEntries.reduce((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {});

  // Technician summary
  const techSummary = technicians.map(tech => {
    const techEntries = filteredEntries.filter(e => e.technician === tech);
    return {
      name: tech,
      totalMinutes: techEntries.reduce((s, e) => s + e.totalMinutes, 0),
      entryCount: techEntries.length,
    };
  }).sort((a, b) => b.totalMinutes - a.totalMinutes);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hizmet Saati Takibi</h1>
          <p className="page-subtitle">Teknisyen çalışma saatlerini olay bazlı kaydedin</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingEntry(null); setForm({ incidentId: '', date: new Date().toISOString().slice(0, 10), hours: '', minutes: '', description: '', technician: currentUser?.name || '' }); }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
            <path d="M8 3v10M3 8h10" strokeLinecap="round" />
          </svg>
          Süre Kaydet
        </button>
      </div>

      {/* Stats */}
      <div className="ts-stats">
        <div className="ts-stat-card">
          <div className="ts-stat-value">{formatDuration(totalMinutes)}</div>
          <div className="ts-stat-label">Toplam Süre</div>
        </div>
        <div className="ts-stat-card">
          <div className="ts-stat-value">{filteredEntries.length}</div>
          <div className="ts-stat-label">Kayıt Sayısı</div>
        </div>
        <div className="ts-stat-card">
          <div className="ts-stat-value">{uniqueDays}</div>
          <div className="ts-stat-label">Çalışılan Gün</div>
        </div>
        <div className="ts-stat-card">
          <div className="ts-stat-value">{formatDuration(avgPerDay)}</div>
          <div className="ts-stat-label">Gün Ort.</div>
        </div>
      </div>

      {/* Filters */}
      <div className="ts-filters">
        <div className="ts-filter-group">
          <button className={`ts-filter-btn ${filterDate === 'week' ? 'active' : ''}`} onClick={() => setFilterDate('week')}>Bu Hafta</button>
          <button className={`ts-filter-btn ${filterDate === 'month' ? 'active' : ''}`} onClick={() => setFilterDate('month')}>Bu Ay</button>
          <button className={`ts-filter-btn ${filterDate === 'all' ? 'active' : ''}`} onClick={() => setFilterDate('all')}>Tümü</button>
        </div>
        {technicians.length > 1 && (
          <select className="filter-select" value={filterTechnician} onChange={e => setFilterTechnician(e.target.value)}>
            <option value="all">Tüm Teknisyenler</option>
            {technicians.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
      </div>

      <div className="ts-layout">
        {/* Main: Entries grouped by date */}
        <div className="ts-entries">
          {Object.keys(groupedByDate).length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{ opacity: 0.25 }}>
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" />
              </svg>
              <p>Henüz çalışma saati kaydı yok.</p>
            </div>
          ) : (
            Object.entries(groupedByDate).map(([date, dayEntries]) => {
              const dayTotal = dayEntries.reduce((s, e) => s + e.totalMinutes, 0);
              return (
                <div key={date} className="ts-day-group">
                  <div className="ts-day-header">
                    <span className="ts-day-date">
                      {new Date(date).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="ts-day-total">{formatDuration(dayTotal)}</span>
                  </div>
                  {dayEntries.map(entry => (
                    <div key={entry.id} className="ts-entry-card">
                      <div className="ts-entry-duration">
                        <span className="ts-duration-value">{formatDuration(entry.totalMinutes)}</span>
                      </div>
                      <div className="ts-entry-body">
                        <div className="ts-entry-desc">{entry.description}</div>
                        <div className="ts-entry-meta">
                          <span className="ts-entry-incident">{getIncidentLabel(entry.incidentId)}</span>
                          <span className="ts-entry-tech"> {entry.technician}</span>
                        </div>
                      </div>
                      <div className="ts-entry-actions">
                        <button className="btn-icon" title="Düzenle" onClick={() => handleEdit(entry)}>
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M11 2l3 3-8 8H3v-3l8-8z" strokeLinejoin="round" /></svg>
                        </button>
                        <button className="btn-icon delete" title="Sil" onClick={() => handleDelete(entry.id)}>
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M3 4h10M6 4V3h4v1M5 4v9h6V4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar: technician summary */}
        {techSummary.length > 0 && (
          <div className="ts-sidebar">
            <div className="ts-sidebar-card">
              <h3>Teknisyen Özeti</h3>
              {techSummary.map(tech => {
                const maxMin = Math.max(...techSummary.map(t => t.totalMinutes), 1);
                const pct = Math.round((tech.totalMinutes / maxMin) * 100);
                return (
                  <div key={tech.name} className="ts-tech-row">
                    <div className="ts-tech-info">
                      <span className="ts-tech-name">{tech.name}</span>
                      <span className="ts-tech-time">{formatDuration(tech.totalMinutes)} ({tech.entryCount} kayıt)</span>
                    </div>
                    <div className="ts-tech-bar">
                      <div className="ts-tech-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content ts-form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEntry ? 'Kaydı Düzenle' : 'Çalışma Saati Kaydet'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}></button>
            </div>
            <form onSubmit={handleSubmit} className="ts-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Tarih</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Teknisyen</label>
                  <input type="text" value={form.technician} onChange={e => setForm({ ...form, technician: e.target.value })} placeholder="Teknisyen adı" />
                </div>
              </div>
              <div className="form-group">
                <label>İlişkili Arıza (Opsiyonel)</label>
                <select value={form.incidentId} onChange={e => setForm({ ...form, incidentId: e.target.value })}>
                  <option value="">Genel çalışma</option>
                  {incidents.filter(i => i.status !== 'cancelled').map(inc => {
                    const client = clients.find(c => c.id === inc.clientId);
                    return <option key={inc.id} value={inc.id}>{client?.name}: {inc.description?.slice(0, 50)}</option>;
                  })}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Saat</label>
                  <input type="number" min="0" max="24" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Dakika</label>
                  <input type="number" min="0" max="59" value={form.minutes} onChange={e => setForm({ ...form, minutes: e.target.value })} placeholder="0" />
                </div>
              </div>
              <div className="form-group">
                <label>Açıklama *</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Yapılan iş hakkında kısa açıklama..." required />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">{editingEntry ? 'Güncelle' : 'Kaydet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimesheetPage;
