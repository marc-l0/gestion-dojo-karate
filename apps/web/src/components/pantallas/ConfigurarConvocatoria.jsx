import { useEffect, useState } from 'react';
import { enlaceFormulario } from '../../lib/enlace-formulario.js';
import CopiarEnlace from '../CopiarEnlace.jsx';
import QrFormulario from '../QrFormulario.jsx';

export default function ConfigurarConvocatoria() {
  const [clase, setClase] = useState(null);
  const [whatsapp, setWhatsapp] = useState(true);
  const [correo, setCorreo] = useState(true);
  const [mostrarGenerado, setMostrarGenerado] = useState(false);
  const [cerrandoGenerado, setCerrandoGenerado] = useState(false);
  const [desplazamiento, setDesplazamiento] = useState(0);
  const [inicioDeslizamiento, setInicioDeslizamiento] = useState(null);

  const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const formatearDias = (dias) => {
    if (!dias || dias.length === 0) {
      return 'Sin especificar';
    }

    const diasOrdenados = [...dias].sort((a, b) => diasOrden.indexOf(a) - diasOrden.indexOf(b));

    if (diasOrdenados.length === 1) {
      return diasOrdenados[0];
    }

    if (diasOrdenados.length === 2) {
      return diasOrdenados.join(' y ');
    }

    return diasOrdenados.slice(0, -1).join(', ') + ' y ' + diasOrdenados[diasOrdenados.length - 1];
  };

  useEffect(() => {
    const claseGuardada = localStorage.getItem('claseFormulario');

    if (claseGuardada) {
      setClase(JSON.parse(claseGuardada));
    }
  }, []);

  if (!clase) {
    return (
      <div className="min-h-0 bg-[#f7f9fb] p-10 text-gray-800">
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700">No hay una clase seleccionada</p>

          <button
            type="button"
            onClick={() => {
              window.location.href = '/calendario';
            }}
            className="mt-4 rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-purple-700"
          >
            Volver al calendario
          </button>
        </div>
      </div>
    );
  }

  const enlace = enlaceFormulario(clase);

  const cerrarGenerado = () => {
    setCerrandoGenerado(true);

    setTimeout(() => {
      setMostrarGenerado(false);
      setCerrandoGenerado(false);
      setDesplazamiento(0);
    }, 250);
  };

  const generarFormulario = () => {
    localStorage.setItem(
      'configuracionConvocatoria',
      JSON.stringify({
        whatsapp,
        correo,
      }),
    );

    setMostrarGenerado(true);
  };

  const iniciarDeslizamiento = (e) => {
    setInicioDeslizamiento(e.touches[0].clientY);
  };

  const moverDeslizamiento = (e) => {
    if (inicioDeslizamiento === null) {
      return;
    }

    const posicionActual = e.touches[0].clientY;
    const diferencia = posicionActual - inicioDeslizamiento;

    if (diferencia > 0) {
      setDesplazamiento(diferencia);
    }
  };

  const terminarDeslizamiento = () => {
    if (desplazamiento > 100) {
      cerrarGenerado();
    } else {
      setDesplazamiento(0);
    }

    setInicioDeslizamiento(null);
  };

  return (
    <div className="min-h-0 bg-[#f7f9fb] pb-8 text-gray-800">
      {/* ENCABEZADO */}

      {/* CONTENIDO */}

      <main className="mx-auto max-w-full space-y-6 px-4 pt-5">
        {/* PASO 1 */}

        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
              1
            </span>

            <h2 className="text-sm font-bold text-gray-900">
              Selección de clase y carga automática
            </h2>
          </div>

          {/* NIVEL */}

          <div className="mb-3">
            <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-400">
              NIVEL DE CLASE
            </p>

            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs font-medium text-gray-700 shadow-sm">
              {clase.nivel || clase.nombre || 'Sin especificar'}
            </div>
          </div>

          {/* DATOS AUTOMÁTICOS */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>

              <p className="text-sm font-bold uppercase tracking-wide text-green-600">
                Datos cargados automáticamente
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="flex items-center gap-2 text-gray-500">
                  <span className="text-sm">📍</span>
                  <span>Sede</span>
                </span>

                <span className="font-semibold text-gray-700">Sede {clase.sede}</span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="flex items-center gap-2 text-gray-500">
                  <span className="text-sm">📅</span>
                  <span>Días</span>
                </span>

                <span className="font-semibold text-gray-700">
                  {formatearDias(clase.frecuencia)}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="flex items-center gap-2 text-gray-500">
                  <span className="text-sm">◷</span>
                  <span>Horario</span>
                </span>

                <span className="font-semibold text-gray-700">
                  {clase.horaInicio} – {clase.horaFin}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-500">
                  <span className="text-sm">♙</span>
                  <span>Instructor</span>
                </span>

                <span className="font-semibold text-gray-700">
                  {clase.profesor || 'Sin especificar'}
                </span>
              </div>
            </div>

            {/* CONTACTO DEL DOCENTE */}

            <div className="mt-5 rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="text-xs font-bold text-green-700">Contacto del docente</p>

              <p className="mt-1 text-sm text-green-600">
                📱 WhatsApp: {clase.telefonoProfesor || 'No registrado'}
              </p>

              <p className="text-sm text-green-600">
                ✉ Correo: {clase.correoProfesor || 'No registrado'}
              </p>
            </div>
          </div>
        </section>

        {/* PASO 2 */}

        <section>
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
              2
            </span>

            <h2 className="text-sm font-bold text-gray-900">Canales de notificación automática</h2>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={whatsapp}
                onChange={(e) => {
                  setWhatsapp(e.target.checked);
                }}
                className="mt-0.5 h-4 w-4 cursor-pointer accent-purple-600"
              />

              <span className="text-sm leading-5 text-gray-600">
                Enviar notificación automática por WhatsApp al docente y postulante
              </span>
            </label>

            <label className="mt-3 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={correo}
                onChange={(e) => {
                  setCorreo(e.target.checked);
                }}
                className="mt-0.5 h-4 w-4 cursor-pointer accent-purple-600"
              />

              <span className="text-sm leading-5 text-gray-600">
                Enviar confirmación oficial por correo electrónico
              </span>
            </label>
          </div>
        </section>

        {/* BOTÓN */}

        <div className="pt-1">
          <button
            type="button"
            onClick={generarFormulario}
            className="h-12 w-full rounded-xl bg-purple-600 text-sm font-bold text-white shadow-sm transition hover:bg-purple-700 hover:shadow-md"
          >
            Generar formulario de convocatoria
          </button>
        </div>
      </main>

      {/* BOTTOM SHEET */}

      {mostrarGenerado && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={cerrarGenerado}
        >
          <div
            className={
              'app-bottom-sheet max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl bg-white px-5 pb-6 pt-3 shadow-2xl ' +
              (cerrandoGenerado
                ? 'animate-[slideDown_250ms_ease-in_forwards]'
                : 'animate-[slideUp_250ms_ease-out]')
            }
            style={{
              transform: desplazamiento > 0 ? 'translateY(' + desplazamiento + 'px)' : undefined,
            }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={iniciarDeslizamiento}
            onTouchMove={moverDeslizamiento}
            onTouchEnd={terminarDeslizamiento}
          >
            {/* INDICADOR PARA DESLIZAR */}

            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200"></div>

            {/* ICONO DE ÉXITO */}

            <div className="flex justify-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-xl font-bold text-green-500">
                ✓
              </div>
            </div>

            {/* TÍTULO */}

            <div className="mt-3 text-center">
              <h2 className="text-sm font-bold text-gray-900">
                ¡Formulario generado exitosamente!
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {clase.nivel || clase.nombre || 'Clase'} · Sede {clase.sede}
              </p>
            </div>

            {/* QR */}

            <QrFormulario
              url={enlace}
              nombreArchivo={'qr-clase-' + clase.id}
              tamano={128}
              claseBoton="mx-auto mt-3 block rounded-full border border-purple-100 bg-purple-50 px-4 py-2 text-xs font-semibold text-purple-600"
              textoBoton="↓ Descargar QR para impresión / redes"
            />

            {/* ENLACE */}

            <CopiarEnlace enlace={enlace} />

            {/* WHATSAPP */}

            <button
              type="button"
              onClick={() => {
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(`Postula a la clase ${clase.nivel}: ${enlace}`)}`,
                  '_blank',
                  'noopener,noreferrer',
                );
              }}
              className="mt-3 h-10 w-full rounded-xl bg-green-500 text-sm font-bold text-white shadow-sm transition hover:bg-green-600"
            >
              ▣ Reenviar por WhatsApp
            </button>

            {/* VISTA PREVIA */}

            <button
              type="button"
              onClick={() => {
                window.location.href = enlace;
              }}
              className="mt-2 h-10 w-full rounded-xl border border-purple-500 bg-white text-sm font-bold text-purple-600 transition hover:bg-purple-50"
            >
              Ver vista previa del formulario
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
