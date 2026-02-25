import React, { useState } from 'react';
import './QuickActions.css';
import Icon from './Icon';

function QuickActions({ onAction }) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: 'new-incident', icon: 'tool', label: 'Yeni Arıza', color: '#ef4444', action: () => onAction('incidents') },
    { id: 'new-client', icon: 'user', label: 'Yeni Müşteri', color: '#3b82f6', action: () => onAction('clients') },
    { id: 'export-data', icon: 'download', label: 'Veri İndir', color: '#10b981', action: () => onAction('reports') },
    { id: 'view-analytics', icon: 'chart', label: 'Analiz', color: '#f59e0b', action: () => onAction('analytics') },
  ];

  return (
    <div className="quick-actions">
      <button 
        className={`quick-actions-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="quick-actions-icon">{isOpen ? <Icon name="close" size={18} /> : <Icon name="bolt" size={18} />}</span>
      </button>

      {isOpen && (
        <div className="quick-actions-menu">
          {actions.map((action, index) => (
            <button
              key={action.id}
              className="quick-action-item"
              onClick={() => {
                action.action();
                setIsOpen(false);
              }}
              style={{ 
                animationDelay: `${index * 0.05}s`,
                '--action-color': action.color
              }}
            >
              <span className="quick-action-icon"><Icon name={action.icon} size={18} /></span>
              <span className="quick-action-label">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuickActions;