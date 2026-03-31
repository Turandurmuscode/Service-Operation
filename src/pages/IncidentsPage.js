import React, { useState } from 'react';
import IncidentFilters from '../components/IncidentFilters';
import Icon from '../components/Icon';
import IncidentList from '../components/IncidentList';
import IncidentForm from '../components/IncidentForm';

function IncidentsPage({
  incidents,
  clients,
  addIncident,
  resolveIncident,
  updateIncidentStatus,
  addIncidentNote,
  updateIncident,
}) {
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    technician: 'all',
  });

  const filteredIncidents = incidents.filter(inc => {
    if (filters.search && !inc.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.status !== 'all' && inc.status !== filters.status) return false;
    if (filters.priority !== 'all' && inc.priority !== filters.priority) return false;
    if (filters.technician !== 'all') {
      if (filters.technician === 'unassigned') {
        if (inc.technicianId) return false;
      } else {
        if (inc.technicianId !== parseInt(filters.technician)) return false;
      }
    }
    return true;
  });

  const getIncidentLastActivityAt = (incident) => {
    const noteTimes = Array.isArray(incident.notes)
      ? incident.notes
          .map((note) => new Date(note.timestamp || 0).getTime())
          .filter((value) => Number.isFinite(value) && value > 0)
      : [];
    const fallback = [
      new Date(incident.updatedAt || 0).getTime(),
      new Date(incident.endTime || 0).getTime(),
      new Date(incident.startTime || 0).getTime(),
    ].filter((value) => Number.isFinite(value) && value > 0);

    return Math.max(...noteTimes, ...fallback, 0);
  };

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const forgottenIncidents = incidents
    .filter((incident) => incident.status !== 'resolved' && incident.status !== 'cancelled')
    .map((incident) => ({ ...incident, _lastActivityAt: getIncidentLastActivityAt(incident) }))
    .filter((incident) => incident._lastActivityAt < startOfToday.getTime())
    .sort((a, b) => a._lastActivityAt - b._lastActivityAt);

  const fmtAgo = (timestamp) => {
    if (!timestamp) return 'Bilinmiyor';
    const diffMs = Date.now() - timestamp;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours < 24) return `${hours} saattir guncellenmedi`;
    const days = Math.floor(hours / 24);
    return `${days} gundur guncellenmedi`;
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1><Icon name="bolt" size={20} /> Arıza Yönetimi</h1>
          <p>Tüm arıza kayıtlarını görüntüle ve yönet</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? ' Formu Kapat' : '+ Yeni Arıza'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <IncidentForm clients={clients} addIncident={(inc) => { addIncident(inc); setShowForm(false); }} />
        </div>
      )}

      <div className="card" style={{ marginBottom: '16px', borderLeft: '4px solid #f59e0b' }}>
        <h2><Icon name="clock" size={16} /> Bugun Unutulanlar Kutusu ({forgottenIncidents.length})</h2>
        {forgottenIncidents.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Harika, bugun guncellenmemis acik is yok.</p>
        ) : (
          <div style={{ display: 'grid', gap: '8px' }}>
            {forgottenIncidents.slice(0, 8).map((incident) => {
              const client = clients.find((item) => item.id === incident.clientId);
              return (
                <div key={incident.id} style={{
                  display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center',
                  padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {incident.description}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {client?.name || 'Musteri bilinmiyor'} · {fmtAgo(incident._lastActivityAt)}
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '999px', background: '#f59e0b20', color: '#f59e0b', fontWeight: 700 }}>
                    {incident.priority === 'critical' ? 'Kritik' : incident.priority === 'medium' ? 'Orta' : 'Dusuk'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card">
        <h2><Icon name="clipboard" size={16} /> Arıza Listesi ({filteredIncidents.length} kayıt)</h2>
        <IncidentFilters onFilterChange={setFilters} />
        <IncidentList
          incidents={filteredIncidents}
          clients={clients}
          resolveIncident={resolveIncident}
          updateIncidentStatus={updateIncidentStatus}
          addIncidentNote={addIncidentNote}
          updateIncident={updateIncident}
        />
      </div>
    </div>
  );
}

export default IncidentsPage;