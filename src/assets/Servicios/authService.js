import api from '../../api/api.js'

export async function iniciarSesion(credentials) {
  const { data } = await api.post('/login', credentials)
  guardarSesion(data)

  return data
}

export async function registrarse(userData) {
  const { data } = await api.post('/register', userData)
  guardarSesion(data)

  return data
}

function guardarSesion(data) {
  const token = data.token || data.access_token

  if (!token) {
    throw new Error('Laravel no devolvio un token de autenticacion')
  }

  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(data.user || data.usuario || {}))
}

export function cerrarSesion() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
// src/services/authService.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost/api";

//Login
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

  // Guardar token en localStorage y notificar a la app
  localStorage.setItem("token", token);
  window.dispatchEvent(new Event('authChanged'));
  return data;
}

//Registro
export async function register(name, email, password) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) throw new Error("Error en registro");
  return response.json();
}

// Obtener usuario autenticado
export async function getUser() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No hay token guardado");

  const response = await fetch(`${API_URL}/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, //Aquí se envía el token
    },
  });

  if (!response.ok) throw new Error("No se pudo obtener el usuario");
  return response.json();
}