import React, { useState } from 'react';
import IncidentTimeline from './IncidentTimeline';
import './IncidentNotes.css';

function IncidentNotes({ incident, onAddNote }) {
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    
    onAddNote(incident.id, note);
    setNote('');
  };

  return (
    <div className="notes-section">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h4>📝 Teknisyen Notları</h4>
          
          <form onSubmit={handleSubmit} className="note-form">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Not ekleyin..."
              rows="3"
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>
              Not Ekle
            </button>
          </form>

          {incident.notes && incident.notes.length > 0 && (
            <div className="notes-timeline">
              {incident.notes.map((note, idx) => (
                <div key={idx} className="note-timeline-item">
                  <div className="note-timeline-dot"></div>
                  <div className="note-timeline-content">
                    <div className="note-timeline-text">{note.text}</div>
                    <div className="note-timeline-time">
                      {new Date(note.timestamp).toLocaleString('tr-TR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <IncidentTimeline incident={incident} />
        </div>
      </div>
    </div>
  );
}

export default IncidentNotes;