import React from 'react';
import './IncidentTimeline.css';

function IncidentTimeline({ incident }) {
  const getTimeline = () => {
    const timeline = [];
    
    // Oluşturma
    timeline.push({
      status: 'created',
      label: '🆕 Arıza Oluşturuldu',
      timestamp: incident.startTime,
      color: '#3b82f6'
    });

    // Durum değişiklikleri (simüle - gerçekte statusHistory tutulmalı)
    if (incident.status === 'in_progress' || incident.status === 'resolved') {
      timeline.push({
        status: 'in_progress',
        label: '🔄 İşleme Alındı',
        timestamp: incident.startTime, // Gerçekte ayrı timestamp olmalı
        color: '#f59e0b'
      });
    }

    if (incident.status === 'on_hold') {
      timeline.push({
        status: 'on_hold',
        label: '⏸️ Beklemeye Alındı',
        timestamp: incident.startTime,
        color: '#a855f7'
      });
    }

    // Çözüldü
    if (incident.status === 'resolved') {
      timeline.push({
        status: 'resolved',
        label: '✅ Çözüldü',
        timestamp: incident.endTime,
        color: '#10b981'
      });
    }

    return timeline;
  };

  const timeline = getTimeline();

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="incident-timeline">
      <h4>📅 Arıza Geçmişi</h4>
      <div className="timeline-container">
        {timeline.map((item, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-dot" style={{ background: item.color }}></div>
            <div className="timeline-content">
              <div className="timeline-label">{item.label}</div>
              <div className="timeline-time">{formatTime(item.timestamp)}</div>
            </div>
            {index < timeline.length - 1 && (
              <div className="timeline-line" style={{ borderColor: item.color }}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default IncidentTimeline;