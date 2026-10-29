import { Calendar, ConfigProvider, List, Modal, theme as temaAnt } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTema } from '../../hooks/useTema.js';
import { apiFetch } from '../../lib/api.js';
import Mensaje from '../Mensaje.jsx';
import 'dayjs/locale/es';
import locale from 'antd/locale/es_ES';

dayjs.locale('es');

export default function Calendario() {
  const { oscuro } = useTema();
  const [aviso, setAviso] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [clases, setClases] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);

  useEffect(() => {
    const cargarClases = async () => {
      try {
        const respuesta = await apiFetch('/clases');

        if (!respuesta.ok) {
          throw new Error('No se pudieron obtener las clases');
        }

        const datos = await respuesta.json();

        const clasesConId = (Array.isArray(datos) ? datos : [datos]).map((clase, index) => ({
          ...clase,
          id: clase.id || Date.now() + index,
        }));

        setClases(clasesConId);
      } catch {
        setAviso({
          tipo: 'error',
          texto: 'No se pudieron cargar las clases. Comprueba tu conexión y recarga la página.',
        });
      } finally {
        setCargando(false);
      }
    };

    cargarClases();
  }, []);

  /*
   * Comprueba si una fecha se encuentra
   * dentro de la vigencia de una clase.
   *
   * Las clases antiguas que todavía no tienen
   * fecha de inicio y fin se consideran vigentes
   * para no romper los datos existentes.
   */
  const claseEstaVigente = (clase, fecha) => {
    if (!clase.fechaInicio || !clase.fechaFin) {
      return true;
    }

    const fechaInicio = dayjs(clase.fechaInicio);

    const fechaFin = dayjs(clase.fechaFin);

    return (
      (fecha.isSame(fechaInicio, 'day') || fecha.isAfter(fechaInicio, 'day')) &&
      (fecha.isSame(fechaFin, 'day') || fecha.isBefore(fechaFin, 'day'))
    );
  };

  /*
   * Genera las fechas de una clase solamente
   * dentro de su período de vigencia.
   */
  const generarFechas = (clase) => {
    const fechas = [];

    const hoy = dayjs().startOf('day');

    const fechaInicio = clase.fechaInicio ? dayjs(clase.fechaInicio).startOf('day') : hoy;

    const fechaFin = clase.fechaFin ? dayjs(clase.fechaFin).startOf('day') : hoy.add(28, 'day');

    /*
     * Si la clase ya terminó, no genera
     * ninguna fecha.
     */
    if (fechaFin.isBefore(hoy, 'day')) {
      return fechas;
    }

    /*
     * Si todavía no empieza, comenzamos
     * desde su fecha de inicio.
     *
     * Si ya empezó, mostramos solamente
     * las próximas fechas desde hoy.
     */
    const fechaInicial = fechaInicio.isAfter(hoy, 'day') ? fechaInicio : hoy;

    /*
     * Si la fecha inicial ya está después
     * de la fecha final, no hay fechas.
     */
    if (fechaInicial.isAfter(fechaFin, 'day')) {
      return fechas;
    }

    const diasSemana = {
      Domingo: 0,

      Lunes: 1,

      Martes: 2,

      Miércoles: 3,

      Jueves: 4,

      Viernes: 5,

      Sábado: 6,
    };

    const diasSeleccionados = Array.isArray(clase.frecuencia)
      ? clase.frecuencia.map((dia) => diasSemana[dia]).filter((dia) => dia !== undefined)
      : [];

    let fecha = fechaInicial;

    while (fecha.isBefore(fechaFin, 'day') || fecha.isSame(fechaFin, 'day')) {
      const diaSemana = fecha.day();

      if (diasSeleccionados.includes(diaSemana) && claseEstaVigente(clase, fecha)) {
        fechas.push({
          ...clase,

          fecha: fecha.format('YYYY-MM-DD'),
        });
      }

      fecha = fecha.add(1, 'day');
    }

    return fechas;
  };

  const clasesGeneradas = clases.flatMap((clase) => generarFechas(clase));

  const clasesPorFecha = clasesGeneradas.reduce((acc, clase) => {
    if (!acc[clase.fecha]) {
      acc[clase.fecha] = [];
    }

    acc[clase.fecha].push(clase);

    return acc;
  }, {});

  const obtenerClasesDelDia = (value) => {
    const key = value.format('YYYY-MM-DD');

    return clasesPorFecha[key] || [];
  };

  const cellRender = (value, info) => {
    if (info.type !== 'date') {
      return info.originNode;
    }

    const clasesDelDia = obtenerClasesDelDia(value);

    const hoy = dayjs();

    const esHoy = value.isSame(hoy, 'day');

    const esSeleccionado = fechaSeleccionada && value.isSame(fechaSeleccionada, 'day');

    return (
      <div
        className={
          'flex h-full min-h-13 flex-col items-center justify-center rounded-xl border border-gray-100 transition ' +
          (esSeleccionado
            ? 'border-blue-500 bg-blue-500 text-white'
            : esHoy
              ? 'border-blue-100 bg-blue-50'
              : 'border-gray-100')
        }
      >
        <span
          className={
            'text-sm font-medium ' +
            (esSeleccionado ? 'text-white' : esHoy ? 'text-blue-600' : 'text-gray-700')
          }
        >
          {value.format('DD')}
        </span>

        {clasesDelDia.length > 0 && (
          <div className="mt-1 flex items-center gap-1">
            <span
              className={
                'h-1.5 w-1.5 rounded-full ' + (esSeleccionado ? 'bg-white' : 'bg-green-500')
              }
            ></span>

            <span
              className={
                'text-xs font-semibold leading-none ' +
                (esSeleccionado ? 'text-white' : 'text-green-600')
              }
            >
              {clasesDelDia.length}
              <span className="sr-only">
                {clasesDelDia.length === 1 ? ' clase programada' : ' clases programadas'}
              </span>
            </span>
          </div>
        )}
      </div>
    );
  };

  const onSelect = (value) => {
    const clasesDelDia = obtenerClasesDelDia(value);

    setFechaSeleccionada(value);

    setClaseSeleccionada(null);

    if (clasesDelDia.length > 0) {
      setModalVisible(true);
    }
  };

  const seleccionarConvocatoria = () => {
    if (!claseSeleccionada) {
      return;
    }

    // La convocatoria abre desde la creación; fechaInicio solo marca el comienzo de las clases.
    const hoy = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
    if (
      !claseSeleccionada.fechaInicio ||
      !claseSeleccionada.fechaFin ||
      claseSeleccionada.fechaInicio > claseSeleccionada.fechaFin
    ) {
      setModalVisible(false);
      setAviso({
        tipo: 'error',
        texto: 'Completa las fechas de la clase antes de generar su convocatoria.',
      });
      return;
    }
    if (hoy > claseSeleccionada.fechaFin) {
      setModalVisible(false);
      setAviso({
        tipo: 'error',
        texto: 'Esta clase ya finalizó y no se puede generar una convocatoria.',
      });
      return;
    }

    localStorage.setItem('claseFormulario', JSON.stringify(claseSeleccionada));

    window.location.href = '/configurar-convocatoria';
  };

  return (
    <ConfigProvider
      locale={locale}
      theme={{ algorithm: oscuro ? temaAnt.darkAlgorithm : temaAnt.defaultAlgorithm }}
    >
      <div className="min-h-0 bg-[#f7f9fb] pb-6 text-gray-800">
        <main className="mx-auto max-w-full space-y-4 px-4 pt-4" aria-busy={cargando}>
          <Mensaje aviso={aviso} />
          {cargando && (
            <p role="status" className="text-sm text-gray-600">
              Cargando calendario…
            </p>
          )}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              PROGRAMACIÓN
            </p>

            <h2 className="mt-1 text-lg font-bold text-gray-900">Calendario de clases</h2>
          </div>

          <section className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
            <Calendar
              fullCellRender={cellRender}
              onSelect={onSelect}
              fullscreen={false}
              headerRender={({ value, onChange }) => {
                const mesAnterior = () => {
                  onChange(value.subtract(1, 'month'));
                };

                const mesSiguiente = () => {
                  onChange(value.add(1, 'month'));
                };

                return (
                  <div className="mb-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={mesAnterior}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100"
                    >
                      ←
                    </button>

                    <span className="text-xs font-bold capitalize text-gray-800">
                      {value.format('MMMM YYYY')}
                    </span>

                    <button
                      type="button"
                      onClick={mesSiguiente}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100"
                    >
                      →
                    </button>
                  </div>
                );
              }}
            />
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-400">CLASES PROGRAMADAS</p>

                <p className="mt-1 text-xs text-gray-600">Selecciona un día para ver sus clases.</p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-sm">
                ✓
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-400">ACCIONES</p>

            <button
              type="button"
              onClick={() => {
                window.location.href = '/clases';
              }}
              className="mt-3 h-9 w-full rounded-xl bg-blue-500 text-sm font-semibold text-white shadow-sm"
            >
              Ver clases
            </button>
          </section>
        </main>

        <Modal
          title={
            fechaSeleccionada ? 'Clases del ' + fechaSeleccionada.format('DD/MM/YYYY') : 'Clases'
          }
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <List
            dataSource={fechaSeleccionada ? obtenerClasesDelDia(fechaSeleccionada) : []}
            renderItem={(clase) => (
              <List.Item
                onClick={() => {
                  setClaseSeleccionada(clase);
                }}
                style={{
                  cursor: 'pointer',

                  backgroundColor:
                    claseSeleccionada?.id === clase.id ? 'var(--accent-soft)' : 'transparent',

                  borderRadius: '12px',

                  padding: '10px',
                }}
              >
                <List.Item.Meta
                  title={
                    <span className="font-semibold text-gray-900">Karate · {clase.nivel}</span>
                  }
                  description={
                    <span className="text-gray-700">
                      {clase.horaInicio +
                        ' - ' +
                        clase.horaFin +
                        ' · ' +
                        clase.sede +
                        ' · ' +
                        clase.profesor}
                    </span>
                  }
                />
              </List.Item>
            )}
          />

          {claseSeleccionada && (
            <button
              type="button"
              onClick={seleccionarConvocatoria}
              className="mt-4 h-10 w-full cursor-pointer rounded-xl bg-blue-500 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-600 hover:shadow-md"
            >
              Ver Convocatoria
            </button>
          )}
        </Modal>
      </div>
    </ConfigProvider>
  );
}
