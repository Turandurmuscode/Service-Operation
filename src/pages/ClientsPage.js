import React, { useState } from 'react';
import ClientsGrid from '../components/ClientsGrid';
import ClientForm from '../components/ClientForm';
import ClientModal from '../components/ClientModal';

function ClientsPage({ 
  clients, 
  incidents, 
  addClient, 
  setClients,
  addClientNote 
}) {
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const toggleFavorite = (clientId) => {
    const updatedClients = clients.map(client => {
      if (client.id === clientId) {
        return { ...client, favorite: !client.favorite };
      }
      return client;
    });
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
  };

  const deleteClient = (clientId) => {
    const updatedClients = clients.filter(c => c.id !== clientId);
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>👥 Müşteri Yönetimi</h1>
          <p>Müşteri bilgilerini görüntüle ve düzenle</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Formu Kapat' : '+ Yeni Müşteri'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <ClientForm addClient={(client) => {
            addClient(client);
            setShowForm(false);
          }} />
        </div>
      )}

      <ClientsGrid 
        clients={clients}
        incidents={incidents}
        onClientClick={setSelectedClient}
        onToggleFavorite={toggleFavorite}
        onDeleteClient={deleteClient}
      />

      {selectedClient && (
        <ClientModal
          client={selectedClient}
          incidents={incidents}
          onClose={() => setSelectedClient(null)}
          onAddNote={addClientNote}
        />
      )}
    </div>
  );
}

export default ClientsPage;