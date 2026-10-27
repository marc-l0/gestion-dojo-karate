import { QRCodeCanvas } from 'qrcode.react';
import { useRef } from 'react';

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

  if (!url) {
    return null;
  }

  const descargar = () => {
    const canvas = marco.current?.querySelector('canvas');
    if (!canvas) return;

    const enlace = document.createElement('a');
    enlace.download = `${nombreArchivo}.png`;
    enlace.href = canvas.toDataURL('image/png');
    enlace.click();
  };

  const enLocalhost = ES_LOCAL.includes(window.location.hostname);

  return (
    <>
      <div className={claseContenedor}>
        <div ref={marco} className={claseMarco}>
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
    </>
  );
}
