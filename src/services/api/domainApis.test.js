import { createClientsApi, createIncidentsApi, createReportsApi } from './index';

describe('domain APIs', () => {
  test('clientsApi delegates to api client methods', () => {
    const apiClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };
    const clientsApi = createClientsApi(apiClient);

    clientsApi.list({ q: 'x' });
    clientsApi.getById(10);
    clientsApi.create({ name: 'A' });
    clientsApi.update(10, { name: 'B' });
    clientsApi.remove(10);

    expect(apiClient.get).toHaveBeenCalledWith('/clients', { query: { q: 'x' } });
    expect(apiClient.get).toHaveBeenCalledWith('/clients/10');
    expect(apiClient.post).toHaveBeenCalledWith('/clients', { name: 'A' });
    expect(apiClient.put).toHaveBeenCalledWith('/clients/10', { name: 'B' });
    expect(apiClient.delete).toHaveBeenCalledWith('/clients/10');
  });

  test('incidentsApi delegates status updates to patch endpoint', () => {
    const apiClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    };

    const incidentsApi = createIncidentsApi(apiClient);
    incidentsApi.updateStatus(5, 'resolved');

    expect(apiClient.patch).toHaveBeenCalledWith('/incidents/5/status', {
      status: 'resolved',
    });
  });

  test('reportsApi requests csv export as text', () => {
    const apiClient = {
      get: jest.fn(),
    };

    const reportsApi = createReportsApi(apiClient);
    reportsApi.exportCsv({ from: '2026-01-01', to: '2026-01-31' });

    expect(apiClient.get).toHaveBeenCalledWith('/reports/export/csv', {
      query: { from: '2026-01-01', to: '2026-01-31' },
      parse: 'text',
    });
  });
});
