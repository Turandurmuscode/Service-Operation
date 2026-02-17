import React, { useState } from 'react';
import './BulkActions.css';

function BulkActions({ incidents, onBulkResolve, onBulkDelete, onBulkChangePriority }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showActions, setShowActions] = useState(false);

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    setShowActions(newSelected.size > 0);
  };

  const selectAll = () => {
    const activeIncidents = incidents.filter(inc => inc.status !== 'resolved');
    if (selectedIds.size === activeIncidents.length) {
      setSelectedIds(new Set());
      setShowActions(false);
    } else {
      setSelectedIds(new Set(activeIncidents.map(inc => inc.id)));
      setShowActions(true);
    }
  };

  const handleBulkResolve = () => {
    if (window.confirm(`${selectedIds.size} arızayı çözüldü olarak işaretlemek istiyor musunuz?`)) {
      onBulkResolve(Array.from(selectedIds));
      setSelectedIds(new Set());
      setShowActions(false);
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`${selectedIds.size} arızayı silmek istiyor musunuz? Bu işlem geri alınamaz!`)) {
      onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
      setShowActions(false);
    }
  };

  const handleBulkPriority = (priority) => {
    if (window.confirm(`${selectedIds.size} arızanın önceliğini ${priority} olarak değiştirmek istiyor musunuz?`)) {
      onBulkChangePriority(Array.from(selectedIds), priority);
      setSelectedIds(new Set());
      setShowActions(false);
    }
  };

  return (
    <>
      <div className="bulk-actions-toolbar">
        <label className="bulk-select-all">
          <input
            type="checkbox"
            checked={selectedIds.size > 0}
            onChange={selectAll}
          />
          <span>Tümünü Seç ({incidents.filter(inc => inc.status !== 'resolved').length})</span>
        </label>

        {showActions && (
          <div className="bulk-actions-menu">
            <span className="bulk-selected-count">{selectedIds.size} arıza seçildi</span>
            
            <button onClick={handleBulkResolve} className="bulk-action-btn success">
              ✓ Çöz
            </button>
            
            <div className="bulk-action-dropdown">
              <button className="bulk-action-btn warning">
                🎯 Öncelik
              </button>
              <div className="bulk-dropdown-menu">
                <button onClick={() => handleBulkPriority('critical')}>🔴 Kritik</button>
                <button onClick={() => handleBulkPriority('medium')}>🟡 Orta</button>
                <button onClick={() => handleBulkPriority('low')}>🟢 Düşük</button>
              </div>
            </div>
            
            <button onClick={handleBulkDelete} className="bulk-action-btn danger">
              🗑️ Sil
            </button>
            
            <button onClick={() => { setSelectedIds(new Set()); setShowActions(false); }} className="bulk-action-btn">
              ✕ İptal
            </button>
          </div>
        )}
      </div>

      {/* Her incident'e checkbox eklemek için kullan */}
      <BulkCheckboxProvider value={{ selectedIds, toggleSelect }} />
    </>
  );
}

// Context for checkboxes
const BulkCheckboxContext = React.createContext();

function BulkCheckboxProvider({ value, children }) {
  return (
    <BulkCheckboxContext.Provider value={value}>
      {children}
    </BulkCheckboxContext.Provider>
  );
}

export { BulkCheckboxContext };
export default BulkActions;