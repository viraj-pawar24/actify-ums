import axios from 'axios';

export const TOKEN_KEY = 'ums.token';

let onUnauthorized = () => {};
/** AuthContext registers a callback here so an expired/invalid token signs the user out. */
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

const api = axios.create({
  // In development Vite proxies /api to http://localhost:8080 (see vite.config.js).
  // For a deployed build, set VITE_API_URL (the backend must then allow your origin via CORS).
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isLogin = error.config?.url === '/auth/login';
    // 401 anywhere except the login form means the token is missing, invalid or expired.
    if (status === 401 && !isLogin) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

/** Turns a failed request into one readable sentence. */
export function errorMessage(error) {
  if (!error.response) {
    return 'Cannot reach the server. Check that the backend is running on port 8080.';
  }
  const data = error.response.data;
  if (data?.validationErrors) {
    return Object.values(data.validationErrors).join(' ');
  }
  return data?.message || 'Something went wrong. Try again.';
}

/** Field-level messages from a 400 response, e.g. { email: '...', password: '...' }. */
export function fieldErrors(error) {
  return error.response?.data?.validationErrors || {};
}

export default api;
