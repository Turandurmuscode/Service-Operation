import React, { useState, useEffect } from 'react';
import './KanbanPage.css';

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function DeadlineBadge({ deadline, status }) {
  const now = useNow();
  if (!deadline || status === 'resolved' || status === 'cancelled') return null;

  const diff = new Date(deadline) - now;
  const isOverdue = diff < 0;
  const absMs = Math.abs(diff);
  const hours = Math.floor(absMs / 1000 / 60 / 60);
  const minutes = Math.floor((absMs / 1000 / 60) % 60);

  const label = isOverdue
    ? `🔴 ${hours}s ${minutes}dk gecikti`
    : hours < 1
    ? `🟠 ${minutes}dk kaldı`
    : hours < 3
    ? `🟡 ${hours}s ${minutes}dk kaldı`
    : `🟢 ${hours}s ${minutes}dk kaldı`;

  const color = isOverdue ? '#ef4444' : hours < 1 ? '#f97316' : hours < 3 ? '#f59e0b' : '#10b981';
  const bg   = isOverdue ? 'rgba(239,68,68,0.13)' : hours < 1 ? 'rgba(249,115,22,0.13)' : hours < 3 ? 'rgba(245,158,11,0.13)' : 'rgba(16,185,129,0.12)';

  return (
    <div style={{
      marginTop: '6px',
      padding: '3px 8px',
      borderRadius: '10px',
      fontSize: '11px',
      fontWeight: '600',
      background: bg,
      color,
      display: 'inline-block',
    }}>
      {label}
    </div>
  );
}

function KanbanPage({ incidents, clients, updateIncidentStatus }) {
  const columns = [
    { id: 'new',         title: '🆕 Yeni',          status: 'new',         color: '#3b82f6' },
    { id: 'in_progress', title: '🔄 Devam Ediyor',   status: 'in_progress', color: '#f59e0b' },
    { id: 'on_hold',     title: '⏸️ Beklemede',      status: 'on_hold',     color: '#a855f7' },
    { id: 'resolved',    title: '✅ Çözüldü',        status: 'resolved',    color: '#10b981' },
  ];

  const [draggedItem, setDraggedItem] = useState(null);

  const getIncidentsForColumn = (status) => incidents.filter(inc => inc.status === status);

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Bilinmiyor';
  };

  const handleDragStart = (incident) => setDraggedItem(incident);
  const handleDragOver  = (e) => e.preventDefault();
  const handleDrop      = (status) => {
    if (draggedItem && draggedItem.status !== status) {
      updateIncidentStatus(draggedItem.id, status);
    }
    setDraggedItem(null);
  };

  const getPriorityColor = (priority) => {
    return { critical: '#ef4444', medium: '#f59e0b', low: '#10b981' }[priority] || '#94a3b8';
  };

  // Kart kenar rengi: deadline durumuna göre override
  const getCardBorderColor = (incident) => {
    if (incident.status === 'resolved' || incident.status === 'cancelled') {
      return getPriorityColor(incident.priority);
    }
    if (!incident.deadline) return getPriorityColor(incident.priority);
    const diff = new Date(incident.deadline) - new Date();
    if (diff < 0) return '#ef4444';
    if (diff < 60 * 60 * 1000) return '#f97316';
    if (diff < 3 * 60 * 60 * 1000) return '#f59e0b';
    return getPriorityColor(incident.priority);
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
                      style={{ borderLeftColor: getCardBorderColor(incident) }}
                    >
                      <div className="kanban-card-header">
                        <span
                          className="kanban-card-priority"
                          style={{
                            background: `${getPriorityColor(incident.priority)}20`,
                            color: getPriorityColor(incident.priority),
                          }}
                        >
                          {incident.priority === 'critical' ? '🔴 Kritik' : incident.priority === 'medium' ? '🟡 Orta' : '🟢 Düşük'}
                        </span>
                        <span className="kanban-card-category">
                          {incident.category === 'software' && '💻'}
                          {incident.category === 'hardware' && '🖥️'}
                          {incident.category === 'network' && '🌐'}
                          {incident.category === 'other' && '📦'}
                        </span>
                      </div>

                      <div className="kanban-card-title">{incident.description}</div>

                      {/* Deadline badge */}
                      <DeadlineBadge deadline={incident.deadline} status={incident.status} />

                      {/* Çözüldüyse deadline yerine tarih göster */}
                      {incident.deadline && (incident.status === 'resolved' || incident.status === 'cancelled') && (
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                          📅 {new Date(incident.deadline).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}

                      <div className="kanban-card-footer">
                        <span className="kanban-card-client">{getClientName(incident.clientId)}</span>
                        <span className="kanban-card-time">
                          {new Date(incident.startTime).toLocaleDateString('tr-TR', {
                            day: 'numeric', month: 'short',
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