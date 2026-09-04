export async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');
  
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`http://127.0.0.1:8000${endpoint}`, config);

  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = '/login';
    throw new Error('Session expired. Please sign in again.');
  }

  return response;
}