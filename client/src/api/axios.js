import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('devhash_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      (error.code === 'ERR_NETWORK'
        ? 'The frontend could not reach the API. Start the backend with npm run dev in the server folder (port 5000), then try again.'
        : 'Something went wrong. Please try again.');

    if (status === 401 && localStorage.getItem('devhash_token')) {
      localStorage.removeItem('devhash_token');
      if (!window.location.pathname.startsWith('/login')) {
        window.dispatchEvent(new Event('devhash:unauthorized'));
      }
    }

    return Promise.reject({
      status,
      message,
      original: error,
    });
  }
);

export default api;
