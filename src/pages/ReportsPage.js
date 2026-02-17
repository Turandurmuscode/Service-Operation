import React from 'react';
import ReportGenerator from '../components/ReportGenerator';
import DataExport from '../components/DataExport';
import DataManagement from '../components/DataManagement';

function ReportsPage({ 
  clients, 
  incidents, 
  setClients, 
  setIncidents, 
  setActivities,
  showToast 
}) {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1>📄 Raporlar ve Veri Yönetimi</h1>
        <p>Raporları indirin ve verilerinizi yönetin</p>
      </div>

      <div className="reports-grid">
        <ReportGenerator incidents={incidents} clients={clients} />
        
        <div className="card">
          <h2>📂 Veri Yönetimi</h2>
          <DataExport 
            incidents={incidents} 
            clients={clients}
            setClients={setClients}
            showToast={showToast}
          />
          <hr style={{ margin: '14px 0', border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }} />
          <DataManagement
            clients={clients}
            incidents={incidents}
            setClients={setClients}
            setIncidents={setIncidents}
            setActivities={setActivities}
            showToast={showToast}
          />
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;