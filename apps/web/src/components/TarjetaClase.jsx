import IndicadorCupos from './IndicadorCupos.jsx';
export default function TarjetaClase({
  clase,
  estado,
  dias,
  formatearFecha,
  onEditar,
  onEliminar,
  ocupado = false,
}) {
  const tituloId = `clase-${clase.id}`;
  const cerrarOpciones = (event) => {
    event.currentTarget.closest('details').open = false;
  };

  return (
    <article
      aria-labelledby={tituloId}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="break-words text-xs font-semibold text-gray-500">Sede {clase.sede}</p>
          <h2 id={tituloId} className="mt-1 break-words text-base font-bold text-gray-900">
            Karate · {clase.nivel}
          </h2>
        </div>
        <span
          className={`mt-1 shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${estado.estilo}`}
        >
          {estado.texto}
        </span>
        <details
          className="class-card__menu"
          name="opciones-clase"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              event.currentTarget.open = false;
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.currentTarget.open = false;
              event.currentTarget.querySelector('summary').focus();
            }
          }}
        >
          <summary
            className="class-card__menu-toggle"
            aria-label={`Más opciones de Karate ${clase.nivel}, sede ${clase.sede}`}
            title="Más opciones"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="12" r="1.7" />
              <circle cx="12" cy="12" r="1.7" />
              <circle cx="19" cy="12" r="1.7" />
            </svg>
          </summary>
          <div className="class-card__menu-panel">
            <button
              type="button"
              disabled={ocupado}
              onClick={(event) => {
                cerrarOpciones(event);
                onEditar(clase);
              }}
              className="w-full rounded-lg px-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Editar clase
            </button>
            <button
              type="button"
              disabled={ocupado}
              onClick={(event) => {
                cerrarOpciones(event);
                event.currentTarget.closest('details').querySelector('summary').focus();
                onEliminar(clase.id);
              }}
              className="w-full rounded-lg px-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Eliminar clase
            </button>
          </div>
        </details>
      </div>

      <div className="mt-3 space-y-1 text-sm text-gray-600">
        <p className="break-words">{dias || 'Días por confirmar'}</p>
        <p className="font-medium text-gray-800">
          {clase.horaInicio} – {clase.horaFin}
        </p>
      </div>
      <div className="mt-3">
        <IndicadorCupos disponibles={clase.cuposDisponibles} total={clase.cupos} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <a
          href={`/postulaciones?clase=${encodeURIComponent(clase.id)}`}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-2 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
        >
          Ver postulaciones
        </a>
        <a
          href={`/compartir-convocatoria?clase=${encodeURIComponent(clase.id)}`}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-200 px-2 py-2 text-center text-sm font-semibold text-blue-700 hover:bg-blue-50"
        >
          Compartir QR
        </a>
      </div>

      <details className="class-card__details mt-3 border-t border-gray-100 pt-1">
        <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 text-sm font-medium text-gray-600">
          Ver detalles
          <svg
            className="class-card__chevron"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>
        <dl className="grid grid-cols-2 gap-3 pb-2 text-sm">
          <div>
            <dt className="text-xs text-gray-500">Profesor</dt>
            <dd className="mt-1 break-words font-medium text-gray-800">{clase.profesor}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Tarifa mensual</dt>
            <dd className="mt-1 font-medium text-gray-800">S/ {clase.tarifa}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs text-gray-500">Vigencia</dt>
            <dd className="mt-1 font-medium text-gray-800">
              {clase.fechaInicio && clase.fechaFin
                ? `${formatearFecha(clase.fechaInicio)} al ${formatearFecha(clase.fechaFin)}`
                : 'Sin fechas registradas'}
            </dd>
          </div>
          {clase.duracion && (
            <div className="col-span-2">
              <dt className="text-xs text-gray-500">Duración</dt>
              <dd className="mt-1 font-medium text-gray-800">{clase.duracion}</dd>
            </div>
          )}
        </dl>
      </details>
    </article>
  );
}
