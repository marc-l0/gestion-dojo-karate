export default function IndicadorCupos({ disponibles, total }) {
  const cantidad = Number(disponibles);
  const capacidad = Number(total);
  const capacidadValida = Number.isFinite(capacidad) && capacidad >= 0 && cantidad <= capacidad;
  const ocupados = capacidadValida ? Math.max(capacidad - Math.max(cantidad, 0), 0) : null;
  if (!Number.isFinite(cantidad))
    return (
      <p className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600">Cupos por confirmar</p>
    );
  const texto =
    cantidad <= 0
      ? 'Clase completa'
      : cantidad === 1
        ? 'Último cupo'
        : cantidad <= 2
          ? `Últimos ${cantidad} cupos`
          : capacidadValida
            ? `${cantidad} de ${capacidad} cupos disponibles`
            : `${cantidad} cupos disponibles`;
  const estilo =
    cantidad <= 0
      ? 'bg-red-50 text-red-800'
      : cantidad <= 2
        ? 'bg-amber-50 text-amber-900'
        : 'bg-blue-50 text-blue-800';
  return (
    <p className={`rounded-xl px-3 py-2 text-sm ${estilo}`}>
      <span className="block font-semibold">{texto}</span>
      {ocupados !== null && (
        <span className="mt-1 block text-xs">
          {ocupados} {ocupados === 1 ? 'cupo ocupado' : 'cupos ocupados'} · {capacidad} en total
        </span>
      )}
    </p>
  );
}
