import React, { useMemo, useState } from 'react';
import './RecurringIssuesPage.css';

function normalizeText(text) {
  return String(text || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function RecurringIssuesPage({ incidents = [], clients = [] }) {
  const [periodDays, setPeriodDays] = useState(30);
  const [threshold, setThreshold] = useState(2);

  const recurringRows = useMemo(() => {
    const map = new Map();
    const cutoff = Date.now() - Number(periodDays) * 24 * 60 * 60 * 1000;

    incidents.forEach((incident) => {
      const createdAt = new Date(incident.startTime || incident.createdAt || Date.now()).getTime();
      if (createdAt < cutoff) return;
      const issueKey = normalizeText(incident.description || incident.title);
      if (!issueKey) return;
      const clientId = Number(incident.clientId) || 0;
      const key = `${clientId}::${issueKey}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          clientId,
          issue: incident.description || incident.title || 'Tanimsiz problem',
          count: 0,
          statuses: new Set(),
          latestAt: 0,
        });
      }

      const row = map.get(key);
      row.count += 1;
      row.statuses.add(incident.status || 'new');
      row.latestAt = Math.max(row.latestAt, createdAt);
    });

    return Array.from(map.values())
      .filter((row) => row.count >= Number(threshold))
      .sort((a, b) => b.count - a.count || b.latestAt - a.latestAt)
      .map((row) => ({
        ...row,
        clientName: clients.find((client) => Number(client.id) === Number(row.clientId))?.name || 'Musteri yok',
        statuses: Array.from(row.statuses),
      }));
  }, [incidents, clients, periodDays, threshold]);

  return (
    <div className="page-content recurring-page">
      <div className="page-header">
        <div>
          <h1>Tekrarlayan Ariza Takibi</h1>
          <p>Ayni musteri ve benzer ariza kombinasyonlarini erken tespit edin</p>
        </div>
      </div>

      <div className="card recurring-filters">
        <label>
          Donem
          <select value={periodDays} onChange={(event) => setPeriodDays(Number(event.target.value))}>
            <option value={30}>Son 30 gun</option>
            <option value={60}>Son 60 gun</option>
            <option value={90}>Son 90 gun</option>
          </select>
        </label>
        <label>
          Esik
          <select value={threshold} onChange={(event) => setThreshold(Number(event.target.value))}>
            <option value={2}>2 ve uzeri</option>
            <option value={3}>3 ve uzeri</option>
            <option value={4}>4 ve uzeri</option>
          </select>
        </label>
        <div className="recurring-summary">
          <span>Tespit edilen tekrar</span>
          <strong>{recurringRows.length}</strong>
        </div>
      </div>

      <div className="card recurring-table-wrap">
        <table className="recurring-table">
          <thead>
            <tr>
              <th>Musteri</th>
              <th>Ariza Basligi</th>
              <th>Tekrar</th>
              <th>Son Durumlar</th>
              <th>Son Kayit</th>
            </tr>
          </thead>
          <tbody>
            {recurringRows.length === 0 && (
              <tr>
                <td colSpan={5} className="recurring-empty">Secilen kritere gore tekrarlayan ariza bulunamadi.</td>
              </tr>
            )}
            {recurringRows.map((row) => (
              <tr key={row.key}>
                <td>{row.clientName}</td>
                <td>{row.issue}</td>
                <td><strong>{row.count}</strong></td>
                <td>{row.statuses.join(', ')}</td>
                <td>{new Date(row.latestAt).toLocaleDateString('tr-TR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
