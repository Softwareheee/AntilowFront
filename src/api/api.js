import axios from 'axios'

/** Evita mostrar mensajes técnicos de sesión o permisos directamente al usuario. */
export function getApiErrorMessage(error, fallback) {
  const status = error.response?.status
  const serverMessage = error.response?.data?.message
  const normalizedMessage = typeof serverMessage === 'string' ? serverMessage.trim().toLowerCase() : ''

  if (status === 401 || normalizedMessage === 'unauthenticated' || normalizedMessage === 'unauthenticated.') {
    return 'Tu sesión no está activa. Inicia sesión para ver este contenido.'
  }

  if (status === 403) {
    return 'No tienes permisos para ver este contenido. Se requiere una cuenta administradora.'
  }

  return serverMessage || fallback
}

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