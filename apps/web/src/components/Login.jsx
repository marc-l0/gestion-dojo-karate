import { useState } from 'react';
import { API_URL } from '../lib/api.js';

// Solo se permite volver a rutas internas del sitio (evita redirecciones a otros dominios).
function destinoSeguro(volver) {
  const valido = volver?.startsWith('/') && !volver.startsWith('//') && !volver.startsWith('/\\');
  return valido ? volver : '/';
}

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const entrar = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const respuesta = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password }),
      });

      if (respuesta.status === 429) {
        setError('Demasiados intentos fallidos. Espera unos minutos.');
        return;
      }

      if (!respuesta.ok) {
        setError('Usuario o contraseña incorrectos.');
        return;
      }

      const volver = new URLSearchParams(window.location.search).get('volver');
      window.location.href = destinoSeguro(volver);
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f3f8] px-4">
      <form onSubmit={entrar} className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-sm">
        <h1 className="text-center text-lg font-bold text-gray-900">Dojo Karate</h1>
        <p className="mt-1 text-center text-xs text-gray-500">Ingresa como administrador</p>

        <label className="mt-6 block text-xs font-semibold text-gray-700" htmlFor="usuario">
          Usuario
        </label>
        <input
          id="usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          autoComplete="username"
          required
          className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-purple-500"
        />

        <label className="mt-4 block text-xs font-semibold text-gray-700" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-purple-500"
        />

        {error && <p className="mt-4 text-xs font-semibold text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={cargando}
          className="mt-6 h-11 w-full rounded-xl bg-purple-600 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-60"
        >
          {cargando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
