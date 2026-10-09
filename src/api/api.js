import axios from 'axios'

/** Cliente HTTP común: centraliza la base URL, cabeceras y token Sanctum. */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Adjunta la sesión actual a las llamadas privadas sin repetir lógica en cada servicio.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient