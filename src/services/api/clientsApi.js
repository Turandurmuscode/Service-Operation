export function createClientsApi(apiClient) {
  return {
    list: (query) => apiClient.get('/clients', { query }),
    getById: (id) => apiClient.get(`/clients/${id}`),
    create: (payload) => apiClient.post('/clients', payload),
    update: (id, payload) => apiClient.put(`/clients/${id}`, payload),
    remove: (id) => apiClient.delete(`/clients/${id}`),
  };
}
