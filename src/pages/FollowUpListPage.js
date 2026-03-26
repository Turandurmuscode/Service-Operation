import React, { useMemo, useState } from 'react';
import './FollowUpListPage.css';

const STORAGE_KEY = 'sod_followup_tasks';

function readTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function fmtDate(dateText) {
  if (!dateText) return '-';
  return new Date(dateText).toLocaleDateString('tr-TR');
}

export default function FollowUpListPage({ clients = [], currentUser, showToast }) {
  const [tasks, setTasks] = useState(readTasks);
  const [form, setForm] = useState({
    title: '',
    clientId: '',
    owner: currentUser?.name || '',
    dueDate: '',
    priority: 'normal',
    channel: 'phone',
    note: '',
  });

  const persist = (next) => {
    setTasks(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addTask = () => {
    if (!form.title || !form.clientId || !form.dueDate) {
      showToast?.('Baslik, musteri ve tarih alanlari zorunlu', 'warning');
      return;
    }

    const now = new Date().toISOString();
    const task = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...form,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      completedAt: '',
    };

    persist([task, ...tasks]);
    setForm({
      title: '',
      clientId: '',
      owner: currentUser?.name || '',
      dueDate: '',
      priority: 'normal',
      channel: 'phone',
      note: '',
    });
    showToast?.('Takip kaydi eklendi', 'success');
  };

  const updateStatus = (taskId, status) => {
    const now = new Date().toISOString();
    const next = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            status,
            updatedAt: now,
            completedAt: status === 'done' ? now : '',
          }
        : task
    );
    persist(next);
  };

  const removeTask = (taskId) => {
    persist(tasks.filter((task) => task.id !== taskId));
    showToast?.('Takip kaydi silindi', 'warning');
  };

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const pending = tasks.filter((task) => task.status === 'pending');
    const overdue = pending.filter((task) => task.dueDate < today).length;
    const todayCount = pending.filter((task) => task.dueDate === today).length;
    const completed = tasks.filter((task) => task.status === 'done').length;

    return {
      pending: pending.length,
      overdue,
      todayCount,
      completed,
    };
  }, [tasks]);

  const pendingTasks = useMemo(
    () => tasks.filter((task) => task.status === 'pending').sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [tasks]
  );
  const completedTasks = useMemo(
    () => tasks.filter((task) => task.status === 'done').sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [tasks]
  );

  return (
    <div className="page-content followup-page">
      <div className="page-header">
        <div>
          <h1>Geri Arama / Takip Listesi</h1>
          <p>Bugun, geciken ve tamamlanan takipleri tek ekranda yonetin</p>
        </div>
      </div>

      <div className="followup-kpis">
        <div className="followup-kpi card"><span>Bekleyen</span><strong>{stats.pending}</strong></div>
        <div className="followup-kpi card"><span>Bugun</span><strong>{stats.todayCount}</strong></div>
        <div className="followup-kpi card"><span>Geciken</span><strong>{stats.overdue}</strong></div>
        <div className="followup-kpi card"><span>Tamamlanan</span><strong>{stats.completed}</strong></div>
      </div>

      <div className="followup-form card">
        <h3>Yeni Takip</h3>
        <div className="followup-grid">
          <input
            placeholder="Takip basligi"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />
          <select
            value={form.clientId}
            onChange={(event) => setForm({ ...form, clientId: event.target.value })}
          >
            <option value="">Musteri sec</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={form.dueDate}
            onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
          />
          <input
            placeholder="Sorumlu"
            value={form.owner}
            onChange={(event) => setForm({ ...form, owner: event.target.value })}
          />
          <select
            value={form.priority}
            onChange={(event) => setForm({ ...form, priority: event.target.value })}
          >
            <option value="low">Dusuk</option>
            <option value="normal">Normal</option>
            <option value="high">Yuksek</option>
          </select>
          <select
            value={form.channel}
            onChange={(event) => setForm({ ...form, channel: event.target.value })}
          >
            <option value="phone">Telefon</option>
            <option value="email">E-posta</option>
            <option value="meeting">Toplanti</option>
          </select>
        </div>
        <textarea
          rows={2}
          placeholder="Not"
          value={form.note}
          onChange={(event) => setForm({ ...form, note: event.target.value })}
        />
        <button className="btn btn-primary" onClick={addTask}>Takip Ekle</button>
      </div>

      <div className="followup-lists">
        <div className="card">
          <h3>Bekleyen Takipler</h3>
          {pendingTasks.length === 0 && <p className="followup-empty">Bekleyen takip yok</p>}
          <div className="followup-items">
            {pendingTasks.map((task) => {
              const clientName = clients.find((client) => Number(client.id) === Number(task.clientId))?.name || 'Musteri yok';
              const overdue = task.dueDate < new Date().toISOString().split('T')[0];
              return (
                <div key={task.id} className={`followup-item ${overdue ? 'is-overdue' : ''}`}>
                  <div>
                    <strong>{task.title}</strong>
                    <p>{clientName} · {task.owner || 'Atanmadi'} · {task.channel}</p>
                    <p>{fmtDate(task.dueDate)} · {task.priority}</p>
                    {task.note && <p>{task.note}</p>}
                  </div>
                  <div className="followup-actions">
                    <button className="btn btn-sm" onClick={() => updateStatus(task.id, 'done')}>Tamamla</button>
                    <button className="btn btn-sm" onClick={() => removeTask(task.id)}>Sil</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3>Son Tamamlananlar</h3>
          {completedTasks.length === 0 && <p className="followup-empty">Tamamlanan takip yok</p>}
          <div className="followup-items">
            {completedTasks.slice(0, 12).map((task) => (
              <div key={task.id} className="followup-item is-done">
                <div>
                  <strong>{task.title}</strong>
                  <p>Tamamlandi: {fmtDate(task.completedAt || task.updatedAt)}</p>
                </div>
                <div className="followup-actions">
                  <button className="btn btn-sm" onClick={() => updateStatus(task.id, 'pending')}>Geri Al</button>
                  <button className="btn btn-sm" onClick={() => removeTask(task.id)}>Sil</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
