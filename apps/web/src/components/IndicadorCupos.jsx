export default function IndicadorCupos({ disponibles, total }) {
  const cantidad = Number(disponibles);
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
          : `${cantidad} de ${total} cupos disponibles`;
  const estilo =
    cantidad <= 0
      ? 'bg-red-50 text-red-800'
      : cantidad <= 2
        ? 'bg-amber-50 text-amber-900'
        : 'bg-blue-50 text-blue-800';
  return <p className={`rounded-xl px-3 py-2 text-sm font-semibold ${estilo}`}>{texto}</p>;
}
