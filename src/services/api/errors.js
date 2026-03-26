export class ApiError extends Error {
  constructor(message, { status = null, code = 'UNKNOWN', details = null, cause = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.cause = cause;
  }
}

export function createApiErrorFromResponse(response, payload) {
  const message =
    payload?.message ||
    payload?.error ||
    `Request failed with status ${response.status}`;

  return new ApiError(message, {
    status: response.status,
    code: payload?.code || `HTTP_${response.status}`,
    details: payload,
  });
}

export function createNetworkError(error) {
  return new ApiError('Network request failed', {
    code: 'NETWORK_ERROR',
    cause: error,
  });
}
