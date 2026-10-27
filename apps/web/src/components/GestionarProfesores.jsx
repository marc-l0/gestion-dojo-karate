import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api.js';

export default function GestionarProfesores() {
  const [profesores, setProfesores] = useState([]);
  const [nombre, setNombre] = useState('');

  const cargarProfesores = async () => {
    try {
      const respuesta = await apiFetch('/profesores');

      if (!respuesta.ok) {
        throw new Error('No se pudieron cargar los profesores');
      }

      const datos = await respuesta.json();

      setProfesores(datos);
    } catch (error) {
      console.error('Error al cargar profesores:', error);

      alert('No se pudieron cargar los profesores');
    }
  };

  useEffect(() => {
    cargarProfesores();
  }, []);

  const agregarProfesor = async () => {
    if (!nombre.trim()) {
      alert('Ingrese el nombre del profesor');
      return;
    }

    try {
      const respuesta = await apiFetch('/profesores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        alert(resultado.message || 'No se pudo agregar el profesor');

        return;
      }

      setNombre('');

      await cargarProfesores();
    } catch (error) {
      console.error('Error al agregar profesor:', error);

      alert('No se pudo agregar el profesor');
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      const respuesta = await apiFetch('/profesores/estado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          estado: estado,
        }),
      });

      if (!respuesta.ok) {
        throw new Error('No se pudo actualizar el profesor');
      }

      await cargarProfesores();
    } catch (error) {
      console.error('Error al cambiar estado:', error);

      alert('No se pudo actualizar el profesor');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-gray-800">
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div>
          <p className="text-[9px] font-semibold text-gray-400">ADMINISTRACIÓN</p>

          <h1 className="text-sm font-bold text-gray-900">Profesores</h1>
        </div>

        <button
          type="button"
          onClick={() => {
            window.location.href = '/';
          }}
          className="rounded-full border border-gray-200 px-3 py-1.5 text-[8px] font-semibold text-gray-500"
        >
          Volver
        </button>
      </header>

      <main className="space-y-4 px-4 pb-10 pt-4">
        {/* AGREGAR PROFESOR */}

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-[11px] font-bold text-gray-900">Agregar profesor</h2>

          <p className="mt-1 text-[8px] text-gray-400">Registra un nuevo profesor en el sistema.</p>

          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del profesor"
            className="mt-4 h-9 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-[9px] text-gray-700 outline-none focus:border-blue-500"
          />

          <button
            type="button"
            onClick={agregarProfesor}
            className="mt-2 h-9 w-full rounded-xl bg-blue-500 text-[9px] font-semibold text-white hover:bg-blue-600"
          >
            Agregar profesor
          </button>
        </section>

        {/* LISTA DE PROFESORES */}

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-[11px] font-bold text-gray-900">Profesores registrados</h2>

          <p className="mt-1 text-[8px] text-gray-400">
            Los profesores inactivos no aparecerán al crear nuevas clases.
          </p>

          <div className="mt-4 space-y-2">
            {profesores.length === 0 ? (
              <p className="text-[9px] text-gray-400">No hay profesores registrados.</p>
            ) : (
              profesores.map((profesor) => {
                const activo = profesor.estado === 'activo';

                return (
                  <div
                    key={profesor.id}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-3"
                  >
                    <div>
                      <p className="text-[9px] font-semibold text-gray-800">{profesor.nombre}</p>

                      <p
                        className={
                          'mt-0.5 text-[7px] ' + (activo ? 'text-green-500' : 'text-gray-400')
                        }
                      >
                        {activo ? 'Activo' : 'Inactivo'}
                      </p>
                    </div>

                    {activo ? (
                      <button
                        type="button"
                        onClick={() => {
                          const confirmar = confirm('¿Desea desactivar este profesor?');

                          if (confirmar) {
                            cambiarEstado(profesor.id, 'inactivo');
                          }
                        }}
                        className="rounded-full border border-red-200 px-3 py-1.5 text-[7px] font-semibold text-red-500"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => cambiarEstado(profesor.id, 'activo')}
                        className="rounded-full border border-green-200 px-3 py-1.5 text-[7px] font-semibold text-green-500"
                      >
                        Activar
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
