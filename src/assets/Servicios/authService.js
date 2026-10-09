import api from '../../api/api.js'

/** Envía credenciales y conserva el token/perfil devueltos por Laravel. */
export async function iniciarSesion(credentials) {
  const { data } = await api.post('/login', credentials)
  guardarSesion(data)

  return data
}

/** Registra una cuenta de cliente y abre su sesión inicial. */
export async function registrarse(userData) {
  const { data } = await api.post('/register', userData)
  guardarSesion(data)

  return data
}

/** Persiste de forma local el token Sanctum y el perfil mínimo de sesión. */
function guardarSesion(data) {
  const token = data.token || data.access_token

  if (!token) {
    throw new Error('Laravel no devolvio un token de autenticacion')
  }

  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(data.user || data.usuario || {}))
}

/** Elimina los datos locales de autenticación al cerrar sesión. */
export function cerrarSesion() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
// Compatibilidad con consumidores antiguos; el flujo actual usa Axios más arriba.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost/api";

/** Inicia sesión usando fetch y guarda el token en localStorage. */
export async function login(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) throw new Error("Credenciales inválidas");

  const data = await response.json();
  const token = data.token || data.access_token;
  if (!token) throw new Error("Token de autenticación no recibido.");

  // Notifica a consumidores antiguos que observan el evento personalizado.
  localStorage.setItem("token", token);
  window.dispatchEvent(new Event('authChanged'));
  return data;
}

/** Registra una cuenta con el endpoint público de Laravel. */
export async function register(name, email, password) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) throw new Error("Error en registro");
  return response.json();
}

/** Consulta el perfil actual enviando explícitamente el token almacenado. */
export async function getUser() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No hay token guardado");

  const response = await fetch(`${API_URL}/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("No se pudo obtener el usuario");
  return response.json();
}