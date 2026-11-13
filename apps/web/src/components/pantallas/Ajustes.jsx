import { useState } from 'react';
import { useTema } from '../../hooks/useTema.js';
import Mensaje from '../Mensaje.jsx';

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
        <h2 id="guia" className="scroll-mt-24 text-lg font-bold text-gray-900">
          Guía rápida
        </h2>
        <div className="mt-3 divide-y divide-gray-100 text-sm text-gray-600">
          <details className="py-2">
            <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-gray-800">
              Crear y consultar clases
            </summary>
            <p className="pb-3 leading-6">
              En Clases verás las vigentes. Usa Todas para ver las próximas y finalizadas. Pulsa
              Nueva clase para registrar horario, profesor, fechas y cupos. El menú de tres puntos
              permite editar o eliminar. El sistema avisa si el profesor tiene otra clase que
              coincide en fecha, día y hora.
            </p>
          </details>
          <details className="py-2">
            <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-gray-800">
              Administrar profesores
            </summary>
            <p className="pb-3 leading-6">
              En Profesores puedes registrar, activar, desactivar o eliminar. Desactivar permite
              conservar el registro para usarlo después; eliminar lo quita definitivamente de la
              lista. Las clases ya registradas conservan el nombre del profesor.
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
              terminar en un equipo compartido, entra a Usuario y pulsa Cerrar sesión.
            </p>
          </details>
        </div>
      </section>
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 id="documentos" className="scroll-mt-24 text-lg font-bold text-gray-900">
          Documentación y entrega
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Descarga las guías para operar el sistema, realizar copias de seguridad y revisar la
          entrega.
        </p>
        <div className="mt-3 divide-y divide-gray-100">
          {[
            [
              'guia-administrador',
              'Guía del administrador',
              'Clases, profesores, convocatorias y postulaciones.',
            ],
            [
              'respaldo-recuperacion',
              'Respaldo y recuperación',
              'Procedimiento manual y comprobaciones para recuperar los datos.',
            ],
            [
              'validacion-entrega',
              'Lista de pruebas para la entrega',
              'Para completar junto con el responsable del negocio.',
            ],
          ].map(([archivo, titulo, descripcion]) => (
            <a
              key={archivo}
              href={`/documentos/${archivo}.pdf`}
              download
              className="flex min-h-16 flex-col justify-center gap-1 py-3"
            >
              <span className="font-semibold text-blue-700">{titulo} · PDF</span>
              <span className="text-sm text-gray-500">{descripcion}</span>
            </a>
          ))}
        </div>
        <a
          href="/documentos/documentacion-entrega.zip"
          download
          className="mt-3 flex min-h-11 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-center text-sm font-semibold text-blue-700"
        >
          Descargar todos los documentos
        </a>
        <p className="mt-3 text-sm text-gray-500">
          Las copias son manuales y debe realizarlas el responsable asignado. La lista de entrega
          queda pendiente hasta que el cliente haga las pruebas y dé su conformidad.
        </p>
      </section>
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 id="acerca" className="scroll-mt-24 text-lg font-bold text-gray-900">
          Acerca del sistema
        </h2>
        <p className="mt-3 font-semibold text-gray-800">Mi Dojo</p>
        <p className="mt-1 text-sm text-gray-500">Versión {version}</p>
        <p className="mt-3 text-sm text-gray-600">
          Clases, profesores, convocatorias y postulaciones del dojo en un solo lugar.
        </p>
      </section>
    </main>
  );
}
