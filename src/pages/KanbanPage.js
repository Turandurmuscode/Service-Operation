import React, { useState } from 'react';
import './KanbanPage.css';

function KanbanPage({ incidents, clients, updateIncidentStatus }) {
  const columns = [
    { id: 'new', title: '🆕 Yeni', status: 'new', color: '#3b82f6' },
    { id: 'in_progress', title: '🔄 Devam Ediyor', status: 'in_progress', color: '#f59e0b' },
    { id: 'on_hold', title: '⏸️ Beklemede', status: 'on_hold', color: '#a855f7' },
    { id: 'resolved', title: '✅ Çözüldü', status: 'resolved', color: '#10b981' }
  ];

  const [draggedItem, setDraggedItem] = useState(null);

  const getIncidentsForColumn = (status) => {
    return incidents.filter(inc => inc.status === status);
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Bilinmiyor';
  };

  const handleDragStart = (incident) => {
    setDraggedItem(incident);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (status) => {
    if (draggedItem && draggedItem.status !== status) {
      updateIncidentStatus(draggedItem.id, status);
    }
    setDraggedItem(null);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'critical': '#ef4444',
      'medium': '#f59e0b',
      'low': '#10b981'
    };
    return colors[priority] || '#94a3b8';
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>📋 Kanban Board</h1>
          <p>Arızaları sürükle bırak ile yönet</p>
        </div>
      </div>

      <div className="kanban-board">
        {columns.map(column => {
          const columnIncidents = getIncidentsForColumn(column.status);
          
          return (
            <div 
              key={column.id}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.status)}
            >
              <div className="kanban-column-header" style={{ borderTopColor: column.color }}>
                <h3>{column.title}</h3>
                <span className="kanban-count">{columnIncidents.length}</span>
              </div>

              <div className="kanban-cards">
                {columnIncidents.length === 0 ? (
                  <div className="kanban-empty">
                    <span style={{ fontSize: '32px', opacity: 0.3 }}>📭</span>
                    <p>Arıza yok</p>
                  </div>
                ) : (
                  columnIncidents.map(incident => (
                    <div
                      key={incident.id}
                      className="kanban-card"
                      draggable
                      onDragStart={() => handleDragStart(incident)}
                      style={{ borderLeftColor: getPriorityColor(incident.priority) }}
                    >
                      <div className="kanban-card-header">
                        <span className="kanban-card-priority" style={{ 
                          background: `${getPriorityColor(incident.priority)}20`,
                          color: getPriorityColor(incident.priority)
                        }}>
                          {incident.priority === 'critical' ? '🔴' : incident.priority === 'medium' ? '🟡' : '🟢'}
                        </span>
                        <span className="kanban-card-category">
                          {incident.category === 'software' && '💻'}
                          {incident.category === 'hardware' && '🖥️'}
                          {incident.category === 'network' && '🌐'}
                          {incident.category === 'other' && '📦'}
                        </span>
                      </div>

                      <div className="kanban-card-title">{incident.description}</div>

                      <div className="kanban-card-footer">
                        <span className="kanban-card-client">{getClientName(incident.clientId)}</span>
                        <span className="kanban-card-time">
                          {new Date(incident.startTime).toLocaleDateString('tr-TR', { 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default KanbanPage;