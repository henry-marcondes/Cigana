const API_URL = 'http://localhost:3001';

export async function apiFetch(endpoint, options = {}) {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (!options.silenciarErro) {
      console.error('API ERROR:', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        data
      });
    }

    const error = new Error(
      data.message ||
      data.error ||
      `Erro HTTP ${response.status} ao acessar ${endpoint}.`
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}
