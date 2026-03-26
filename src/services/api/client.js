import { ApiError, createApiErrorFromResponse, createNetworkError } from './errors';

function toQueryString(query = {}) {
  const search = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    search.append(key, String(value));
  });
  const asString = search.toString();
  return asString ? `?${asString}` : '';
}

async function parseResponsePayload(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
}

export function createApiClient({ baseUrl = '', defaultHeaders = {} } = {}) {
  const request = async (path, options = {}) => {
    const {
      method = 'GET',
      headers = {},
      query,
      body,
      signal,
      parse = 'json',
    } = options;

    const url = `${baseUrl}${path}${toQueryString(query)}`;
    const mergedHeaders = {
      ...defaultHeaders,
      ...headers,
    };

    const fetchOptions = {
      method,
      headers: mergedHeaders,
      signal,
    };

    if (body !== undefined) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      if (!fetchOptions.headers['Content-Type']) {
        fetchOptions.headers['Content-Type'] = 'application/json';
      }
    }

    let response;
    try {
      response = await fetch(url, fetchOptions);
    } catch (error) {
      throw createNetworkError(error);
    }

    const payload = await parseResponsePayload(response);

    if (!response.ok) {
      throw createApiErrorFromResponse(response, payload);
    }

    if (parse === 'text') {
      return typeof payload === 'string' ? payload : '';
    }

    if (parse === 'raw') {
      return response;
    }

    if (payload === null || payload === '') {
      return {};
    }

    if (typeof payload === 'string') {
      try {
        return JSON.parse(payload);
      } catch {
        throw new ApiError('Expected JSON response but received text', {
          code: 'INVALID_RESPONSE',
          details: payload,
        });
      }
    }

    return payload;
  };

  return {
    request,
    get: (path, opts = {}) => request(path, { ...opts, method: 'GET' }),
    post: (path, body, opts = {}) => request(path, { ...opts, method: 'POST', body }),
    put: (path, body, opts = {}) => request(path, { ...opts, method: 'PUT', body }),
    patch: (path, body, opts = {}) => request(path, { ...opts, method: 'PATCH', body }),
    delete: (path, opts = {}) => request(path, { ...opts, method: 'DELETE' }),
  };
}
