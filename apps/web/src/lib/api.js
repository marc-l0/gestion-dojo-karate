// URL base de la API. Se define con PUBLIC_API_URL en apps/web/.env (ver .env.example).
// Usa el mismo hostname para web y API (localhost o la IP de la PC en la red local).
export const API_URL = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000';

/**
 * fetch para las rutas de administración: envía la cookie de sesión y,
 * si la API responde 401 (sin sesión), manda al login.
 * `ruta` empieza con "/": apiFetch("/clases").
 */
export async function apiFetch(ruta, opciones = {}) {
  const respuesta = await fetch(API_URL + ruta, { ...opciones, credentials: 'include' });

  if (respuesta.status === 401) {
    const volver = window.location.pathname + window.location.search;
    window.location.href = `/login?volver=${encodeURIComponent(volver)}`;
  }

  return respuesta;
}

export async function cerrarSesion() {
  const respuesta = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!respuesta.ok && respuesta.status !== 401) throw new Error('No se pudo cerrar la sesión');
  window.location.href = '/login';
}
