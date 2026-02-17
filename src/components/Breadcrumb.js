import React from 'react';
import './Breadcrumb.css';

function Breadcrumb({ activeTab, setActiveTab }) {
  const paths = {
    'dashboard': [{ label: 'Dashboard', icon: '📊' }],
    'incidents': [{ label: 'Dashboard', icon: '📊', tab: 'dashboard' }, { label: 'Arızalar', icon: '🔧' }],
    'clients': [{ label: 'Dashboard', icon: '📊', tab: 'dashboard' }, { label: 'Müşteriler', icon: '👥' }],
    'kanban': [{ label: 'Dashboard', icon: '📊', tab: 'dashboard' }, { label: 'Kanban', icon: '📋' }],
    'analytics': [{ label: 'Dashboard', icon: '📊', tab: 'dashboard' }, { label: 'Analiz', icon: '📈' }],
    'calendar': [{ label: 'Dashboard', icon: '📊', tab: 'dashboard' }, { label: 'Takvim', icon: '📅' }],
    'reports': [{ label: 'Dashboard', icon: '📊', tab: 'dashboard' }, { label: 'Raporlar', icon: '📄' }],
    'settings': [{ label: 'Dashboard', icon: '📊', tab: 'dashboard' }, { label: 'Ayarlar', icon: '⚙️' }],
  };

  const currentPath = paths[activeTab] || paths['dashboard'];

  return (
    <div className="breadcrumb">
      {currentPath.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="breadcrumb-separator">/</span>}
          <button
            className={`breadcrumb-item ${index === currentPath.length - 1 ? 'active' : ''}`}
            onClick={() => item.tab && setActiveTab(item.tab)}
            disabled={!item.tab}
          >
            <span className="breadcrumb-icon">{item.icon}</span>
            <span className="breadcrumb-label">{item.label}</span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

export default Breadcrumb;