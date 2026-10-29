import { useState } from 'react';
import { useTema } from '../hooks/useTema.js';
import Mensaje from './Mensaje.jsx';

const opciones = [
  { valor: 'claro', nombre: 'Claro', descripcion: 'Fondos claros y texto oscuro.' },
  { valor: 'oscuro', nombre: 'Oscuro', descripcion: 'Fondos oscuros para ambientes con poca luz.' },
  {
    valor: 'automatico',
    nombre: 'Automático',
    descripcion: 'Sigue el tema de tu celular o computadora.',
  },
];
export default function Ajustes({ version }) {
  const { preferencia, listo } = useTema();
  const [aviso, setAviso] = useState(null);
  function cambiar(valor) {
    const guardado = window.dojoTema.cambiar(valor);
    setAviso({
      tipo: guardado ? 'exito' : 'aviso',
      texto: guardado
        ? 'Preferencia de tema guardada en este navegador.'
        : 'Tema aplicado. El navegador no permite guardar la preferencia; se perderá al salir de esta página.',
    });
  }
  return (
    <main className="space-y-4 px-4 pb-6 pt-4" aria-busy={!listo}>
      <Mensaje aviso={aviso} />
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Apariencia</h2>
        <p className="mt-2 text-sm text-gray-500">
          Elige cómo quieres ver la app. Esta preferencia se guarda en este navegador.
        </p>
        <fieldset disabled={!listo} className="mt-4 space-y-3">
          <legend className="sr-only">Tema de la aplicación</legend>
          {opciones.map((opcion) => (
            <label
              key={opcion.valor}
              className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border p-3 ${preferencia === opcion.valor ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}
            >
              <input
                type="radio"
                name="tema"
                value={opcion.valor}
                checked={preferencia === opcion.valor}
                onChange={() => cambiar(opcion.valor)}
                className="h-5 w-5 shrink-0 accent-blue-600"
              />
              <span>
                <span className="block font-semibold text-gray-900">{opcion.nombre}</span>
                <span className="mt-1 block text-sm text-gray-500">{opcion.descripcion}</span>
              </span>
            </label>
          ))}
        </fieldset>
      </section>
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Guía rápida</h2>
        <div className="mt-3 divide-y divide-gray-100 text-sm text-gray-600">
          <details className="py-2">
            <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-gray-800">
              Crear y consultar clases
            </summary>
            <p className="pb-3 leading-6">
              En Clases verás las vigentes. Usa Todas para ver las próximas y finalizadas. Pulsa
              Nueva clase para registrar horario, profesor, fechas y cupos. El menú de tres puntos
              permite editar o eliminar.
            </p>
          </details>
          <details className="py-2">
            <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-gray-800">
              Compartir una convocatoria
            </summary>
            <p className="pb-3 leading-6">
              En la tarjeta de la clase, pulsa Compartir QR. Puedes copiar el enlace, enviarlo por
              WhatsApp o descargar el QR. La convocatoria puede compartirse antes de que empiece la
              clase.
            </p>
          </details>
          <details className="py-2">
            <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-gray-800">
              Revisar postulaciones y cupos
            </summary>
            <p className="pb-3 leading-6">
              Pulsa Ver postulaciones en la clase. Busca por nombre, correo o número de solicitud y
              filtra por estado. Las pendientes no reservan vacante: al aceptar una, se actualizan
              los cupos. No se pueden aceptar más personas si la clase está completa.
            </p>
          </details>
          <details className="py-2">
            <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-gray-800">
              Conexión y cierre de sesión
            </summary>
            <p className="pb-3 leading-6">
              Necesitas conexión con el servidor e internet para guardar y consultar los datos. Al
              terminar en un equipo compartido, usa el botón de cerrar sesión de la parte superior.
            </p>
          </details>
        </div>
      </section>
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Acerca del sistema</h2>
        <p className="mt-3 font-semibold text-gray-800">Gestión Dojo Karate</p>
        <p className="mt-1 text-sm text-gray-500">Versión {version}</p>
        <p className="mt-3 text-sm text-gray-600">
          Clases, profesores, convocatorias y postulaciones del dojo en un solo lugar.
        </p>
      </section>
    </main>
  );
}
