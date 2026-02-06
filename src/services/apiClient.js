import API_URL from '../../api';

const request = async ({ path, method = 'GET', token, body }) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const base = API_URL.endsWith('/api') && path.startsWith('/api') ? `${API_URL}${path.slice(4)}` : `${API_URL}${path}`;
  const response = await fetch(base, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const errorJson = await response.json();
      errorMessage = errorJson.error || errorJson.message || errorMessage;
    } catch {
      const errorText = await response.text();
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export default { request };
