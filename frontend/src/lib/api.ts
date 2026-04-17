import axios from 'axios';

// Pointing to your new v1 API gateway
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // CRITICAL: This tells the browser to automatically include the 
  // HttpOnly cookies (access_token & refresh_token) in every request.
  withCredentials: true,
});

// ─── Response Interceptor ──────────────────────────────────────────
// We only need this to catch 401 Unauthorized errors globally.
// If the access token cookie expires, Django will reject the request.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Lazy import to avoid circular dependency
      const { getState } = require('@/stores/authStore').useAuthStore;

      // If the API rejects our cookie, clear the local UI state and boot them to login
      getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;