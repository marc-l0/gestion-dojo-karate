import { useEffect, useRef } from 'react';

export default function Mensaje({ aviso }) {
  const campo = useRef(null);
  useEffect(() => {
    if (aviso) campo.current?.scrollIntoView({ block: 'nearest' });
  }, [aviso]);
  if (!aviso) return null;
  const estilo =
    aviso.tipo === 'error'
      ? 'border-red-200 bg-red-50 text-red-800'
      : aviso.tipo === 'exito'
        ? 'border-green-200 bg-green-50 text-green-800'
        : 'border-amber-200 bg-amber-50 text-amber-900';
  return (
    <div
      ref={campo}
      role={aviso.tipo === 'error' ? 'alert' : 'status'}
      className={`rounded-xl border p-4 text-sm ${estilo}`}
    >
      {aviso.texto}
    </div>
  );
}
