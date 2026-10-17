const API_BASE_URL = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('vickyai_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('vickyai_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('vickyai_token');
}

function extractErrorMessage(errData: any, fallback: string): string {
  if (!errData) return fallback;
  if (typeof errData.detail === 'string') return errData.detail;
  if (Array.isArray(errData.detail) && errData.detail.length > 0) {
    const firstErr = errData.detail[0];
    if (typeof firstErr === 'string') return firstErr;
    if (firstErr && typeof firstErr.msg === 'string') return firstErr.msg;
  }
  if (typeof errData.message === 'string') return errData.message;
  return fallback;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    let errorMsg = '';
    try {
      const errData = await response.json();
      errorMsg = extractErrorMessage(errData, '');
    } catch {
      // ignore
    }

    // Login endpoint 401 is credential failure, not session expiration
    if (endpoint.includes('/auth/login')) {
      throw new Error(errorMsg || 'Incorrect email/username or password');
    }

    removeAuthToken();
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new Error(errorMsg || 'Session expired. Please log in again.');
  }

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errData = await response.json();
      errorMsg = extractErrorMessage(errData, errorMsg);
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
