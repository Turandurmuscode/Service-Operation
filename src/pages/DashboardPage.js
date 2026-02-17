import React from 'react';
import DashboardWidgets from '../components/DashboardWidgets';
import SLAMonitor from '../components/SLAMonitor';
import StatCards from '../components/StatCards';
import ImprovedCharts from '../components/ImprovedCharts';
import ActivityLog from '../components/ActivityLog';
import HeroCard from '../components/HeroCard';

function DashboardPage({ incidents, clients, activities, onNavigate }) {
  return (
    <div className="page-content" style={{ padding: 0 }}>
      {/* Hero Card */}
      <HeroCard
        incidents={incidents}
        clients={clients}
        onNavigate={onNavigate}
      />

      {/* Widgets */}
      <DashboardWidgets incidents={incidents} clients={clients} />

      {/* SLA */}
      <SLAMonitor incidents={incidents} />

      {/* Alt grid */}
      <div className="dashboard-grid">
        <div className="dashboard-col-left">
          <StatCards incidents={incidents} />
          <ActivityLog activities={activities} />
        </div>
        <div className="dashboard-col-right">
          <ImprovedCharts clients={clients} incidents={incidents} />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;