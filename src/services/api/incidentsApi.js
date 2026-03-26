export function createIncidentsApi(apiClient) {
  return {
    list: (query) => apiClient.get('/incidents', { query }),
    getById: (id) => apiClient.get(`/incidents/${id}`),
    create: (payload) => apiClient.post('/incidents', payload),
    update: (id, payload) => apiClient.put(`/incidents/${id}`, payload),
    updateStatus: (id, status) => apiClient.patch(`/incidents/${id}/status`, { status }),
    remove: (id) => apiClient.delete(`/incidents/${id}`),
  };
}
