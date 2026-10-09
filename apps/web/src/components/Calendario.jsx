import { Calendar, ConfigProvider, List, Modal } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api.js';
import 'dayjs/locale/es';
import locale from 'antd/locale/es_ES';

dayjs.locale('es');

export default function Calendario() {
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
      } catch (error) {
        console.error('Error al cargar las clases:', error);
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
   * Comprueba si la clase está vigente actualmente.
   */
  const claseEstaVigenteHoy = (clase) => {
    if (!clase.fechaInicio || !clase.fechaFin) {
      return true;
    }

    const hoy = dayjs();

    return claseEstaVigente(clase, hoy);
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
            'text-[11px] font-medium ' +
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
                'text-[8px] font-semibold leading-none ' +
                (esSeleccionado ? 'text-white' : 'text-green-600')
              }
            >
              {clasesDelDia.length === 1 ? '1 clase' : clasesDelDia.length + ' clases'}
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

    /*
     * Segunda comprobación de seguridad:
     * aunque la clase aparezca en el calendario,
     * comprobamos nuevamente su vigencia antes
     * de crear la convocatoria.
     */
    if (!claseEstaVigenteHoy(claseSeleccionada)) {
      const hoy = dayjs();

      const fechaInicio = claseSeleccionada.fechaInicio
        ? dayjs(claseSeleccionada.fechaInicio)
        : null;

      const fechaFin = claseSeleccionada.fechaFin ? dayjs(claseSeleccionada.fechaFin) : null;

      if (fechaInicio && hoy.isBefore(fechaInicio, 'day')) {
        window.alert('Esta clase todavía no está disponible para generar una convocatoria.');

        return;
      }

      if (fechaFin && hoy.isAfter(fechaFin, 'day')) {
        window.alert('Esta clase ya finalizó y no se puede generar una convocatoria.');

        return;
      }

      window.alert('Esta clase no está vigente actualmente.');

      return;
    }

    localStorage.setItem('claseFormulario', JSON.stringify(claseSeleccionada));

    window.location.href = '/configurar-convocatoria';
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] pb-20 text-gray-800">
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              window.location.href = '/';
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500"
          >
            ←
          </button>

          <h1 className="text-sm font-bold text-gray-900">Calendario</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="relative flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500"
          >
            ♧
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[7px] font-bold text-white">
              3
            </span>
          </button>

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
            AC
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 pt-4">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
            PROGRAMACIÓN
          </p>

          <h2 className="mt-1 text-lg font-bold text-gray-900">Calendario de clases</h2>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          <ConfigProvider locale={locale}>
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
          </ConfigProvider>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-gray-400">CLASES PROGRAMADAS</p>

              <p className="mt-1 text-xs text-gray-600">Selecciona un día para ver sus clases.</p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-sm">
              ✓
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-[9px] font-semibold text-gray-400">ACCIONES</p>

          <button
            type="button"
            onClick={() => {
              window.location.href = '/';
            }}
            className="mt-3 h-9 w-full rounded-xl bg-blue-500 text-[9px] font-semibold text-white shadow-sm"
          >
            Crear nueva clase
          </button>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 mx-auto flex h-14 max-w-md items-center justify-around border-t border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => {
            window.location.href = '/';
          }}
          className="flex flex-col items-center gap-1 text-blue-500"
        >
          <span className="text-sm">⌂</span>

          <span className="text-[7px]">Inicio</span>
        </button>

        <button type="button" className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-sm">♧</span>

          <span className="text-[7px]">Familias</span>
        </button>

        <button type="button" className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-sm">▤</span>

          <span className="text-[7px]">Sedes</span>
        </button>

        <button
          type="button"
          onClick={() => {
            window.location.href = '/postulaciones';
          }}
          className="flex flex-col items-center gap-1 text-gray-400"
        >
          <span className="text-sm">▱</span>

          <span className="text-[7px]">Atención</span>
        </button>

        <button type="button" className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-sm">⚙</span>

          <span className="text-[7px]">Ajustes</span>
        </button>
      </nav>

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

                backgroundColor: claseSeleccionada?.id === clase.id ? '#eff6ff' : 'transparent',

                borderRadius: '12px',

                padding: '10px',
              }}
            >
              <List.Item.Meta
                title={<span className="font-semibold">Karate · {clase.nivel}</span>}
                description={
                  clase.horaInicio +
                  ' - ' +
                  clase.horaFin +
                  ' · ' +
                  clase.sede +
                  ' · ' +
                  clase.profesor
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
  );
}
