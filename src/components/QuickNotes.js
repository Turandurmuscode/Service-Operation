import React, { useState, useEffect } from 'react';
import './QuickNotes.css';

function QuickNotes() {
  const [notes, setNotes] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const savedNotes = localStorage.getItem('quickNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const addNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const note = {
      id: Date.now(),
      text: newNote,
      timestamp: new Date().toISOString(),
      pinned: false
    };

    const updatedNotes = [note, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem('quickNotes', JSON.stringify(updatedNotes));
    setNewNote('');
  };

  const deleteNote = (id) => {
    const updatedNotes = notes.filter(n => n.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem('quickNotes', JSON.stringify(updatedNotes));
  };

  const togglePin = (id) => {
    const updatedNotes = notes.map(n => 
      n.id === id ? { ...n, pinned: !n.pinned } : n
    ).sort((a, b) => b.pinned - a.pinned);
    
    setNotes(updatedNotes);
    localStorage.setItem('quickNotes', JSON.stringify(updatedNotes));
  };

  return (
    <div className="quick-notes">
      <button 
        className="notes-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Hızlı Notlar"
      >
        📝
        {notes.length > 0 && (
          <span className="notes-badge">{notes.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="notes-panel">
          <div className="notes-header">
            <h3>📝 Hızlı Notlar</h3>
            <button onClick={() => setIsOpen(false)} className="notes-close">✕</button>
          </div>

          <form onSubmit={addNote} className="notes-form">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Yeni not ekle..."
              rows="3"
              className="notes-input"
            />
            <button type="submit" className="notes-add-btn">
              Ekle
            </button>
          </form>

          <div className="notes-list">
            {notes.length === 0 ? (
              <div className="notes-empty">
                <span style={{ fontSize: '48px' }}>📋</span>
                <p>Henüz not yok</p>
              </div>
            ) : (
              notes.map(note => (
                <div key={note.id} className={`note-item ${note.pinned ? 'pinned' : ''}`}>
                  <div className="note-content">
                    <div className="note-text">{note.text}</div>
                    <div className="note-time">
                      {new Date(note.timestamp).toLocaleString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="note-actions">
                    <button 
                      onClick={() => togglePin(note.id)}
                      className="note-action-btn"
                      title={note.pinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
                    >
                      {note.pinned ? '📌' : '📍'}
                    </button>
                    <button 
                      onClick={() => deleteNote(note.id)}
                      className="note-action-btn delete"
                      title="Sil"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuickNotes;