import { useCallback, useEffect, useRef, useState } from 'react';
import { useOperacion } from '../../hooks/useOperacion.js';
import { apiFetch, leerRespuesta } from '../../lib/api.js';
import IndicadorCupos from '../IndicadorCupos.jsx';
import Mensaje from '../Mensaje.jsx';

const normalizar = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
const estadoGrupo = (estado) =>
  ['aceptado', 'aprobado'].includes(estado)
    ? 'aceptado'
    : ['rechazado', 'ignorado'].includes(estado)
      ? 'rechazado'
      : 'pendiente';
const estados = {
  pendiente: ['Pendiente', 'bg-amber-50 text-amber-800'],
  aceptado: ['Aceptada', 'bg-green-50 text-green-800'],
  rechazado: ['Rechazada', 'bg-red-50 text-red-800'],
};
const fechaTexto = (fecha) => {
  const valor = new Date(fecha);
  return Number.isNaN(valor.getTime())
    ? 'Sin fecha registrada'
    : new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(valor);
};

export default function Postulaciones() {
  const [clases, setClases] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [claseId, setClaseId] = useState('');
  const seleccionClase = useRef('');
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('todas');
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [modoSeleccion, setModoSeleccion] = useState(false);
  const [seleccionados, setSeleccionados] = useState([]);
  const { ocupado, aviso, setAviso, ejecutar } = useOperacion();

  const cargar = useCallback(async () => {
    setCargando(true);
    setErrorCarga('');
    try {
      const [lista, solicitudes] = await Promise.all([
        apiFetch('/clases').then((respuesta) =>
          leerRespuesta(respuesta, 'No se pudieron cargar las clases.'),
        ),
        apiFetch('/clases/postulaciones').then((respuesta) =>
          leerRespuesta(respuesta, 'No se pudieron cargar las postulaciones.'),
        ),
      ]);
      const solicitada =
        seleccionClase.current || new URLSearchParams(window.location.search).get('clase');
      const elegida =
        solicitada === 'todas'
          ? 'todas'
          : String((lista.find((item) => String(item.id) === solicitada) ?? lista[0])?.id ?? '');
      if (
        solicitada &&
        solicitada !== 'todas' &&
        !lista.some((item) => String(item.id) === solicitada)
      )
        setAviso({
          tipo: 'aviso',
          texto: 'La clase del enlace ya no está disponible. Selecciona otra clase.',
        });
      setClases(lista);
      setPostulaciones(solicitudes);
      setClaseId(elegida);
      seleccionClase.current = elegida;
      const url = new URL(window.location.href);
      if (elegida) url.searchParams.set('clase', elegida);
      else url.searchParams.delete('clase');
      window.history.replaceState(null, '', url);
    } catch (error) {
      setErrorCarga(
        error instanceof TypeError
          ? 'No se pudo conectar con el servidor. Comprueba tu conexión.'
          : error.message,
      );
    } finally {
      setCargando(false);
    }
  }, [setAviso]);
  useEffect(() => {
    cargar();
  }, [cargar]);

  const clase = clases.find((item) => String(item.id) === claseId);
  const deClase = postulaciones.filter(
    (item) => claseId === 'todas' || String(item.claseId) === claseId,
  );
  const consulta = normalizar(busqueda.trim());
  const filtradas = deClase.filter(
    (item) =>
      (estado === 'todas' || estadoGrupo(item.estado) === estado) &&
      (!consulta || normalizar(`${item.nombre} ${item.correo} SOL-${item.id}`).includes(consulta)),
  );
  const bloqueado = ocupado || cargando || Boolean(errorCarga);
  function cambiarClase(valor) {
    setClaseId(valor);
    seleccionClase.current = valor;
    setSeleccionados([]);
    setModoSeleccion(false);
    setAviso(null);
    const url = new URL(window.location.href);
    url.searchParams.set('clase', valor);
    window.history.replaceState(null, '', url);
  }
  async function cambiarEstado(postulacion, nuevoEstado) {
    await ejecutar(async () => {
      await leerRespuesta(
        await apiFetch('/clases/postulaciones/estado', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: postulacion.id, estado: nuevoEstado }),
        }),
        'No se pudo actualizar la postulación. Intenta de nuevo.',
      );
      await cargar();
      return nuevoEstado === 'aceptado'
        ? 'Postulación aceptada. Los cupos se han actualizado.'
        : 'Postulación rechazada correctamente.';
    });
  }
  async function eliminarSeleccionados() {
    if (
      !seleccionados.length ||
      !window.confirm(
        `¿Eliminar ${seleccionados.length} postulación(es)? Esta acción no se puede deshacer.`,
      )
    )
      return;
    const ids = [...seleccionados];
    await ejecutar(async () => {
      let eliminadas = 0;
      try {
        for (const id of ids) {
          await leerRespuesta(
            await apiFetch(`/clases/postulaciones/${id}`, { method: 'DELETE' }),
            'No se pudo eliminar la postulación.',
          );
          eliminadas += 1;
        }
      } catch (error) {
        setSeleccionados([]);
        setModoSeleccion(false);
        await cargar();
        throw new Error(
          `Se eliminaron ${eliminadas} de ${ids.length} postulaciones. ${error.message} Revisa la lista antes de reintentar.`,
        );
      }
      setSeleccionados([]);
      setModoSeleccion(false);
      await cargar();
      return `${eliminadas} postulación(es) eliminada(s) correctamente.`;
    });
  }

  return (
    <main className="space-y-4 px-4 pb-6 pt-4" aria-busy={cargando || ocupado}>
      <Mensaje aviso={aviso} />
      {errorCarga && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <p>{errorCarga}</p>
          <button
            type="button"
            disabled={ocupado || cargando}
            onClick={cargar}
            className="mt-2 font-semibold"
          >
            Reintentar
          </button>
        </div>
      )}
      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="font-bold text-gray-900">Postulaciones recibidas</h2>
        <label className="block text-sm font-medium text-gray-700" htmlFor="selectorClase">
          Clase
        </label>
        <select
          id="selectorClase"
          value={claseId}
          disabled={bloqueado}
          onChange={(event) => cambiarClase(event.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50 px-3"
        >
          {!clases.length && <option value="">Sin clases disponibles</option>}
          {clases.map((item) => (
            <option key={item.id} value={String(item.id)}>
              {item.nivel} · {item.sede}
            </option>
          ))}
          {clases.length > 0 && <option value="todas">Todas las clases</option>}
        </select>
        {clase && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {clase.horaInicio} – {clase.horaFin} · Prof. {clase.profesor}
            </p>
            <IndicadorCupos disponibles={clase.cuposDisponibles} total={clase.cupos} />
            <p className="text-xs text-gray-500">
              Las postulaciones pendientes no reservan una vacante.
            </p>
          </div>
        )}
        <div>
          <label
            htmlFor="buscar-postulaciones"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Buscar por nombre, correo o número
          </label>
          <input
            id="buscar-postulaciones"
            type="search"
            value={busqueda}
            disabled={ocupado}
            onChange={(event) => {
              setBusqueda(event.target.value);
              setSeleccionados([]);
            }}
            placeholder="Ej. Ana o SOL-123…"
            className="rounded-xl border border-gray-200 bg-gray-50 px-3"
          />
        </div>
        <div>
          <label
            htmlFor="estado-postulaciones"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Estado
          </label>
          <select
            id="estado-postulaciones"
            value={estado}
            disabled={ocupado}
            onChange={(event) => {
              setEstado(event.target.value);
              setSeleccionados([]);
            }}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3"
          >
            <option value="todas">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="aceptado">Aceptadas</option>
            <option value="rechazado">Rechazadas</option>
          </select>
        </div>
        {(busqueda || estado !== 'todas') && (
          <button
            type="button"
            disabled={ocupado}
            onClick={() => {
              setBusqueda('');
              setEstado('todas');
              setSeleccionados([]);
            }}
            className="text-sm font-semibold text-blue-700"
          >
            Limpiar filtros
          </button>
        )}
      </section>

      {cargando ? (
        <p role="status" className="rounded-xl bg-white p-4 text-sm text-gray-600">
          Cargando postulaciones…
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p role="status" className="text-sm text-gray-600">
              {filtradas.length} de {deClase.length} postulaciones
            </p>
            <div className="flex gap-2">
              {modoSeleccion && (
                <button
                  id="cancelarSeleccion"
                  type="button"
                  disabled={ocupado}
                  onClick={() => {
                    setModoSeleccion(false);
                    setSeleccionados([]);
                  }}
                  className="rounded-xl border border-gray-200 bg-white px-3 text-sm"
                >
                  Cancelar
                </button>
              )}
              <button
                id="eliminarPostulaciones"
                type="button"
                disabled={bloqueado || (modoSeleccion ? !seleccionados.length : !filtradas.length)}
                onClick={modoSeleccion ? eliminarSeleccionados : () => setModoSeleccion(true)}
                className="rounded-xl border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 disabled:opacity-40"
              >
                {ocupado
                  ? 'Procesando…'
                  : modoSeleccion
                    ? `Eliminar seleccionados (${seleccionados.length})`
                    : 'Eliminar'}
              </button>
            </div>
          </div>
          <div id="postulaciones" className="space-y-3">
            {!filtradas.length && !errorCarga && (
              <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center">
                <h2 className="font-semibold text-gray-800">
                  {deClase.length ? 'No hay coincidencias' : 'No hay postulaciones'}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  {deClase.length
                    ? 'Prueba con otro nombre, correo o estado.'
                    : 'Las solicitudes aparecerán aquí cuando se envíe el formulario de la clase.'}
                </p>
              </section>
            )}
            {filtradas.map((postulacion) => {
              const grupo = estadoGrupo(postulacion.estado);
              const [etiqueta, estilo] = estados[grupo];
              const clasePostulacion = clases.find(
                (item) => Number(item.id) === Number(postulacion.claseId),
              );
              return (
                <article
                  key={postulacion.id}
                  aria-label={`Postulación de ${postulacion.nombre}`}
                  className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="break-all font-mono text-xs text-gray-500">
                      SOL-{postulacion.id}
                    </p>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${estilo}`}>
                      {etiqueta}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    {modoSeleccion && (
                      <input
                        className="checkbox-postulacion mt-1 h-5 w-5 shrink-0"
                        type="checkbox"
                        disabled={bloqueado}
                        aria-label={`Seleccionar ${postulacion.nombre}`}
                        checked={seleccionados.includes(postulacion.id)}
                        onChange={(event) =>
                          setSeleccionados((previos) =>
                            event.target.checked
                              ? [...previos, postulacion.id]
                              : previos.filter((id) => id !== postulacion.id),
                          )
                        }
                      />
                    )}
                    <div>
                      <h2 className="break-words font-bold text-gray-900">{postulacion.nombre}</h2>
                      <p className="mt-1 break-all text-sm text-gray-600">{postulacion.correo}</p>
                      <p className="mt-1 text-sm text-gray-600">{postulacion.telefono}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {fechaTexto(postulacion.fechaPostulacion)}
                  </p>
                  <p className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">
                    {postulacion.nivel} · {postulacion.sede}
                  </p>
                  <details>
                    <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-gray-600">
                      Datos adicionales
                    </summary>
                    <dl className="space-y-2 text-sm text-gray-600">
                      <div>
                        <dt className="font-semibold">Fecha de nacimiento</dt>
                        <dd>{postulacion.fechaNacimiento || 'No registrada'}</dd>
                      </div>
                      {postulacion.nombreCompletoApoderado && (
                        <div>
                          <dt className="font-semibold">Apoderado</dt>
                          <dd className="break-words">{postulacion.nombreCompletoApoderado}</dd>
                          <dd className="break-all">{postulacion.correoApoderado}</dd>
                          <dd>{postulacion.telefonoApoderado}</dd>
                        </div>
                      )}
                    </dl>
                  </details>
                  {grupo === 'pendiente' && (
                    <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
                      <button
                        type="button"
                        disabled={bloqueado || Number(clasePostulacion?.cuposDisponibles ?? 0) <= 0}
                        onClick={() => cambiarEstado(postulacion, 'aceptado')}
                        className="rounded-xl bg-blue-600 px-2 py-2 text-sm font-semibold text-white disabled:opacity-40"
                      >
                        {ocupado ? 'Procesando…' : 'Aceptar'}
                      </button>
                      <button
                        type="button"
                        disabled={bloqueado}
                        onClick={() => cambiarEstado(postulacion, 'rechazado')}
                        className="rounded-xl border border-gray-200 px-2 py-2 text-sm font-semibold text-gray-600 disabled:opacity-40"
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}
      <div className="grid gap-2">
        <a
          href="/clases"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-blue-700"
        >
          Ver clases
        </a>
      </div>
    </main>
  );
}
