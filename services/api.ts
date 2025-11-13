
import { API_BASE_URL } from '../constants';

const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('token');
  } catch (e) {
    console.error("Could not access localStorage", e);
    return null;
  }
};

const request = async <T,>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  // For DELETE requests, response body might be empty
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }

  return response.json() as Promise<T>;
};

export default request;
