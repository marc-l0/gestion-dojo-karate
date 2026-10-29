import { useRef, useState } from 'react';

/** Bloquea solicitudes simultáneas incluso antes del siguiente render. */
export function useOperacion() {
  const bloqueo = useRef(false);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState(null);
  async function ejecutar(accion) {
    if (bloqueo.current) return false;
    bloqueo.current = true;
    setOcupado(true);
    setAviso(null);
    try {
      const texto = await accion();
      if (texto) setAviso({ tipo: 'exito', texto });
      return true;
    } catch (error) {
      setAviso({
        tipo: 'error',
        texto:
          error instanceof TypeError
            ? 'No se pudo conectar con el servidor. Comprueba tu conexión e intenta de nuevo.'
            : error.message || 'No se pudo completar la operación.',
      });
      return false;
    } finally {
      bloqueo.current = false;
      setOcupado(false);
    }
  }
  return { ocupado, aviso, setAviso, ejecutar };
}
