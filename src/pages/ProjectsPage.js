import React, { useState, useEffect, useCallback } from 'react';
import './ProjectsPage.css';

/* ════════════════════════════════════════════════════════════
   SVG ICONS
   ════════════════════════════════════════════════════════════ */
const Icons = {
  plus: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>,
  folder: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h4l1.5 1.5H14v8H2V4Z" strokeLinejoin="round"/></svg>,
  calendar: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1.5" y="2.5" width="13" height="12" rx="1.5"/><path d="M5 1.5v2M11 1.5v2M1.5 6.5h13" strokeLinecap="round"/></svg>,
  flag: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 14V2M3 2h9l-2 3 2 3H3"/></svg>,
  check: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8.5l3 3 6-6"/></svg>,
  clock: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5v4l2.5 1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  users: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="5" r="2"/><path d="M1.5 14c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" strokeLinecap="round"/><circle cx="11.5" cy="5.5" r="1.5"/><path d="M11.5 9c1.8 0 3.2 1.2 3.2 3" strokeLinecap="round"/></svg>,
  trash: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2.5 4h11M5.5 4V2.5h5V4M6.5 7v4M9.5 7v4M3.5 4l.5 9h8l.5-9"/></svg>,
  edit: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3.5l3.5 3.5M3 10.5V14h3.5L14 6.5 10.5 3 3 10.5Z"/></svg>,
  eye: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z"/><circle cx="8" cy="8" r="2"/></svg>,
  link: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 10l4-4M5 8L3.5 9.5a2.12 2.12 0 003 3L8 11M11 8l1.5-1.5a2.12 2.12 0 00-3-3L8 5"/></svg>,
  arrowRight: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>,
  milestone: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 14V2M4 2l8 4-8 4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chart: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 13V7M7 13V4M11 13V9M15 13V6"/></svg>,
  close: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>,
  search: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14" strokeLinecap="round"/></svg>,
  chevronDown: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6l4 4 4-4"/></svg>,
  client: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 7h6M5 10h4" strokeLinecap="round"/></svg>,
  warning: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2L14 13H2L8 2Z" strokeLinejoin="round"/><path d="M8 6.5v3M8 11v.5" strokeLinecap="round"/></svg>,
};

/* ════════════════════════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════════════════════════ */
const PROJECT_STATUSES = [
  { id: 'planning', label: 'Planlama', color: '#6366f1' },
  { id: 'active',   label: 'Aktif',    color: '#10b981' },
  { id: 'on-hold',  label: 'Beklemede', color: '#f59e0b' },
  { id: 'completed', label: 'Tamamlandı', color: '#06b6d4' },
  { id: 'cancelled', label: 'İptal', color: '#ef4444' },
];

const TASK_STATUSES = [
  { id: 'pending',     label: 'Bekliyor',   color: '#94a3b8' },
  { id: 'in-progress', label: 'Devam Ediyor', color: '#6366f1' },
  { id: 'completed',   label: 'Tamamlandı', color: '#10b981' },
  { id: 'blocked',     label: 'Engellendi', color: '#ef4444' },
];

const PRIORITY_MAP = {
  low:    { label: 'Düşük',  color: '#10b981' },
  medium: { label: 'Orta',   color: '#f59e0b' },
  high:   { label: 'Yüksek', color: '#ef4444' },
};

/* ════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════ */
const fmtDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const daysBetween = (a, b) => {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.max(1, Math.ceil((d2 - d1) / 86400000));
};

const daysDiff = (a, b) => Math.ceil((new Date(b) - new Date(a)) / 86400000);

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/* ════════════════════════════════════════════════════════════
   GANTT BAR COMPONENT
   ════════════════════════════════════════════════════════════ */
function GanttBar({ task, projectStart, totalDays, allTasks }) {
  const offset = daysDiff(projectStart, task.startDate);
  const duration = daysBetween(task.startDate, task.endDate);
  const left = Math.max(0, (offset / totalDays) * 100);
  const width = Math.max(2, (duration / totalDays) * 100);
  const statusColor = TASK_STATUSES.find(s => s.id === task.status)?.color || '#94a3b8';
  const depTask = task.dependsOn ? allTasks.find(t => t.id === task.dependsOn) : null;

  return (
    <div className="prj-gantt-row">
      <div className="prj-gantt-label">
        <span className="prj-gantt-task-name">{task.name}</span>
        <span className="prj-gantt-task-assignee">{task.assignee}</span>
      </div>
      <div className="prj-gantt-track">
        <div
          className="prj-gantt-bar"
          style={{ left: `${left}%`, width: `${width}%`, background: statusColor }}
          title={`${task.name}: ${fmtDate(task.startDate)} – ${fmtDate(task.endDate)} (${task.progress}%)`}
        >
          <div className="prj-gantt-bar-fill" style={{ width: `${task.progress}%`, opacity: 0.3 }} />
          <span className="prj-gantt-bar-text">{task.progress}%</span>
        </div>
        {depTask && (
          <div className="prj-gantt-dep" title={`Bağımlı: ${depTask.name}`}>
            {Icons.link(10)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function ProjectsPage({ darkMode }) {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create | edit
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [activeView, setActiveView] = useState('list'); // list | gantt

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sod_projects');
    if (saved) {
      try { setProjects(JSON.parse(saved)); } catch { setProjects([]); }
    } else {
      setProjects([]);
    }
  }, []);

  const persist = useCallback((data) => {
    setProjects(data);
    localStorage.setItem('sod_projects', JSON.stringify(data));
  }, []);

  /* ── Project Form State ─────────────────────────────────── */
  const emptyForm = { name: '', client: '', status: 'planning', priority: 'medium', startDate: '', endDate: '', budget: '', description: '', manager: '' };
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setForm(emptyForm); setModalMode('create'); setShowModal(true); };
  const openEdit = (p) => {
    setForm({ name: p.name, client: p.client, status: p.status, priority: p.priority, startDate: p.startDate, endDate: p.endDate, budget: p.budget, description: p.description, manager: p.manager });
    setModalMode('edit');
    setShowModal(true);
  };

  const saveProject = () => {
    if (!form.name || !form.startDate || !form.endDate) return;
    if (modalMode === 'create') {
      const newP = { ...form, id: 'PRJ-' + uid(), budget: Number(form.budget) || 0, progress: 0, milestones: [], tasks: [] };
      persist([newP, ...projects]);
    } else {
      persist(projects.map(p => p.id === selectedProject.id ? { ...p, ...form, budget: Number(form.budget) || 0 } : p));
      setSelectedProject(prev => ({ ...prev, ...form, budget: Number(form.budget) || 0 }));
    }
    setShowModal(false);
  };

  const deleteProject = (id) => {
    if (!window.confirm('Bu projeyi silmek istediğinize emin misiniz?')) return;
    persist(projects.filter(p => p.id !== id));
    if (selectedProject?.id === id) setSelectedProject(null);
  };

  /* ── Task Form ──────────────────────────────────────────── */
  const emptyTask = { name: '', assignee: '', status: 'pending', startDate: '', endDate: '', dependsOn: '', progress: 0 };
  const [taskForm, setTaskForm] = useState(emptyTask);

  const openAddTask = () => { setTaskForm(emptyTask); setEditingTask(null); setShowTaskModal(true); };
  const openEditTask = (t) => { setTaskForm({ ...t, dependsOn: t.dependsOn || '' }); setEditingTask(t); setShowTaskModal(true); };

  const saveTask = () => {
    if (!taskForm.name || !taskForm.startDate || !taskForm.endDate) return;
    const updated = projects.map(p => {
      if (p.id !== selectedProject.id) return p;
      let tasks;
      if (editingTask) {
        tasks = p.tasks.map(t => t.id === editingTask.id ? { ...taskForm, id: t.id, progress: Number(taskForm.progress) } : t);
      } else {
        tasks = [...p.tasks, { ...taskForm, id: 't-' + uid(), dependsOn: taskForm.dependsOn || null, progress: Number(taskForm.progress) }];
      }
      const completedCount = tasks.filter(t => t.status === 'completed').length;
      const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
      return { ...p, tasks, progress };
    });
    persist(updated);
    setSelectedProject(updated.find(p => p.id === selectedProject.id));
    setShowTaskModal(false);
  };

  const deleteTask = (taskId) => {
    const updated = projects.map(p => {
      if (p.id !== selectedProject.id) return p;
      const tasks = p.tasks.filter(t => t.id !== taskId).map(t => t.dependsOn === taskId ? { ...t, dependsOn: null } : t);
      const completedCount = tasks.filter(t => t.status === 'completed').length;
      const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
      return { ...p, tasks, progress };
    });
    persist(updated);
    setSelectedProject(updated.find(p => p.id === selectedProject.id));
  };

  const toggleTaskStatus = (taskId) => {
    const updated = projects.map(p => {
      if (p.id !== selectedProject.id) return p;
      const tasks = p.tasks.map(t => {
        if (t.id !== taskId) return t;
        const newStatus = t.status === 'completed' ? 'pending' : 'completed';
        return { ...t, status: newStatus, progress: newStatus === 'completed' ? 100 : 0 };
      });
      const completedCount = tasks.filter(t => t.status === 'completed').length;
      const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
      return { ...p, tasks, progress };
    });
    persist(updated);
    setSelectedProject(updated.find(p => p.id === selectedProject.id));
  };

  /* ── Milestone Form ─────────────────────────────────────── */
  const [msForm, setMsForm] = useState({ name: '', date: '' });

  const saveMilestone = () => {
    if (!msForm.name || !msForm.date) return;
    const updated = projects.map(p => {
      if (p.id !== selectedProject.id) return p;
      return { ...p, milestones: [...p.milestones, { id: 'm-' + uid(), ...msForm, completed: false }] };
    });
    persist(updated);
    setSelectedProject(updated.find(p => p.id === selectedProject.id));
    setShowMilestoneModal(false);
    setMsForm({ name: '', date: '' });
  };

  const toggleMilestone = (msId) => {
    const updated = projects.map(p => {
      if (p.id !== selectedProject.id) return p;
      return { ...p, milestones: p.milestones.map(m => m.id === msId ? { ...m, completed: !m.completed } : m) };
    });
    persist(updated);
    setSelectedProject(updated.find(p => p.id === selectedProject.id));
  };

  const deleteMilestone = (msId) => {
    const updated = projects.map(p => {
      if (p.id !== selectedProject.id) return p;
      return { ...p, milestones: p.milestones.filter(m => m.id !== msId) };
    });
    persist(updated);
    setSelectedProject(updated.find(p => p.id === selectedProject.id));
  };

  /* ── Filtered List ──────────────────────────────────────── */
  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  /* ── Stats ──────────────────────────────────────────────── */
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    delayed: projects.filter(p => p.status === 'active' && new Date(p.endDate) < new Date()).length,
    completed: projects.filter(p => p.status === 'completed').length,
  };

  /* ═══════════════════════════════════════════════════════════
     DETAIL VIEW
     ═══════════════════════════════════════════════════════════ */
  if (selectedProject) {
    const p = selectedProject;
    const statusInfo = PROJECT_STATUSES.find(s => s.id === p.status);
    const totalDays = daysBetween(p.startDate, p.endDate);
    const elapsed = daysDiff(p.startDate, new Date().toISOString().split('T')[0]);
    const timeProgress = Math.min(100, Math.max(0, Math.round((elapsed / totalDays) * 100)));
    const isOverdue = p.status === 'active' && new Date(p.endDate) < new Date();

    return (
      <div className={`projects-page ${darkMode ? 'dark-mode' : ''}`}>
        {/* Back + Header */}
        <div className="prj-detail-header">
          <button className="prj-btn prj-btn-secondary" onClick={() => setSelectedProject(null)}>
            ← Projeler
          </button>
          <div className="prj-detail-title-row">
            <div>
              <h1>{p.name}</h1>
              <div className="prj-detail-meta">
                <span className="prj-status-badge" style={{ background: statusInfo?.color + '18', color: statusInfo?.color, borderColor: statusInfo?.color + '40' }}>
                  {statusInfo?.label}
                </span>
                <span className="prj-priority-badge" style={{ color: PRIORITY_MAP[p.priority]?.color }}>
                  {Icons.flag(12)} {PRIORITY_MAP[p.priority]?.label}
                </span>
                <span className="prj-meta-item">{Icons.client(13)} {p.client}</span>
                <span className="prj-meta-item">{Icons.users(13)} {p.manager}</span>
                {isOverdue && <span className="prj-overdue-badge">{Icons.warning(12)} Gecikmiş</span>}
              </div>
            </div>
            <div className="prj-detail-actions">
              <button className="prj-btn prj-btn-secondary prj-btn-sm" onClick={() => openEdit(p)}>{Icons.edit(14)} Düzenle</button>
            </div>
          </div>
        </div>

        {/* Progress + Info Cards */}
        <div className="prj-detail-info-row">
          <div className="prj-info-card">
            <div className="prj-info-label">Genel İlerleme</div>
            <div className="prj-progress-bar-wrap">
              <div className="prj-progress-bar" style={{ width: `${p.progress}%`, background: statusInfo?.color }} />
            </div>
            <div className="prj-progress-text">{p.progress}%</div>
          </div>
          <div className="prj-info-card">
            <div className="prj-info-label">Süre</div>
            <div className="prj-info-value">{fmtDate(p.startDate)} – {fmtDate(p.endDate)}</div>
            <div className="prj-progress-bar-wrap">
              <div className="prj-progress-bar" style={{ width: `${timeProgress}%`, background: timeProgress > 80 ? '#ef4444' : '#6366f1' }} />
            </div>
            <div className="prj-progress-text">{totalDays} gün ({timeProgress}% geçti)</div>
          </div>
          <div className="prj-info-card">
            <div className="prj-info-label">Bütçe</div>
            <div className="prj-info-value">₺{(p.budget || 0).toLocaleString('tr-TR')}</div>
          </div>
          <div className="prj-info-card">
            <div className="prj-info-label">Görevler</div>
            <div className="prj-info-value">{p.tasks.filter(t => t.status === 'completed').length} / {p.tasks.length}</div>
          </div>
        </div>

        {p.description && <div className="prj-description">{p.description}</div>}

        {/* Milestones */}
        <div className="prj-section">
          <div className="prj-section-header">
            <h3>{Icons.milestone(16)} Milestone'lar</h3>
            <button className="prj-btn prj-btn-primary prj-btn-sm" onClick={() => setShowMilestoneModal(true)}>{Icons.plus(14)} Ekle</button>
          </div>
          {p.milestones.length === 0 ? (
            <div className="prj-empty-sm">Henüz milestone eklenmedi</div>
          ) : (
            <div className="prj-milestones-list">
              {p.milestones.sort((a, b) => new Date(a.date) - new Date(b.date)).map(ms => (
                <div key={ms.id} className={`prj-milestone-item ${ms.completed ? 'completed' : ''}`}>
                  <button className="prj-ms-check" onClick={() => toggleMilestone(ms.id)}>
                    {ms.completed ? Icons.check(14) : <span className="prj-ms-circle" />}
                  </button>
                  <div className="prj-ms-info">
                    <span className="prj-ms-name">{ms.name}</span>
                    <span className="prj-ms-date">{fmtDate(ms.date)}</span>
                  </div>
                  <button className="prj-action-btn prj-action-btn-danger" onClick={() => deleteMilestone(ms.id)}>{Icons.trash(14)}</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks / Gantt View Toggle */}
        <div className="prj-section">
          <div className="prj-section-header">
            <h3>{Icons.chart(16)} Görevler</h3>
            <div className="prj-section-actions">
              <div className="prj-view-toggle">
                <button className={`prj-view-btn ${activeView === 'list' ? 'active' : ''}`} onClick={() => setActiveView('list')}>Liste</button>
                <button className={`prj-view-btn ${activeView === 'gantt' ? 'active' : ''}`} onClick={() => setActiveView('gantt')}>Gantt</button>
              </div>
              <button className="prj-btn prj-btn-primary prj-btn-sm" onClick={openAddTask}>{Icons.plus(14)} Görev Ekle</button>
            </div>
          </div>

          {p.tasks.length === 0 ? (
            <div className="prj-empty-sm">Henüz görev eklenmedi</div>
          ) : activeView === 'gantt' ? (
            /* ── Gantt View ──────────────────────── */
            <div className="prj-gantt-container">
              <div className="prj-gantt-header">
                <div className="prj-gantt-label-header">Görev</div>
                <div className="prj-gantt-track-header">
                  <span>{fmtDate(p.startDate)}</span>
                  <span>{fmtDate(p.endDate)}</span>
                </div>
              </div>
              {p.tasks.map(task => (
                <GanttBar key={task.id} task={task} projectStart={p.startDate} totalDays={totalDays} allTasks={p.tasks} />
              ))}
              {/* Milestone markers */}
              {p.milestones.map(ms => {
                const msOffset = daysDiff(p.startDate, ms.date);
                const msLeft = Math.max(0, Math.min(100, (msOffset / totalDays) * 100));
                return (
                  <div key={ms.id} className="prj-gantt-milestone" style={{ left: `calc(220px + ${msLeft}% * (100% - 220px) / 100)` }} title={`${ms.name}: ${fmtDate(ms.date)}`}>
                    <div className={`prj-gantt-ms-marker ${ms.completed ? 'completed' : ''}`}>{Icons.flag(10)}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── List View ───────────────────────── */
            <div className="prj-tasks-list">
              {p.tasks.map(task => {
                const statusInfo = TASK_STATUSES.find(s => s.id === task.status);
                const dep = task.dependsOn ? p.tasks.find(t => t.id === task.dependsOn) : null;
                return (
                  <div key={task.id} className={`prj-task-row ${task.status}`}>
                    <button className="prj-task-check" onClick={() => toggleTaskStatus(task.id)}>
                      {task.status === 'completed' ? Icons.check(14) : <span className="prj-task-circle" />}
                    </button>
                    <div className="prj-task-info">
                      <div className="prj-task-name-row">
                        <span className={`prj-task-name ${task.status === 'completed' ? 'done' : ''}`}>{task.name}</span>
                        <span className="prj-task-status-badge" style={{ background: statusInfo?.color + '18', color: statusInfo?.color }}>{statusInfo?.label}</span>
                      </div>
                      <div className="prj-task-detail-row">
                        <span>{Icons.users(12)} {task.assignee}</span>
                        <span>{Icons.calendar(12)} {fmtDate(task.startDate)} – {fmtDate(task.endDate)}</span>
                        {dep && <span className="prj-task-dep">{Icons.link(12)} {dep.name}</span>}
                      </div>
                      <div className="prj-task-progress-mini">
                        <div className="prj-task-progress-track">
                          <div className="prj-task-progress-fill" style={{ width: `${task.progress}%`, background: statusInfo?.color }} />
                        </div>
                        <span>{task.progress}%</span>
                      </div>
                    </div>
                    <div className="prj-task-actions">
                      <button className="prj-action-btn" onClick={() => openEditTask(task)}>{Icons.edit(14)}</button>
                      <button className="prj-action-btn prj-action-btn-danger" onClick={() => deleteTask(task.id)}>{Icons.trash(14)}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Task Modal ──────────────────────────── */}
        {showTaskModal && (
          <div className="prj-modal-overlay" onClick={() => setShowTaskModal(false)}>
            <div className="prj-modal" onClick={e => e.stopPropagation()}>
              <div className="prj-modal-header">
                <h2>{editingTask ? 'Görevi Düzenle' : 'Yeni Görev'}</h2>
                <button className="prj-modal-close" onClick={() => setShowTaskModal(false)}>×</button>
              </div>
              <div className="prj-form">
                <div className="prj-form-group">
                  <label>Görev Adı</label>
                  <input value={taskForm.name} onChange={e => setTaskForm({ ...taskForm, name: e.target.value })} placeholder="Görev adı..." />
                </div>
                <div className="prj-form-row">
                  <div className="prj-form-group">
                    <label>Atanan Kişi</label>
                    <input value={taskForm.assignee} onChange={e => setTaskForm({ ...taskForm, assignee: e.target.value })} placeholder="İsim..." />
                  </div>
                  <div className="prj-form-group">
                    <label>Durum</label>
                    <select value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                      {TASK_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="prj-form-row">
                  <div className="prj-form-group">
                    <label>Başlangıç</label>
                    <input type="date" value={taskForm.startDate} onChange={e => setTaskForm({ ...taskForm, startDate: e.target.value })} />
                  </div>
                  <div className="prj-form-group">
                    <label>Bitiş</label>
                    <input type="date" value={taskForm.endDate} onChange={e => setTaskForm({ ...taskForm, endDate: e.target.value })} />
                  </div>
                </div>
                <div className="prj-form-row">
                  <div className="prj-form-group">
                    <label>Bağımlılık</label>
                    <select value={taskForm.dependsOn} onChange={e => setTaskForm({ ...taskForm, dependsOn: e.target.value })}>
                      <option value="">Yok</option>
                      {p.tasks.filter(t => t.id !== (editingTask?.id)).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="prj-form-group">
                    <label>İlerleme (%{taskForm.progress})</label>
                    <input type="range" min="0" max="100" step="5" value={taskForm.progress} onChange={e => setTaskForm({ ...taskForm, progress: e.target.value })} />
                  </div>
                </div>
                <div className="prj-form-actions">
                  <button className="prj-btn prj-btn-secondary" onClick={() => setShowTaskModal(false)}>İptal</button>
                  <button className="prj-btn prj-btn-primary" onClick={saveTask}>Kaydet</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Milestone Modal ────────────────────── */}
        {showMilestoneModal && (
          <div className="prj-modal-overlay" onClick={() => setShowMilestoneModal(false)}>
            <div className="prj-modal prj-modal-sm" onClick={e => e.stopPropagation()}>
              <div className="prj-modal-header">
                <h2>{Icons.milestone(16)} Yeni Milestone</h2>
                <button className="prj-modal-close" onClick={() => setShowMilestoneModal(false)}>×</button>
              </div>
              <div className="prj-form">
                <div className="prj-form-group">
                  <label>Milestone Adı</label>
                  <input value={msForm.name} onChange={e => setMsForm({ ...msForm, name: e.target.value })} placeholder="Örn: Go-Live" />
                </div>
                <div className="prj-form-group">
                  <label>Tarih</label>
                  <input type="date" value={msForm.date} onChange={e => setMsForm({ ...msForm, date: e.target.value })} />
                </div>
                <div className="prj-form-actions">
                  <button className="prj-btn prj-btn-secondary" onClick={() => setShowMilestoneModal(false)}>İptal</button>
                  <button className="prj-btn prj-btn-primary" onClick={saveMilestone}>Ekle</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Project Form Modal ─────────────────── */}
        {showModal && (
          <div className="prj-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="prj-modal" onClick={e => e.stopPropagation()}>
              <div className="prj-modal-header">
                <h2>{modalMode === 'create' ? 'Yeni Proje' : 'Projeyi Düzenle'}</h2>
                <button className="prj-modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div className="prj-form">
                <div className="prj-form-group">
                  <label>Proje Adı</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Proje adı..." />
                </div>
                <div className="prj-form-row">
                  <div className="prj-form-group">
                    <label>Müşteri</label>
                    <input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} placeholder="Müşteri adı..." />
                  </div>
                  <div className="prj-form-group">
                    <label>Proje Yöneticisi</label>
                    <input value={form.manager} onChange={e => setForm({ ...form, manager: e.target.value })} placeholder="Yönetici adı..." />
                  </div>
                </div>
                <div className="prj-form-row">
                  <div className="prj-form-group">
                    <label>Durum</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      {PROJECT_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="prj-form-group">
                    <label>Öncelik</label>
                    <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                      <option value="low">Düşük</option>
                      <option value="medium">Orta</option>
                      <option value="high">Yüksek</option>
                    </select>
                  </div>
                </div>
                <div className="prj-form-row">
                  <div className="prj-form-group">
                    <label>Başlangıç</label>
                    <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                  </div>
                  <div className="prj-form-group">
                    <label>Bitiş</label>
                    <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                  </div>
                </div>
                <div className="prj-form-group">
                  <label>Bütçe (₺)</label>
                  <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="0" />
                </div>
                <div className="prj-form-group">
                  <label>Açıklama</label>
                  <textarea rows="2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Proje detayı..." />
                </div>
                <div className="prj-form-actions">
                  <button className="prj-btn prj-btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
                  <button className="prj-btn prj-btn-primary" onClick={saveProject}>{modalMode === 'create' ? 'Oluştur' : 'Kaydet'}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     LIST VIEW (Main)
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className={`projects-page ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <div className="prj-page-header">
        <div className="prj-header-left">
          <h1>{Icons.folder(20)} Proje Yönetimi</h1>
          <p>Kurulum, göç ve büyük servis projelerinizi yönetin</p>
        </div>
        <button className="prj-btn prj-btn-primary" onClick={openCreate}>{Icons.plus(15)} Yeni Proje</button>
      </div>

      {/* Stats */}
      <div className="prj-stats-row">
        <div className="prj-stat-card">
          <div className="prj-stat-icon" style={{ background: '#eef2ff', color: '#6366f1' }}>{Icons.folder(20)}</div>
          <div className="prj-stat-info"><div className="prj-stat-value">{stats.total}</div><div className="prj-stat-label">TOPLAM</div></div>
        </div>
        <div className="prj-stat-card">
          <div className="prj-stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>{Icons.chart(20)}</div>
          <div className="prj-stat-info"><div className="prj-stat-value">{stats.active}</div><div className="prj-stat-label">AKTİF</div></div>
        </div>
        <div className="prj-stat-card">
          <div className="prj-stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>{Icons.warning(20)}</div>
          <div className="prj-stat-info"><div className="prj-stat-value">{stats.delayed}</div><div className="prj-stat-label">GECİKMİŞ</div></div>
        </div>
        <div className="prj-stat-card">
          <div className="prj-stat-icon" style={{ background: '#cffafe', color: '#06b6d4' }}>{Icons.check(20)}</div>
          <div className="prj-stat-info"><div className="prj-stat-value">{stats.completed}</div><div className="prj-stat-label">TAMAMLANAN</div></div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="prj-toolbar">
        <div className="prj-search-box">
          {Icons.search(15)}
          <input placeholder="Proje veya müşteri ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          {searchTerm && <button className="prj-search-clear" onClick={() => setSearchTerm('')}>×</button>}
        </div>
        <select className="prj-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Tüm Durumlar</option>
          {PROJECT_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {/* Project Cards */}
      {filtered.length === 0 ? (
        <div className="prj-empty-state">
          <div className="prj-empty-icon">{Icons.folder(40)}</div>
          <p>Proje bulunamadı</p>
          <button className="prj-btn prj-btn-primary" onClick={openCreate}>{Icons.plus(14)} İlk Projeyi Oluştur</button>
        </div>
      ) : (
        <div className="prj-cards-grid">
          {filtered.map(p => {
            const statusInfo = PROJECT_STATUSES.find(s => s.id === p.status);
            const isOverdue = p.status === 'active' && new Date(p.endDate) < new Date();
            return (
              <div key={p.id} className="prj-project-card" onClick={() => setSelectedProject(p)}>
                <div className="prj-card-top">
                  <span className="prj-card-id">{p.id}</span>
                  <div className="prj-card-badges">
                    <span className="prj-status-badge" style={{ background: statusInfo?.color + '18', color: statusInfo?.color, borderColor: statusInfo?.color + '40' }}>
                      {statusInfo?.label}
                    </span>
                    {isOverdue && <span className="prj-overdue-badge">{Icons.warning(11)} Gecikmiş</span>}
                  </div>
                </div>
                <h3 className="prj-card-name">{p.name}</h3>
                <div className="prj-card-client">{Icons.client(13)} {p.client}</div>
                <div className="prj-card-progress-row">
                  <div className="prj-card-progress-track">
                    <div className="prj-card-progress-fill" style={{ width: `${p.progress}%`, background: statusInfo?.color }} />
                  </div>
                  <span className="prj-card-progress-text">{p.progress}%</span>
                </div>
                <div className="prj-card-bottom">
                  <span className="prj-card-dates">{Icons.calendar(12)} {fmtDate(p.startDate)} – {fmtDate(p.endDate)}</span>
                  <span className="prj-card-tasks">{p.tasks.filter(t => t.status === 'completed').length}/{p.tasks.length} görev</span>
                </div>
                <div className="prj-card-footer">
                  <span className="prj-card-manager">{Icons.users(12)} {p.manager}</span>
                  <div className="prj-card-actions" onClick={e => e.stopPropagation()}>
                    <button className="prj-action-btn" onClick={() => { setSelectedProject(p); openEdit(p); }}>{Icons.edit(13)}</button>
                    <button className="prj-action-btn prj-action-btn-danger" onClick={() => deleteProject(p.id)}>{Icons.trash(13)}</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Form Modal (used from list view) */}
      {showModal && !selectedProject && (
        <div className="prj-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="prj-modal" onClick={e => e.stopPropagation()}>
            <div className="prj-modal-header">
              <h2>Yeni Proje</h2>
              <button className="prj-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="prj-form">
              <div className="prj-form-group">
                <label>Proje Adı</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Proje adı..." />
              </div>
              <div className="prj-form-row">
                <div className="prj-form-group">
                  <label>Müşteri</label>
                  <input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} placeholder="Müşteri adı..." />
                </div>
                <div className="prj-form-group">
                  <label>Proje Yöneticisi</label>
                  <input value={form.manager} onChange={e => setForm({ ...form, manager: e.target.value })} placeholder="Yönetici adı..." />
                </div>
              </div>
              <div className="prj-form-row">
                <div className="prj-form-group">
                  <label>Durum</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {PROJECT_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div className="prj-form-group">
                  <label>Öncelik</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                  </select>
                </div>
              </div>
              <div className="prj-form-row">
                <div className="prj-form-group">
                  <label>Başlangıç</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="prj-form-group">
                  <label>Bitiş</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="prj-form-group">
                <label>Bütçe (₺)</label>
                <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="0" />
              </div>
              <div className="prj-form-group">
                <label>Açıklama</label>
                <textarea rows="2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Proje detayı..." />
              </div>
              <div className="prj-form-actions">
                <button className="prj-btn prj-btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
                <button className="prj-btn prj-btn-primary" onClick={saveProject}>Oluştur</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
