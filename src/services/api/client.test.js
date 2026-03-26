import { createApiClient, ApiError } from './index';

describe('api client', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  test('sends query params and parses json response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ ok: true }),
      text: async () => '',
    });

    const api = createApiClient({ baseUrl: '/api' });
    const res = await api.get('/clients', { query: { page: 2, q: 'abc' } });

    expect(res).toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/clients?page=2&q=abc',
      expect.objectContaining({ method: 'GET' })
    );
  });

  test('throws ApiError on non-2xx response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: { get: () => 'application/json' },
      json: async () => ({ message: 'Bad request', code: 'BAD_REQUEST' }),
      text: async () => '',
    });

    const api = createApiClient({ baseUrl: '/api' });

    await expect(api.get('/clients')).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      code: 'BAD_REQUEST',
    });
  });

  test('throws network ApiError on fetch failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    const api = createApiClient({ baseUrl: '/api' });

    await expect(api.get('/clients')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'NETWORK_ERROR',
    });
  });

  test('throws invalid response error when parse json expected but text returned', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'text/plain' },
      json: async () => null,
      text: async () => 'hello',
    });
    const api = createApiClient({ baseUrl: '/api' });

    await expect(api.get('/hello')).rejects.toBeInstanceOf(ApiError);
  });
});
