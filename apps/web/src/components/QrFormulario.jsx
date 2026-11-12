import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';

const ES_LOCAL = ['localhost', '127.0.0.1', '[::1]'];

export default function QrFormulario({
  url,
  nombreArchivo = 'qr-formulario',
  tamano = 128,
  colorQr = '#000000',
  claseContenedor = 'mt-4 flex justify-center',
  claseMarco = 'rounded-xl border border-gray-100 bg-white p-3 shadow-sm',
  claseBoton = '',
  textoBoton = '↓ Descargar QR',
}) {
  const marco = useRef(null);
  const archivo = useRef(null);
  const [imagen, setImagen] = useState(null);
  const [error, setError] = useState('');

  useEffect(
    () => () => {
      const actual = archivo.current;
      if (actual && actual.valor === url && actual.color === colorQr) {
        URL.revokeObjectURL(actual.src);
        archivo.current = null;
      }
    },
    [url, colorQr],
  );

  if (!url) {
    return null;
  }

  const descargar = () => {
    setError('');
    let enlace;
    try {
      const canvas = marco.current?.querySelector('canvas');
      if (!canvas) throw new Error('QR no disponible');

      if (archivo.current && (archivo.current.valor !== url || archivo.current.color !== colorQr)) {
        URL.revokeObjectURL(archivo.current.src);
        archivo.current = null;
      }
      if (!archivo.current) {
        // Preparar el PNG sin perder el gesto del usuario en navegadores móviles.
        const base64 = canvas.toDataURL('image/png').split(',')[1];
        const bytes = Uint8Array.from(atob(base64), (caracter) => caracter.charCodeAt(0));
        const src = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
        archivo.current = { src, valor: url, color: colorQr };
      }
      setImagen(archivo.current);
      enlace = document.createElement('a');
      enlace.download = `${nombreArchivo}.png`;
      enlace.href = archivo.current.src;
      enlace.hidden = true;
      document.body.append(enlace);
      enlace.click();
    } catch {
      setError('No se pudo preparar la descarga del QR. Intenta de nuevo.');
    } finally {
      enlace?.remove();
    }
  };

  const enLocalhost = typeof window !== 'undefined' && ES_LOCAL.includes(window.location.hostname);
  const imagenActual = imagen?.valor === url && imagen?.color === colorQr ? imagen : null;

  return (
    <>
      <div className={claseContenedor}>
        <div ref={marco} className={`qr-surface ${claseMarco}`}>
          <QRCodeCanvas
            value={url}
            size={512}
            level="M"
            marginSize={4}
            bgColor="#ffffff"
            fgColor={colorQr}
            style={{ width: tamano, height: tamano }}
          />
        </div>
      </div>

      {enLocalhost && (
        <p className="mt-2 text-center text-[9px] leading-4 text-amber-600">
          Estás en localhost: este QR solo abre el formulario en esta computadora. Publica el sitio
          para usarlo desde otros dispositivos.
        </p>
      )}

      <button type="button" onClick={descargar} className={claseBoton}>
        {textoBoton}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-center text-sm text-red-700">
          {error}
        </p>
      )}
      {imagenActual && (
        <details className="mt-3 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700">
          <summary className="flex min-h-11 cursor-pointer items-center font-semibold">
            ¿No se descargó? Guardar manualmente
          </summary>
          <p className="mt-2">
            En el celular, mantén presionada la imagen y elige la opción para guardarla. También
            puedes abrirla en otra pestaña.
          </p>
          <div className="qr-surface mx-auto mt-3 w-fit rounded-xl bg-white p-3">
            <img
              src={imagenActual.src}
              width="192"
              height="192"
              alt="Código QR del formulario, listo para guardar"
              className="max-w-full"
            />
          </div>
          <a
            href={imagenActual.src}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex min-h-11 items-center justify-center font-semibold text-blue-700"
          >
            Abrir imagen del QR
          </a>
        </details>
      )}
    </>
  );
}
