import React, { useState, useEffect } from 'react';
import './IncidentFilters.css';

const loadJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
};

function IncidentFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    technician: 'all',
  });

  const [technicians, setTechnicians] = useState([]);

  useEffect(() => {
    setTechnicians(loadJSON('technicians', []));
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const reset = { search: '', status: 'all', priority: 'all', technician: 'all' };
    setFilters(reset);
    onFilterChange(reset);
  };

  const hasActiveFilter = filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.technician !== 'all';

  return (
    <div className="filters-container">
      <div className="filter-group">
        <input
          type="text"
          placeholder="🔍 Arıza açıklamasında ara..."
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
          <option value="critical">🔴 Kritik</option>
          <option value="medium">🟡 Orta</option>
          <option value="low">🟢 Düşük</option>
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
          ✕ Sıfırla
        </button>
      )}
    </div>
  );
}

export default IncidentFilters;