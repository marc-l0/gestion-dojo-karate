import { useEffect, useId, useRef } from 'react';
import Mensaje from './Mensaje.jsx';

export default function ConfirmarAccion({
  titulo,
  children,
  ocupado,
  aviso,
  onCancelar,
  onConfirmar,
}) {
  const dialogo = useRef(null);
  const cancelar = useRef(null);
  const tituloId = useId();
  const descripcionId = useId();

  useEffect(() => {
    const elemento = dialogo.current;
    const anterior = document.activeElement;
    elemento.showModal();
    cancelar.current.focus();
    return () => {
      elemento.close();
      if (anterior instanceof HTMLElement && anterior.isConnected) anterior.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogo}
      aria-labelledby={tituloId}
      aria-describedby={descripcionId}
      aria-busy={ocupado}
      onCancel={(event) => {
        event.preventDefault();
        if (!ocupado) onCancelar();
      }}
      className="m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-sm overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 text-gray-800 shadow-xl backdrop:bg-black/60"
    >
      <h2 id={tituloId} className="text-lg font-bold text-gray-900">
        {titulo}
      </h2>
      <div id={descripcionId} className="mt-3 text-sm leading-6 text-gray-600">
        {children}
      </div>
      {aviso?.tipo === 'error' && (
        <div className="mt-4">
          <Mensaje aviso={aviso} />
        </div>
      )}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          ref={cancelar}
          type="button"
          disabled={ocupado}
          onClick={onCancelar}
          className="min-h-11 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={ocupado}
          onClick={onConfirmar}
          className="min-h-11 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {ocupado ? 'Eliminando…' : 'Eliminar clase'}
        </button>
      </div>
    </dialog>
  );
}
