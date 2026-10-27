import { useEffect, useId, useRef, useState } from 'react';

export default function CopiarEnlace({ enlace }) {
  const id = useId();
  const campo = useRef(null);
  const temporizador = useRef(null);
  const copiando = useRef(false);
  const [estado, setEstado] = useState('');

  useEffect(() => () => clearTimeout(temporizador.current), []);

  const seleccionar = () => {
    campo.current.focus({ preventScroll: true });
    campo.current.select();
    campo.current.setSelectionRange(0, enlace.length);
  };

  async function copiar() {
    if (!enlace || copiando.current) return;
    copiando.current = true;
    clearTimeout(temporizador.current);
    setEstado('');
    const focoAnterior = document.activeElement;
    try {
      let copiado = false;
      if (window.isSecureContext && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(enlace);
          copiado = true;
        } catch {
          // Si el navegador niega el permiso, intenta la copia desde el campo seleccionado.
        }
      }
      if (!copiado) {
        // Compatibilidad con HTTP en la red local, donde Clipboard API no está disponible.
        // Se ejecuta durante el gesto del usuario y usa un campo visible, también en iOS.
        seleccionar();
        if (!document.execCommand?.('copy')) throw new Error('Copia no disponible');
      }
      focoAnterior?.focus({ preventScroll: true });
      setEstado('copiado');
      temporizador.current = setTimeout(() => setEstado(''), 2500);
    } catch {
      seleccionar();
      setEstado('error');
    } finally {
      copiando.current = false;
    }
  }

  return (
    <div className="mt-4">
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-gray-700">
        Enlace del formulario
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2">
        <input
          ref={campo}
          id={id}
          type="text"
          readOnly
          value={enlace}
          onFocus={(event) => event.currentTarget.select()}
          aria-describedby={estado === 'error' ? `${id}-error` : undefined}
          className="min-w-0 flex-1 rounded-lg bg-transparent px-2 text-base text-gray-600"
        />
        <button
          type="button"
          onClick={copiar}
          disabled={!enlace}
          className="min-h-11 shrink-0 rounded-lg bg-white px-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:opacity-50"
        >
          {estado === 'copiado' ? '¡Copiado!' : 'Copiar'}
        </button>
      </div>
      <p role="status" className="sr-only">
        {estado === 'copiado' ? 'Enlace copiado al portapapeles.' : ''}
      </p>
      {estado === 'error' && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-amber-800">
          No se pudo copiar automáticamente. Mantén presionado el enlace y elige Copiar, o
          selecciónalo y cópialo manualmente.
        </p>
      )}
    </div>
  );
}
