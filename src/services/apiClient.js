import API_URL from '../../api';

let authExpiredHandler = null;

const setAuthExpiredHandler = (handler) => {
  authExpiredHandler = typeof handler === 'function' ? handler : null;
};

const request = async ({ path, method = 'GET', token, body }) => {
  const headers = {};
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const base = path.startsWith('http') 
    ? path 
    : (API_URL.endsWith('/api') && path.startsWith('/api') ? `${API_URL}${path.slice(4)}` : `${API_URL}${path}`);

  const response = await fetch(base, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  if (!response.ok) {
    const status = response.status;
    let errorMessage = 'Request failed';
    let errorPayload = '';
    try {
      errorPayload = await response.text();
      if (errorPayload) {
        try {
          const errorJson = JSON.parse(errorPayload);
          errorMessage = errorJson.error || errorJson.message || errorPayload;
        } catch {
          errorMessage = errorPayload;
        }
      }
    } catch {
      // keep default error message when body cannot be read
    }
    const normalized = String(errorMessage).toLowerCase();
    const authExpired =
      status === 401 ||
      normalized.includes('token expired') ||
      normalized.includes('jwt expired') ||
      normalized.includes('unauthorized');

    if (authExpired && authExpiredHandler) {
      authExpiredHandler();
    }

    const error = new Error(errorMessage);
    error.status = status;
    error.isAuthExpired = authExpired;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export default { request, setAuthExpiredHandler };
