import { useEffect, useState } from 'react';

export function useTema() {
  const [tema, setTema] = useState({ preferencia: 'automatico', oscuro: false, listo: false });
  useEffect(() => {
    const actualizar = () =>
      setTema({
        preferencia: window.dojoTema?.preferencia() ?? 'automatico',
        oscuro: document.documentElement.dataset.tema === 'oscuro',
        listo: true,
      });
    actualizar();
    window.addEventListener('dojo:tema', actualizar);
    return () => window.removeEventListener('dojo:tema', actualizar);
  }, []);
  return tema;
}
