import React, { useState } from 'react';
import './IncidentFilters.css';

function IncidentFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    client: 'all'
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const resetState = {
      search: '',
      status: 'all',
      priority: 'all',
      client: 'all'
    };
    setFilters(resetState);
    onFilterChange(resetState);
  };

  return (
    <div className="filters-container">
      <div className="filter-group">
        <input
          type="text"
          placeholder=" Arıza açıklamasında ara..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-group">
        <select 
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="filter-select"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="active">Sadece Aktif</option>
          <option value="resolved">Sadece Çözülmüş</option>
        </select>
      </div>

      <div className="filter-group">
        <select 
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="filter-select"
        >
          <option value="all">Tüm Öncelikler</option>
          <option value="critical">Kritik</option>
          <option value="medium">Orta</option>
          <option value="low">Düşük</option>
        </select>
      </div>

      <button onClick={resetFilters} className="btn btn-secondary">
         Filtreleri Sıfırla
      </button>
    </div>
  );
}

export default IncidentFilters;