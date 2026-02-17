import React, { useState } from 'react';
import IncidentFilters from '../components/IncidentFilters';
import IncidentList from '../components/IncidentList';
import IncidentForm from '../components/IncidentForm';

function IncidentsPage({ 
  incidents, 
  clients, 
  addIncident, 
  resolveIncident, 
  updateIncidentStatus, 
  addIncidentNote 
}) {
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    client: 'all'
  });

  const filteredIncidents = incidents.filter(inc => {
    if (filters.search && !inc.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status !== 'all' && inc.status !== filters.status) {
      return false;
    }
    if (filters.priority !== 'all' && inc.priority !== filters.priority) {
      return false;
    }
    return true;
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>🔧 Arıza Yönetimi</h1>
          <p>Tüm arıza kayıtlarını görüntüle ve yönet</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Formu Kapat' : '+ Yeni Arıza'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <IncidentForm clients={clients} addIncident={(inc) => {
            addIncident(inc);
            setShowForm(false);
          }} />
        </div>
      )}

      <div className="card">
        <h2>📋 Arıza Listesi ({filteredIncidents.length} kayıt)</h2>
        <IncidentFilters onFilterChange={setFilters} />
        <IncidentList 
          incidents={filteredIncidents} 
          clients={clients}
          resolveIncident={resolveIncident}
          updateIncidentStatus={updateIncidentStatus}
          addIncidentNote={addIncidentNote}
        />
      </div>
    </div>
  );
}

export default IncidentsPage;