export function getBaseUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  // When running on HTTPS (such as Vercel https://*.vercel.app):
  // Calling an insecure http:// endpoint directly causes modern browsers to block all requests (Mixed Content error).
  // In that case, we MUST use the relative '/api' route so Vercel's rewrites proxy requests server-to-server over HTTP.
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (!envUrl || envUrl.startsWith('http://') || envUrl === '/api') {
      return '/api';
    }
  }
  if (envUrl) {
    if (envUrl === '/api' || envUrl.endsWith('/api')) return envUrl;
    return `${envUrl.replace(/\/+$/, '')}/api`;
  }
  return '/api';
}

export const BASE_URL = getBaseUrl();

/**
 * Universal API Client with automatic token injection and error handling.
 */
export async function apiClient(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${cleanEndpoint}`;
  
  const token = localStorage.getItem('accessToken') || localStorage.getItem('marketlink_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, config);
    
    if (res.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('marketlink_token');
      localStorage.removeItem('marketlink_user');
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.message || data?.error || `Lỗi máy chủ (${res.status})`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[API Error] ${config.method || 'GET'} ${url}:`, err);
    throw err;
  }
}

export default apiClient;
