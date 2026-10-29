import { useEffect, useState } from 'react';
import { API_URL } from '../../lib/api.js';
import { enlaceFormulario } from '../../lib/enlace-formulario.js';
import CopiarEnlace from '../CopiarEnlace.jsx';
import QrFormulario from '../QrFormulario.jsx';

export default function CompartirConvocatoria() {
  const [clase, setClase] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function cargarClase() {
      try {
        let id = new URLSearchParams(window.location.search).get('clase');
        if (!id) {
          try {
            id = JSON.parse(localStorage.getItem('claseFormulario') ?? 'null')?.id;
          } catch {
            /* Sin selección válida. */
          }
        }
        if (!id) throw new Error('Selecciona una clase desde el inicio para compartir su QR.');
        const respuesta = await fetch(`${API_URL}/clases/${encodeURIComponent(id)}`, {
          signal: controller.signal,
        });
        if (respuesta.status === 404)
          throw new Error('Esta clase ya no existe o el enlace no es válido.');
        if (!respuesta.ok)
          throw new Error('No se pudo cargar la clase. Intenta de nuevo en unos minutos.');
        setClase(await respuesta.json());
      } catch (error) {
        if (!controller.signal.aborted)
          setError(
            error instanceof TypeError
              ? 'No se pudo conectar con el servidor. Comprueba tu conexión e intenta de nuevo.'
              : error.message,
          );
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    }
    cargarClase();
    return () => controller.abort();
  }, []);

  const enlace = clase ? enlaceFormulario(clase) : '';

  if (cargando)
    return (
      <p role="status" className="p-5 text-sm text-gray-600">
        Cargando clase…
      </p>
    );
  if (error)
    return (
      <div className="m-4 rounded-2xl border border-red-100 bg-white p-5">
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
        <a
          href="/"
          className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-blue-700"
        >
          Volver a clases
        </a>
      </div>
    );

  return (
    <main className="min-h-0 bg-[#f5f3f8] px-4 py-6">
      <div className="mx-auto max-w-full">
        <section className="rounded-3xl bg-white px-5 py-7 shadow-sm">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-xl font-bold text-white">
                ✓
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900">Comparte esta clase</h2>

            <p className="mt-2 text-xs text-gray-500">
              Tu formulario ya está listo para compartir.
            </p>

            {clase && (
              <div className="mt-4 rounded-2xl bg-[#f4edff] px-4 py-3">
                <p className="text-sm font-semibold text-[#673ab7]">
                  {clase.nivel || clase.nombre || 'Clase'}
                </p>

                <p className="mt-1 text-xs text-gray-500">Sede {clase.sede || 'Sin especificar'}</p>
              </div>
            )}
          </div>

          {clase && (
            <QrFormulario
              url={enlace}
              nombreArchivo={'qr-clase-' + clase.id}
              tamano={160}
              claseContenedor="mt-7 flex justify-center"
              claseMarco="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              claseBoton="mx-auto mt-4 block rounded-full border border-[#d9c5f5] bg-[#f8f3ff] px-4 py-2 text-sm font-semibold text-[#673ab7] transition hover:bg-[#f0e7ff]"
              textoBoton="↓ Descargar QR"
            />
          )}

          <CopiarEnlace enlace={enlace} />

          <button
            type="button"
            disabled={!enlace}
            onClick={() => {
              window.open(
                `https://wa.me/?text=${encodeURIComponent(`Postula a la clase ${clase.nivel}: ${enlace}`)}`,
                '_blank',
                'noopener,noreferrer',
              );
            }}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#25d366] text-xs font-semibold text-white shadow-sm transition hover:bg-[#20bd5b] hover:shadow-md"
          >
            <span className="text-sm">◉</span>
            Reenviar por WhatsApp
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = enlace;
            }}
            className="mt-3 h-11 w-full rounded-xl border border-[#673ab7] bg-white text-xs font-semibold text-[#673ab7] transition hover:bg-[#f8f3ff]"
          >
            Ver vista previa del formulario
          </button>
        </section>
      </div>
    </main>
  );
}
