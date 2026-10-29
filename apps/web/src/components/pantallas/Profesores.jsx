import { useCallback, useEffect, useState } from 'react';
import { useOperacion } from '../../hooks/useOperacion.js';
import { apiFetch, leerRespuesta } from '../../lib/api.js';
import Mensaje from '../Mensaje.jsx';

export default function Profesores() {
  const [profesores, setProfesores] = useState([]);
  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(true);
  const { ocupado, aviso, setAviso, ejecutar } = useOperacion();
  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await leerRespuesta(
        await apiFetch('/profesores'),
        'No se pudieron cargar los profesores. Intenta de nuevo.',
      );
      setProfesores(datos);
    } catch {
      setAviso({
        tipo: 'error',
        texto: 'No se pudieron cargar los profesores. Comprueba tu conexión e intenta de nuevo.',
      });
    } finally {
      setCargando(false);
    }
  }, [setAviso]);
  useEffect(() => {
    cargar();
  }, [cargar]);

  async function agregarProfesor(event) {
    event.preventDefault();
    if (!nombre.trim()) {
      setAviso({ tipo: 'error', texto: 'Escribe el nombre del profesor.' });
      return;
    }
    await ejecutar(async () => {
      const resultado = await leerRespuesta(
        await apiFetch('/profesores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: nombre.trim() }),
        }),
        'No se pudo agregar el profesor. Intenta de nuevo.',
      );
      if (resultado.profesor) setProfesores((previos) => [...previos, resultado.profesor]);
      else await cargar();
      setNombre('');
      return 'Profesor agregado correctamente.';
    });
  }
  async function cambiarEstado(id, estado) {
    if (estado === 'inactivo' && !window.confirm('¿Desea desactivar este profesor?')) return;
    await ejecutar(async () => {
      await leerRespuesta(
        await apiFetch('/profesores/estado', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, estado }),
        }),
        'No se pudo actualizar el profesor. Intenta de nuevo.',
      );
      setProfesores((previos) =>
        previos.map((item) => (item.id === id ? { ...item, estado } : item)),
      );
      return estado === 'activo'
        ? 'Profesor activado correctamente.'
        : 'Profesor desactivado correctamente.';
    });
  }
  return (
    <main className="space-y-4 px-4 pb-6 pt-4" aria-busy={ocupado || cargando}>
      <Mensaje aviso={aviso} />
      <form
        onSubmit={agregarProfesor}
        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <h2 className="font-bold text-gray-900">Agregar profesor</h2>
        <p className="mt-1 text-sm text-gray-500">Registra un nuevo profesor en el sistema.</p>
        <label htmlFor="nombre-profesor" className="mt-4 block text-sm font-medium text-gray-700">
          Nombre del profesor
        </label>
        <input
          id="nombre-profesor"
          type="text"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          disabled={ocupado}
          required
          maxLength={120}
          placeholder="Nombre del profesor"
          className="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-3 text-base"
        />
        <button
          type="submit"
          disabled={ocupado || cargando}
          className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {ocupado ? 'Guardando…' : 'Agregar profesor'}
        </button>
      </form>
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="font-bold text-gray-900">Profesores registrados</h2>
        <p className="mt-1 text-sm text-gray-500">
          Los profesores inactivos no aparecerán al crear nuevas clases.
        </p>
        {cargando ? (
          <p role="status" className="mt-4 text-sm text-gray-600">
            Cargando profesores…
          </p>
        ) : profesores.length === 0 ? (
          <div className="mt-4 text-sm text-gray-500">
            <p>No hay profesores para mostrar.</p>
            <button
              type="button"
              onClick={cargar}
              disabled={ocupado}
              className="mt-2 font-semibold text-blue-700"
            >
              Actualizar lista
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {profesores.map((profesor) => (
              <div
                key={profesor.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3"
              >
                <div>
                  <p className="break-words text-sm font-semibold text-gray-800">
                    {profesor.nombre}
                  </p>
                  <p
                    className={`mt-1 text-xs ${profesor.estado === 'activo' ? 'text-green-700' : 'text-gray-500'}`}
                  >
                    {profesor.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() =>
                    cambiarEstado(profesor.id, profesor.estado === 'activo' ? 'inactivo' : 'activo')
                  }
                  className="shrink-0 rounded-xl border border-gray-200 px-3 text-sm font-semibold text-blue-700 disabled:opacity-50"
                >
                  {profesor.estado === 'activo' ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
