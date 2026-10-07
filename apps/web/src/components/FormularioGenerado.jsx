import { useEffect, useState } from 'react';

export default function FormularioGenerado() {
  const [clase, setClase] = useState(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const claseGuardada = localStorage.getItem('claseFormulario');

    if (claseGuardada) {
      setClase(JSON.parse(claseGuardada));
    }
  }, []);

  const enlace = clase ? enlaceFormulario(clase) : '';

  const copiarEnlace = async () => {
    if (!enlace) {
      return;
    }

    try {
      await navigator.clipboard.writeText(enlace);
      setCopiado(true);

      setTimeout(() => {
        setCopiado(false);
      }, 2000);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f3f8] px-4 py-6">
      <div className="mx-auto max-w-md">
        <header className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              window.location.href = '/configurar-convocatoria';
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg text-gray-500 shadow-sm transition hover:bg-gray-50"
          >
            ←
          </button>

          <h1 className="text-base font-semibold text-red-600">PRUEBA CAMBIO</h1>
        </header>

        <section className="rounded-3xl bg-white px-5 py-7 shadow-sm">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-xl font-bold text-white">
                ✓
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900">¡Formulario generado exitosamente!</h2>

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
              colorQr="#673ab7"
              claseContenedor="mt-7 flex justify-center"
              claseMarco="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              claseBoton="mx-auto mt-4 block rounded-full border border-[#d9c5f5] bg-[#f8f3ff] px-4 py-2 text-[10px] font-semibold text-[#673ab7] transition hover:bg-[#f0e7ff]"
              textoBoton="↓ Descargar QR"
            />
          )}

          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold text-gray-700">Enlace del formulario</p>

            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="min-w-0 flex-1 truncate text-[10px] text-gray-500">{enlace}</p>

              <button
                type="button"
                onClick={copiarEnlace}
                className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-[10px] font-semibold text-[#673ab7] shadow-sm transition hover:bg-[#f8f3ff]"
              >
                {copiado ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          <button
            type="button"
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#25d366] text-xs font-semibold text-white shadow-sm transition hover:bg-[#20bd5b] hover:shadow-md"
          >
            <span className="text-sm">◉</span>
            Reenviar por WhatsApp
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = '/formulario';
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
