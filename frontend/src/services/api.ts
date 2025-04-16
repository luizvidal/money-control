import axios from 'axios';

// When running in Docker, the API is available at /api due to Nginx proxy
// When running locally, use the localhost URL
// We're now using port 5173 for both Docker and local development
const isRunningInDocker = window.location.port === '5173' && window.location.hostname === 'localhost';

const api = axios.create({
  baseURL: isRunningInDocker ? '/api' : 'http://localhost:8080/api',
});

// Interceptor para adicionar o token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirecionar para login se o token expirou ou é inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
