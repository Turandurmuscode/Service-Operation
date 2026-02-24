import React, { useState } from 'react';
import ClientsGrid from '../components/ClientsGrid';
import ClientForm from '../components/ClientForm';
import ClientDetailPage from './ClientDetailPage';

function ClientsPage({
  clients,
  incidents,
  addClient,
  setClients,
  addClientNote,
  showToast,
}) {
  const [showForm, setShowForm] = useState(false);
  const [detailClient, setDetailClient] = useState(null);

  const toggleFavorite = (clientId) => {
    const updated = clients.map(c => c.id === clientId ? { ...c, favorite: !c.favorite } : c);
    setClients(updated);
    localStorage.setItem('clients', JSON.stringify(updated));
  };

  const deleteClient = (clientId) => {
    const updated = clients.filter(c => c.id !== clientId);
    setClients(updated);
    localStorage.setItem('clients', JSON.stringify(updated));
  };

  // Detay sayfası açıksa onu göster
  if (detailClient) {
    const freshClient = clients.find(c => c.id === detailClient.id) || detailClient;
    return (
      <ClientDetailPage
        client={freshClient}
        incidents={incidents}
        clients={clients}
        onBack={() => setDetailClient(null)}
        addClientNote={addClientNote}
        showToast={showToast}
      />
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>👥 Müşteri Yönetimi</h1>
          <p>Müşteri bilgilerini görüntüle ve düzenle</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Formu Kapat' : '+ Yeni Müşteri'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <ClientForm addClient={(client) => { addClient(client); setShowForm(false); }} />
        </div>
      )}

      <ClientsGrid
        clients={clients}
        incidents={incidents}
        onClientClick={setDetailClient}
        onToggleFavorite={toggleFavorite}
        onDeleteClient={deleteClient}
      />
    </div>
  );
}

export default ClientsPage;