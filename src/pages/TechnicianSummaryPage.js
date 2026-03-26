import React, { useMemo, useState } from 'react';
import './TechnicianSummaryPage.css';

const STORAGE_KEY = 'sod_tech_endofday';

function readSummaries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export default function TechnicianSummaryPage({ currentUser, showToast }) {
  const today = new Date().toISOString().split('T')[0];
  const [summaries, setSummaries] = useState(readSummaries);
  const [form, setForm] = useState({
    date: today,
    technician: currentUser?.name || '',
    completedJobs: 0,
    unresolvedCount: 0,
    blocker: '',
    tomorrowPlan: '',
    notes: '',
  });

  const persist = (next) => {
    setSummaries(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const saveSummary = () => {
    if (!form.technician || !form.date) {
      showToast?.('Teknisyen ve tarih zorunlu', 'warning');
      return;
    }

    const now = new Date().toISOString();
    const key = `${form.technician}-${form.date}`;
    const payload = {
      id: key,
      ...form,
      completedJobs: Number(form.completedJobs) || 0,
      unresolvedCount: Number(form.unresolvedCount) || 0,
      updatedAt: now,
    };

    const existing = summaries.some((summary) => summary.id === key);
    const next = existing
      ? summaries.map((summary) => (summary.id === key ? payload : summary))
      : [payload, ...summaries];

    persist(next);
    showToast?.(existing ? 'Gun sonu ozeti guncellendi' : 'Gun sonu ozeti kaydedildi', 'success');
  };

  const removeSummary = (id) => {
    persist(summaries.filter((summary) => summary.id !== id));
    showToast?.('Kayit silindi', 'warning');
  };

  const todayStats = useMemo(() => {
    const todays = summaries.filter((summary) => summary.date === today);
    return {
      totalTechs: todays.length,
      completedJobs: todays.reduce((sum, summary) => sum + (summary.completedJobs || 0), 0),
      unresolved: todays.reduce((sum, summary) => sum + (summary.unresolvedCount || 0), 0),
    };
  }, [summaries, today]);

  return (
    <div className="page-content tech-summary-page">
      <div className="page-header">
        <div>
          <h1>Teknisyen Gun Sonu Ozeti</h1>
          <p>Sahadan gelen gunluk ozetleri tek formatta toplayin</p>
        </div>
      </div>

      <div className="tech-summary-kpis">
        <div className="card"><span>Bugun Ozet Giren</span><strong>{todayStats.totalTechs}</strong></div>
        <div className="card"><span>Tamamlanan Is</span><strong>{todayStats.completedJobs}</strong></div>
        <div className="card"><span>Acik Problem</span><strong>{todayStats.unresolved}</strong></div>
      </div>

      <div className="card tech-summary-form">
        <h3>Yeni / Guncelleme</h3>
        <div className="tech-summary-grid">
          <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
          <input placeholder="Teknisyen" value={form.technician} onChange={(event) => setForm({ ...form, technician: event.target.value })} />
          <input type="number" min="0" placeholder="Tamamlanan is" value={form.completedJobs} onChange={(event) => setForm({ ...form, completedJobs: event.target.value })} />
          <input type="number" min="0" placeholder="Acik problem" value={form.unresolvedCount} onChange={(event) => setForm({ ...form, unresolvedCount: event.target.value })} />
        </div>
        <textarea rows={2} placeholder="Kritik engel" value={form.blocker} onChange={(event) => setForm({ ...form, blocker: event.target.value })} />
        <textarea rows={2} placeholder="Yarina kalan plan" value={form.tomorrowPlan} onChange={(event) => setForm({ ...form, tomorrowPlan: event.target.value })} />
        <textarea rows={2} placeholder="Ek not" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        <button className="btn btn-primary" onClick={saveSummary}>Ozeti Kaydet</button>
      </div>

      <div className="card">
        <h3>Son Ozetler</h3>
        <div className="tech-summary-list">
          {summaries.length === 0 && <p className="tech-summary-empty">Henuz kayit yok</p>}
          {summaries.slice(0, 20).map((summary) => (
            <div key={summary.id} className="tech-summary-item">
              <div>
                <strong>{summary.technician}</strong>
                <p>{new Date(summary.date).toLocaleDateString('tr-TR')} · {summary.completedJobs} is · {summary.unresolvedCount} acik</p>
                {summary.blocker && <p>Engel: {summary.blocker}</p>}
                {summary.tomorrowPlan && <p>Plan: {summary.tomorrowPlan}</p>}
              </div>
              <button className="btn btn-sm" onClick={() => removeSummary(summary.id)}>Sil</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
