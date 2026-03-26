export function createReportsApi(apiClient) {
  return {
    summary: (query) => apiClient.get('/reports/summary', { query }),
    sla: (query) => apiClient.get('/reports/sla', { query }),
    cost: (query) => apiClient.get('/reports/cost', { query }),
    exportCsv: (query) => apiClient.get('/reports/export/csv', { query, parse: 'text' }),
  };
}
