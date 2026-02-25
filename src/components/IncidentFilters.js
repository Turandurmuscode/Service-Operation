import React, { useState, useEffect } from 'react';
import './IncidentFilters.css';
import Icon from './Icon';

const SAVED_KEY = 'saved_filters';

const loadJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
};

const EMPTY_FILTERS = { search: '', status: 'all', priority: 'all', technician: 'all' };

function IncidentFilters({ onFilterChange }) {
  const [filters,      setFilters]      = useState(EMPTY_FILTERS);
  const [technicians,  setTechnicians]  = useState([]);
  const [savedFilters, setSavedFilters] = useState(() => loadJSON(SAVED_KEY, []));
  const [saveMode,     setSaveMode]     = useState(false);
  const [saveName,     setSaveName]     = useState('');

  useEffect(() => {
    setTechnicians(loadJSON('technicians', []));
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    onFilterChange(EMPTY_FILTERS);
  };

  const applyPreset = (preset) => {
    setFilters(preset.filters);
    onFilterChange(preset.filters);
  };

  const saveCurrentFilter = () => {
    if (!saveName.trim()) return;
    const newPreset = { id: Date.now(), name: saveName.trim(), filters: { ...filters } };
    const updated = [...savedFilters, newPreset];
    setSavedFilters(updated);
    localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
    setSaveName('');
    setSaveMode(false);
  };

  const deletePreset = (id, e) => {
    e.stopPropagation();
    const updated = savedFilters.filter(p => p.id !== id);
    setSavedFilters(updated);
    localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
  };

  const hasActiveFilter = filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.technician !== 'all';

  return (
    <div>
      {/* ── Kayıtlı filtreler ── */}
      {savedFilters.length > 0 && (
        <div className="saved-filters-bar">
          <span className="saved-filters-label">
            <Icon name="save" size={12} /> Kayıtlı:
          </span>
          {savedFilters.map(preset => (
            <button
              key={preset.id}
              className="saved-filter-chip"
              onClick={() => applyPreset(preset)}
              title={`Uygula: ${preset.name}`}
            >
              {preset.name}
              <span
                className="saved-filter-chip-del"
                onClick={(e) => deletePreset(preset.id, e)}
                title="Sil"
              >×</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Ana filtreler ── */}
      <div className="filters-container">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Arıza açıklamasında ara..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="filter-select">
            <option value="all">Tüm Durumlar</option>
            <option value="new">Yeni</option>
            <option value="in_progress">Devam Ediyor</option>
            <option value="on_hold">Beklemede</option>
            <option value="resolved">Çözüldü</option>
          </select>
        </div>

        <div className="filter-group">
          <select value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)} className="filter-select">
            <option value="all">Tüm Öncelikler</option>
            <option value="critical">Kritik</option>
            <option value="medium">Orta</option>
            <option value="low">Düşük</option>
          </select>
        </div>

        {technicians.length > 0 && (
          <div className="filter-group">
            <select value={filters.technician} onChange={(e) => handleFilterChange('technician', e.target.value)} className="filter-select">
              <option value="all">Tüm Teknisyenler</option>
              <option value="unassigned">Atanmamış</option>
              {technicians.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

        {hasActiveFilter && (
          <button onClick={resetFilters} className="btn btn-secondary">
            <Icon name="close" size={14} /> Sıfırla
          </button>
        )}

        {/* Filtre kaydet butonu */}
        {hasActiveFilter && !saveMode && (
          <button className="btn btn-secondary" onClick={() => setSaveMode(true)} title="Bu filtreyi kaydet">
            <Icon name="save" size={14} /> Kaydet
          </button>
        )}

        {/* Kaydet formu */}
        {saveMode && (
          <div className="save-filter-inline">
            <input
              className="search-input"
              style={{ minWidth: 140 }}
              placeholder="Filtre adı..."
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveCurrentFilter(); if (e.key === 'Escape') setSaveMode(false); }}
              autoFocus
            />
            <button className="btn btn-primary" onClick={saveCurrentFilter} disabled={!saveName.trim()}>
              <Icon name="save" size={14} />
            </button>
            <button className="btn btn-secondary" onClick={() => setSaveMode(false)}>
              <Icon name="close" size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default IncidentFilters;