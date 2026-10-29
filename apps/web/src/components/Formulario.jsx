import { useEffect, useRef, useState } from 'react';
import { API_URL } from '../lib/api.js';
import IndicadorCupos from './IndicadorCupos.jsx';

const fechaEnLima = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
const campo =
  'mt-2 block min-h-12 w-full min-w-0 rounded-xl border border-purple-100 bg-white px-3 py-2 text-base text-gray-900 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 disabled:bg-gray-100';

export default function Formulario() {
  const [clase, setClase] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorClase, setErrorClase] = useState('');
  const [errorEnvio, setErrorEnvio] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [solicitud, setSolicitud] = useState(null);
  const [reintento, setReintento] = useState(0);
  const bloqueo = useRef(false);
  const aviso = useRef(null);
  const confirmacion = useRef(null);
  const hoy = fechaEnLima();
  const fechaMinima = new Date(`${hoy}T12:00:00Z`);
  fechaMinima.setUTCFullYear(fechaMinima.getUTCFullYear() - 101);
  fechaMinima.setUTCDate(fechaMinima.getUTCDate() + 1);
  let edad = Number(hoy.slice(0, 4)) - Number(fechaNacimiento.slice(0, 4));
  if (hoy.slice(5) < fechaNacimiento.slice(5)) edad -= 1;
  const esMenor = Boolean(fechaNacimiento) && edad < 18;
  const convocatoriaAbierta =
    clase?.fechaInicio &&
    clase.fechaFin &&
    clase.fechaInicio <= clase.fechaFin &&
    hoy <= clase.fechaFin;
  const sinCupos = clase && clase.cuposDisponibles <= 0;
  const habilitado = Boolean(convocatoriaAbierta && !sinCupos && !cargando);

  useEffect(() => {
    const controller = new AbortController();
    async function cargar() {
      setCargando(true);
      setErrorClase('');
      try {
        let id = new URLSearchParams(window.location.search).get('clase');
        if (!id) {
          try {
            id = JSON.parse(localStorage.getItem('claseFormulario') ?? 'null')?.id;
          } catch {
            /* Una vista previa dañada no debe bloquear la página. */
          }
        }
        if (!id)
          throw new Error('Abre el enlace o escanea el QR de la clase a la que deseas postular.');
        const respuesta = await fetch(`${API_URL}/clases/${encodeURIComponent(id)}`, {
          signal: controller.signal,
          cache: reintento > 0 ? 'reload' : 'default',
        });
        if (respuesta.status === 404)
          throw new Error('Esta clase ya no existe o el enlace no es válido.');
        if (!respuesta.ok) throw new Error('No se pudo cargar la clase. Intenta de nuevo.');
        setClase(await respuesta.json());
      } catch (error) {
        if (controller.signal.aborted) return;
        setClase(null);
        setErrorClase(
          error instanceof TypeError
            ? 'No hay conexión con el servidor. Comprueba tu conexión e intenta de nuevo.'
            : error.message,
        );
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    }
    cargar();
    return () => controller.abort();
  }, [reintento]);

  useEffect(() => {
    if (errorEnvio) aviso.current?.focus();
  }, [errorEnvio]);
  useEffect(() => {
    if (enviado) confirmacion.current?.focus();
  }, [enviado]);

  async function enviar(event) {
    event.preventDefault();
    if (!habilitado || bloqueo.current) return;
    bloqueo.current = true;
    setEnviando(true);
    setErrorEnvio('');
    const datos = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const respuesta = await fetch(`${API_URL}/clases/postulaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...datos,
          claseId: clase.id,
          consentimiento: datos.consentimiento === 'on',
        }),
      });
      if (!respuesta.ok) {
        const detalle = await respuesta.json().catch(() => ({}));
        const mensaje = Array.isArray(detalle.message)
          ? detalle.message.join(' ')
          : detalle.message;
        throw new Error(
          respuesta.status >= 500
            ? 'No pudimos guardar tu postulación. Intenta de nuevo en unos minutos.'
            : mensaje || 'No se pudo registrar la postulación. Intenta de nuevo.',
        );
      }
      const resultado = await respuesta.json().catch(() => ({}));
      setSolicitud(resultado.id ? `SOL-${resultado.id}` : null);
      setEnviado(true);
    } catch (error) {
      setErrorEnvio(
        error instanceof TypeError
          ? 'No se pudo conectar con el servidor. Tus datos siguen aquí; comprueba tu conexión antes de reintentar.'
          : error.message,
      );
    } finally {
      bloqueo.current = false;
      setEnviando(false);
    }
  }

  const resumenClase = clase && (
    <section className="rounded-2xl bg-purple-50 p-5" aria-label="Clase seleccionada">
      <h2 className="break-words text-lg font-bold text-purple-900">
        {clase.nivel} · Sede {clase.sede}
      </h2>
      <p className="mt-2 text-sm text-purple-900">Prof. {clase.profesor}</p>
      <p className="mt-2 text-sm text-purple-900">
        {Array.isArray(clase.frecuencia) ? clase.frecuencia.join(', ') : clase.frecuencia}
      </p>
      <p className="mt-1 text-sm text-purple-900">
        {clase.horaInicio} – {clase.horaFin}
      </p>
      <p className="mt-2 text-sm text-purple-900">
        Fechas de la clase: {clase.fechaInicio} al {clase.fechaFin}
      </p>
      <div className="mt-3">
        <IndicadorCupos disponibles={clase.cuposDisponibles} total={clase.cupos} />
      </div>
    </section>
  );

  return (
    <main className="mx-auto min-h-dvh w-full max-w-xl px-4 py-6 sm:py-10">
      <header className="mb-6">
        <p className="text-sm font-semibold text-purple-700">Dojo Karate</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          {enviado ? 'Postulación enviada' : 'Postula a tu clase'}
        </h1>
        <p className="mt-2 text-base text-gray-600">
          {enviado
            ? 'Recibimos tus datos correctamente.'
            : 'Completa tus datos. La vacante se confirma después de la revisión del dojo.'}
        </p>
      </header>
      {enviado ? (
        <section
          ref={confirmacion}
          tabIndex={-1}
          className="space-y-5 rounded-2xl bg-white p-5 shadow-sm"
          aria-label="Confirmación de postulación"
        >
          <p className="text-lg font-bold text-green-800">¡Postulación enviada!</p>
          {solicitud && (
            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="text-sm text-green-800">Número de solicitud</p>
              <p className="mt-1 break-all font-mono text-lg font-bold text-green-900">
                {solicitud}
              </p>
              <p className="mt-2 text-sm text-green-800">
                Guarda este número o una captura de esta pantalla para consultar tu postulación con
                el dojo.
              </p>
            </div>
          )}
          {resumenClase}
          <p className="font-semibold text-gray-900">Pendiente de confirmación</p>
          <p className="text-gray-600">
            El dojo revisará tu postulación y se pondrá en contacto contigo. Este envío todavía no
            confirma una vacante.
          </p>
        </section>
      ) : (
        <form onSubmit={enviar} className="space-y-5" aria-busy={enviando || cargando}>
          {cargando && (
            <p role="status" className="rounded-xl bg-white p-4">
              Cargando clase…
            </p>
          )}
          {errorClase && (
            <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">
              <p>{errorClase}</p>
              <button
                type="button"
                onClick={() => setReintento((valor) => valor + 1)}
                className="mt-3 min-h-11 rounded-lg border border-red-300 px-4 font-semibold"
              >
                Reintentar
              </button>
            </div>
          )}
          {resumenClase}
          {clase && !convocatoriaAbierta && (
            <p role="alert" className="rounded-xl bg-amber-50 p-4 text-amber-900">
              {clase.fechaFin && hoy > clase.fechaFin
                ? 'Esta clase ya finalizó y no recibe postulaciones.'
                : 'Esta clase no tiene fechas válidas para recibir postulaciones. Contacta al dojo.'}
            </p>
          )}
          {convocatoriaAbierta && hoy < clase.fechaInicio && (
            <p className="rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
              La clase empieza el {clase.fechaInicio}. Ya puedes enviar tu postulación.
            </p>
          )}
          {sinCupos && (
            <p role="alert" className="rounded-xl bg-amber-50 p-4 text-amber-900">
              Esta clase ya no tiene cupos disponibles.
            </p>
          )}
          <fieldset
            disabled={!habilitado || enviando}
            className="min-w-0 space-y-5 rounded-2xl bg-white p-5 shadow-sm disabled:opacity-60"
          >
            <legend className="sr-only">Datos de la postulación</legend>
            <h2 className="text-lg font-bold text-gray-900">Datos del postulante</h2>
            <label className="block text-sm font-medium text-gray-800">
              Nombres y apellidos *
              <input
                className={campo}
                name="nombre"
                autoComplete="name"
                required
                minLength={3}
                maxLength={120}
                placeholder="Nombre completo"
              />
            </label>
            <label className="block text-sm font-medium text-gray-800">
              Número de WhatsApp *
              <input
                className={campo}
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                name="telefono"
                required
                pattern="[0-9]{9}"
                maxLength={9}
                title="Escribe 9 dígitos sin espacios"
                placeholder="999888111"
              />
            </label>
            <label className="block text-sm font-medium text-gray-800">
              Correo electrónico *
              <input
                className={campo}
                type="email"
                inputMode="email"
                autoComplete="email"
                name="correo"
                required
                maxLength={254}
                placeholder="correo@ejemplo.com"
              />
            </label>
            <label className="block text-sm font-medium text-gray-800">
              Fecha de nacimiento *
              <input
                className={campo}
                type="date"
                autoComplete="bday"
                name="fechaNacimiento"
                required
                max={hoy}
                min={fechaMinima.toISOString().slice(0, 10)}
                value={fechaNacimiento}
                onChange={(event) => setFechaNacimiento(event.target.value)}
              />
            </label>
            {fechaNacimiento && <p className="text-sm text-gray-600">Edad: {edad} años</p>}
            {esMenor && (
              <section
                className="space-y-5 border-t border-purple-100 pt-5"
                aria-label="Datos del apoderado"
              >
                <h2 className="text-lg font-bold text-gray-900">Datos del apoderado</h2>
                <p className="text-sm text-gray-600">
                  La postulación de un menor debe ser completada y autorizada por su apoderado.
                </p>
                <label className="block text-sm font-medium text-gray-800">
                  Nombre completo del apoderado *
                  <input
                    className={campo}
                    name="nombreCompletoApoderado"
                    autoComplete="section-apoderado name"
                    required
                    minLength={3}
                    maxLength={120}
                  />
                </label>
                <label className="block text-sm font-medium text-gray-800">
                  Correo del apoderado *
                  <input
                    className={campo}
                    type="email"
                    inputMode="email"
                    name="correoApoderado"
                    autoComplete="section-apoderado email"
                    required
                    maxLength={254}
                  />
                </label>
                <label className="block text-sm font-medium text-gray-800">
                  Teléfono del apoderado *
                  <input
                    className={campo}
                    type="tel"
                    inputMode="numeric"
                    name="telefonoApoderado"
                    autoComplete="section-apoderado tel-national"
                    required
                    pattern="[0-9]{9}"
                    maxLength={9}
                    title="Escribe 9 dígitos sin espacios"
                  />
                </label>
              </section>
            )}
            <section
              className="rounded-xl bg-purple-50 p-4 text-sm leading-6 text-gray-700"
              aria-label="Uso de datos personales"
            >
              <h2 className="font-bold text-gray-900">Uso de tus datos</h2>
              <p className="mt-2">
                El dojo utilizará los datos del postulante y, cuando corresponda, de su apoderado
                para evaluar esta postulación, gestionar los cupos y comunicar su resultado. Se
                almacenan en una hoja de Google Sheets administrada por el dojo. Puedes solicitar al
                administrador del dojo información, corrección o eliminación de tus datos.
              </p>
              <p className="mt-2">
                Esta autorización se limita a la gestión de tu postulación; no incluye publicidad.
              </p>
              <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-3">
                <input
                  className="mt-1 h-5 w-5 shrink-0 accent-purple-700"
                  type="checkbox"
                  name="consentimiento"
                  required
                />
                <span>
                  {esMenor
                    ? 'Soy el apoderado y autorizo el uso de mis datos y los del menor para gestionar esta postulación.'
                    : 'He leído el aviso y autorizo el uso de mis datos para gestionar esta postulación.'}{' '}
                  *
                </span>
              </label>
            </section>
          </fieldset>
          {errorEnvio && (
            <div
              ref={aviso}
              tabIndex={-1}
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
            >
              {errorEnvio}
            </div>
          )}
          <button
            type="submit"
            disabled={!habilitado || enviando}
            className="min-h-12 w-full rounded-xl bg-purple-700 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {enviando ? 'Enviando…' : 'Enviar postulación'}
          </button>
        </form>
      )}
    </main>
  );
}
