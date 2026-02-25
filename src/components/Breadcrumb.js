import React from 'react';
import './Breadcrumb.css';
import Icon from './Icon';

function Breadcrumb({ activeTab, setActiveTab }) {
  const paths = {
    'dashboard': [{ label: 'Dashboard', icon: 'chart' }],
    'incidents': [{ label: 'Dashboard', icon: 'chart', tab: 'dashboard' }, { label: 'Arızalar', icon: 'tool' }],
    'clients': [{ label: 'Dashboard', icon: 'chart', tab: 'dashboard' }, { label: 'Müşteriler', icon: 'user' }],
    'kanban': [{ label: 'Dashboard', icon: 'chart', tab: 'dashboard' }, { label: 'Kanban', icon: 'clipboard' }],
    'analytics': [{ label: 'Dashboard', icon: 'chart', tab: 'dashboard' }, { label: 'Analiz', icon: 'chart' }],
    'calendar': [{ label: 'Dashboard', icon: 'chart', tab: 'dashboard' }, { label: 'Takvim', icon: 'calendar' }],
    'reports': [{ label: 'Dashboard', icon: 'chart', tab: 'dashboard' }, { label: 'Raporlar', icon: 'clipboard' }],
    'settings': [{ label: 'Dashboard', icon: 'chart', tab: 'dashboard' }, { label: 'Ayarlar', icon: 'tool' }],
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
            <span className="breadcrumb-icon"><Icon name={item.icon} size={14} /></span>
            <span className="breadcrumb-label">{item.label}</span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

export default Breadcrumb;