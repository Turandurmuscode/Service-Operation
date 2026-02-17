import React, { useState } from 'react';
import './ClientsGrid.css';

function ClientsGrid({ clients, incidents, onClientClick, onToggleFavorite, onDeleteClient }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);

  const getClientStats = (clientId) => {
    const clientIncidents = incidents.filter(inc => inc.clientId === clientId);
    const activeCount = clientIncidents.filter(inc => 
      inc.status !== 'resolved' && inc.status !== 'cancelled'
    ).length;
    const totalCount = clientIncidents.length;
    
    return { activeCount, totalCount };
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFavorite = !filterFavorites || client.favorite;
    
    return matchesSearch && matchesFavorite;
  });

  return (
    <div className="clients-grid-container">
      <div className="clients-grid-header">
        <h2>👥 Müşteri Listesi ({filteredClients.length})</h2>
        
        <div className="clients-grid-actions">
          <input
            type="text"
            placeholder="🔍 Müşteri ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="clients-search"
          />
          
          <button 
            className={`filter-favorites ${filterFavorites ? 'active' : ''}`}
            onClick={() => setFilterFavorites(!filterFavorites)}
          >
            ⭐ Favoriler
          </button>
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="clients-empty">
          <span style={{ fontSize: '64px' }}>📋</span>
          <p>Müşteri bulunamadı</p>
        </div>
      ) : (
        <div className="clients-grid">
          {filteredClients.map(client => {
            const stats = getClientStats(client.id);
            
            return (
              <div 
                key={client.id} 
                className="client-card"
                onClick={() => onClientClick(client)}
              >
                <div className="client-card-header">
                  <div className="client-avatar-large">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="client-card-actions">
                    <button
                      className={`favorite-btn ${client.favorite ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(client.id);
                      }}
                    >
                      {client.favorite ? '⭐' : '☆'}
                    </button>
                    
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`${client.name} müşterisini silmek istediğinize emin misiniz?`)) {
                          onDeleteClient(client.id);
                        }
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="client-card-body">
                  <h3>{client.name}</h3>
                  <p className="client-city">📍 {client.city}</p>
                  
                  <div className="client-stats-mini">
                    <div className="stat-mini">
                      <span className="stat-mini-value">{stats.totalCount}</span>
                      <span className="stat-mini-label">Toplam</span>
                    </div>
                    <div className="stat-mini">
                      <span className="stat-mini-value" style={{ color: stats.activeCount > 0 ? '#f59e0b' : '#10b981' }}>
                        {stats.activeCount}
                      </span>
                      <span className="stat-mini-label">Aktif</span>
                    </div>
                  </div>
                </div>

                <div className="client-card-footer">
                  <span className="client-date">
                    {new Date(client.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                  <span className="client-view">Detayları Gör →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ClientsGrid;