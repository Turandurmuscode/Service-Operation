import React, { useState } from 'react';
import './QuickActions.css';

function QuickActions({ onAction }) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: 'new-incident', icon: '🔧', label: 'Yeni Arıza', color: '#ef4444', action: () => onAction('incidents') },
    { id: 'new-client', icon: '👤', label: 'Yeni Müşteri', color: '#3b82f6', action: () => onAction('clients') },
    { id: 'export-data', icon: '📥', label: 'Veri İndir', color: '#10b981', action: () => onAction('reports') },
    { id: 'view-analytics', icon: '📊', label: 'Analiz', color: '#f59e0b', action: () => onAction('analytics') },
  ];

  return (
    <div className="quick-actions">
      <button 
        className={`quick-actions-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="quick-actions-icon">{isOpen ? '✕' : '⚡'}</span>
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
              <span className="quick-action-icon">{action.icon}</span>
              <span className="quick-action-label">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuickActions;