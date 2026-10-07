import { useEffect, useState } from 'react';
import { API_URL } from '../lib/api.js';

export default function Formulario() {
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

  const [fechaNacimiento, setFechaNacimiento] = useState('');

  const [claseFormulario, setClaseFormulario] = useState(null);

  const [enviado, setEnviado] = useState(false);

  const [telefono, setTelefono] = useState('');

  const [telefonoApoderado, setTelefonoApoderado] = useState('');

  const [claseVigente, setClaseVigente] = useState(true);

  const [errorClase, setErrorClase] = useState('');

  useEffect(() => {
    const aplicarClase = (clase) => {
      setClaseFormulario(clase);

      if (clase.fechaInicio && clase.fechaFin) {
        const hoy = new Date().toISOString().split('T')[0];
        setClaseVigente(hoy >= clase.fechaInicio && hoy <= clase.fechaFin);
      }
    };

    const claseId = new URLSearchParams(window.location.search).get('clase');

    // Enlace público (QR): se pide la clase a la API por su id.
    if (claseId) {

      fetch(API_URL + "/clases/" + encodeURIComponent(claseId))
        .then((respuesta) => {

          if (respuesta.status === 404) {
            throw new Error("NO_EXISTE");
          }

          if (!respuesta.ok) {
            throw new Error("ERROR");
          }

          return respuesta.json();
        })
        .then((clase) => {
          aplicarClase(clase);
        })
        .catch((error) => {
          setErrorClase(
            error.message === "NO_EXISTE"
              ? "Esta clase ya no existe o el enlace no es válido."
              : "No se pudo cargar la clase. Intenta de nuevo en unos minutos."
          );
        });

      return;
    }

    // Vista previa desde el panel de administración
    const claseGuardada = localStorage.getItem('claseFormulario');

    if (claseGuardada) {
      aplicarClase(JSON.parse(claseGuardada));
    }
  }, []);

  const hoy = new Date().toISOString().split('T')[0];

  const fechaMinima = new Date();

  fechaMinima.setFullYear(fechaMinima.getFullYear() - 100);

  const fechaMinimaFormato = fechaMinima.toISOString().split('T')[0];

  const calcularEdad = () => {
    if (!fechaNacimiento) {
      return 0;
    }

    const hoy = new Date();

    const nacimiento = new Date(fechaNacimiento);

    let edad = hoy.getFullYear() - nacimiento.getFullYear();

    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  };

  const edad = calcularEdad();

  const esMenor = fechaNacimiento !== '' && edad < 18;

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return '';
    }

    const partes = fecha.split('-');

    if (partes.length !== 3) {
      return fecha;
    }

    return partes[2] + '/' + partes[1] + '/' + partes[0];
  };

  return (
    <>
      {!enviado ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();

            if (!claseVigente) {
              alert('Esta convocatoria ya no está vigente.');

              return;
            }

            if (!claseFormulario) {
              alert('No se encontró una clase seleccionada.');

              return;
            }

            const datos = new FormData(e.currentTarget);

            const formulario = e.currentTarget;

            const formularioDatos = Object.fromEntries(datos);

            const postulacion = {
              ...formularioDatos,

              claseId: claseFormulario.id,

              claseNombre: claseFormulario.nombre,

              sede: claseFormulario.sede,

              profesor: claseFormulario.profesor,

              frecuencia: claseFormulario.frecuencia,

              horaInicio: claseFormulario.horaInicio,

              horaFin: claseFormulario.horaFin,
            };

            const respuesta = await fetch(API_URL + '/clases/postulaciones', {
              method: 'POST',

              headers: {
                'Content-Type': 'application/json',
              },

              body: JSON.stringify(postulacion),
            });

            if (!respuesta.ok) {
              throw new Error('No se pudo registrar la postulación');
            }

            formulario.reset();

            setFechaNacimiento('');

            setTelefono('');

            setTelefonoApoderado('');

            setEnviado(true);
          }}
          onChange={() => setEnviado(false)}
          className="max-w-xl mx-auto min-h-screen bg-[#f3edf9] px-4 pb-6 mt-10 rounded-xl shadow-md"
        >
          <div className="-mx-4 mb-4 bg-[#673ab7] px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/configurar-convocatoria';
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20"
              >
                ❮
              </button>

              <div>
                <h1 className="text-base font-semibold">Postulación a clase</h1>

                <p className="mt-1 text-xs text-white/80">Completa tus datos para postular.</p>
              </div>
            </div>
          </div>

          {errorClase && (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-700">{errorClase}</p>
            </div>
          )}

          {!claseVigente && (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-700">
                Esta convocatoria ya no está vigente.
              </p>

              <p className="mt-1 text-xs leading-5 text-red-500">
                La fecha de inscripción de esta clase ha finalizado.
              </p>

              <button
                type="button"
                onClick={() => {
                  window.location.href = '/configurar-convocatoria';
                }}
                className="mt-3 h-9 w-full rounded-xl bg-red-500 text-xs font-semibold text-white"
              >
                Volver a convocatorias
              </button>
            </div>
          )}

          <div className="mb-5 h-2 w-full rounded-full bg-white">
            <div className="h-2 w-full rounded-full bg-[#673ab7]"></div>
          </div>

          {claseFormulario && (
            <div className="mb-5 rounded-xl bg-white p-4">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-[#673ab7]"></span>

                <h2 className="text-sm font-bold text-gray-800">Clase y horario asignado</h2>
              </div>

              <div className="rounded-2xl bg-[#f3dff7] p-4">
                <p className="text-sm font-bold text-[#542078]">
                  {claseFormulario.nombre} — Sede {claseFormulario.sede}
                </p>

                <p className="mt-1 text-xs text-[#7b4b8f]">Prof. {claseFormulario.profesor}</p>

                <p className="mt-1 text-xs text-[#7b4b8f]">
                  📅 {formatearDias(claseFormulario.frecuencia)}
                </p>
              </div>

              <div className="mt-3 rounded-2xl bg-[#f1f5f9] p-3">
                <p className="text-xs text-gray-600">
                  🔒 Horario: {claseFormulario.horaInicio} - {claseFormulario.horaFin}
                </p>

                {claseFormulario.fechaInicio && claseFormulario.fechaFin && (
                  <p className="mt-1 text-[10px] text-gray-400">
                    Vigencia: {formatearFecha(claseFormulario.fechaInicio)} -{' '}
                    {formatearFecha(claseFormulario.fechaFin)}
                  </p>
                )}

                <p className="mt-1 text-[10px] text-gray-400">Vacantes estrictamente limitadas</p>
              </div>
            </div>
          )}

          <div className="mb-5 rounded-xl bg-white p-4">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-[#673ab7]"></span>

              <h2 className="text-sm font-bold text-gray-800">Datos del postulante</h2>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-[#673ab7]">
                Nombres y Apellidos completos *
                <input
                  type="text"
                  name="nombre"
                  required
                  disabled={!claseVigente}
                  placeholder="Ej. Mateo Javier Morales"
                  className="mt-1 w-full rounded-lg border-0 bg-[#f8f6fc] p-3 text-sm outline-none focus:ring-2 focus:ring-[#673ab7]/30"
                />
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-[#673ab7]">
                Número de WhatsApp *
                <input
                  type="tel"
                  required
                  disabled={!claseVigente}
                  name="telefono"
                  pattern="[0-9]{9}"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  placeholder="Ej. 999 888 111"
                  className="mt-1 w-full rounded-lg border-0 bg-[#f8f6fc] p-3 text-sm outline-none focus:ring-2 focus:ring-[#673ab7]/30"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#673ab7]">
                Correo electrónico *
                <input
                  type="email"
                  name="correo"
                  required
                  disabled={!claseVigente}
                  placeholder="correo@ejemplo.com"
                  className="mt-1 w-full rounded-lg border-0 bg-[#f8f6fc] p-3 text-sm outline-none focus:ring-2 focus:ring-[#673ab7]/30"
                />
              </label>
            </div>
          </div>

          <div className="mb-5 rounded-xl bg-white p-4">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-[#673ab7]"></span>

              <h2 className="text-sm font-bold text-gray-800">Fecha de nacimiento</h2>
            </div>

            <label className="block text-xs font-medium text-[#673ab7]">
              Fecha de nacimiento *
              <input
                type="date"
                name="fechaNacimiento"
                required
                disabled={!claseVigente}
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                min={fechaMinimaFormato}
                max={hoy}
                className="mt-1 w-full rounded-lg border-0 bg-[#f8f6fc] p-3 text-sm outline-none focus:ring-2 focus:ring-[#673ab7]/30"
              />
            </label>

            <p className="mt-3 text-sm text-gray-500">
              Edad: {fechaNacimiento ? edad + ' años' : ''}
            </p>
          </div>

          {esMenor && (
            <div className="mb-5 rounded-xl bg-white p-4">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-[#673ab7]"></span>

                <h2 className="text-sm font-bold text-gray-800">Datos del apoderado</h2>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-[#673ab7]">
                  Nombre completo del apoderado *
                  <input
                    type="text"
                    name="nombreCompletoApoderado"
                    required
                    disabled={!claseVigente}
                    placeholder="Ej. Juan Carlos Morales"
                    className="mt-1 w-full rounded-lg border-0 bg-[#f8f6fc] p-3 text-sm outline-none focus:ring-2 focus:ring-[#673ab7]/30"
                  />
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-[#673ab7]">
                  Correo del apoderado *
                  <input
                    type="email"
                    name="correoApoderado"
                    required
                    disabled={!claseVigente}
                    placeholder="Ej. correo@ejemplo.com"
                    className="mt-1 w-full rounded-lg border-0 bg-[#f8f6fc] p-3 text-sm outline-none focus:ring-2 focus:ring-[#673ab7]/30"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#673ab7]">
                  Teléfono del apoderado *
                  <input
                    type="tel"
                    name="telefonoApoderado"
                    required
                    disabled={!claseVigente}
                    placeholder="Ej. 999 888 111"
                    pattern="[0-9]{9}"
                    value={telefonoApoderado}
                    onChange={(e) =>
                      setTelefonoApoderado(e.target.value.replace(/\D/g, '').slice(0, 9))
                    }
                    className="mt-1 w-full rounded-lg border-0 bg-[#f8f6fc] p-3 text-sm outline-none focus:ring-2 focus:ring-[#673ab7]/30"
                  />
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!claseVigente}
            className={
              'w-full rounded-xl py-3 text-sm font-semibold text-white shadow-sm cursor-pointer transition ' +
              (claseVigente
                ? 'bg-[#673ab7] hover:bg-[#5b2fa8] active:scale-[0.98]'
                : 'bg-gray-400 cursor-not-allowed')
            }
          >
            {claseVigente ? 'Enviar postulación' : 'Convocatoria vencida'}
          </button>
        </form>
      ) : (
        <div className="min-h-screen bg-[#f3edf9] px-4 pb-6">
          <div className="-mx-4 mb-6 bg-[#673ab7] px-5 py-4 text-white">
            <h1 className="text-base font-semibold">Postulación enviada</h1>
          </div>

          <div className="mx-auto max-w-xl">
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <span className="text-3xl">✓</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-800">¡Postulación enviada!</h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Hemos recibido correctamente tus datos.
              </p>

              {claseFormulario && (
                <div className="mt-5 rounded-2xl bg-[#f3dff7] p-4 text-left">
                  <p className="text-xs font-medium text-[#7b4b8f]">Clase seleccionada</p>

                  <p className="mt-1 text-sm font-bold text-[#542078]">{claseFormulario.nombre}</p>

                  <p className="mt-1 text-xs text-[#7b4b8f]">Sede {claseFormulario.sede}</p>

                  <p className="mt-1 text-xs text-[#7b4b8f]">
                    {formatearDias(claseFormulario.frecuencia)}
                  </p>

                  <p className="mt-1 text-xs text-[#7b4b8f]">
                    {claseFormulario.horaInicio} - {claseFormulario.horaFin}
                  </p>
                </div>
              )}

              <div className="mt-5 rounded-xl bg-[#f8f6fc] p-4 text-left">
                <p className="text-sm font-semibold text-gray-800">¿Qué debes hacer ahora?</p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Guarda una captura de esta pantalla y preséntala el día de tu clase.
                </p>
              </div>

              <div className="mt-5 rounded-xl border border-purple-100 bg-white p-4 text-left">
                <p className="text-xs font-medium text-[#673ab7]">Estado de tu postulación</p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400"></span>

                  <p className="text-sm font-semibold text-gray-700">Pendiente de confirmación</p>
                </div>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  El administrador revisará tu postulación y confirmará la disponibilidad de una
                  vacante.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
