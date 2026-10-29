import { useEffect, useState } from 'react';
import { useOperacion } from '../../hooks/useOperacion.js';
import { apiFetch, leerRespuesta } from '../../lib/api.js';
import Mensaje from '../Mensaje.jsx';

export default function NuevaClase() {
  const { ocupado, aviso, setAviso, ejecutar } = useOperacion();
  const [cargandoProfesores, setCargandoProfesores] = useState(true);
  const [nivel, setNivel] = useState('');
  const [sede, setSede] = useState('');
  const [frecuencia, setFrecuencia] = useState([]);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [profesor, setProfesor] = useState('');
  const [tarifa, setTarifa] = useState('');
  const [cupos, setCupos] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [duracion, setDuracion] = useState('');
  const [profesores, setProfesores] = useState([]);
  const [ultimaClase, setUltimaClase] = useState(null);

  const diasSemana = [
    ['Lunes', 'L'],
    ['Martes', 'M'],
    ['Miércoles', 'X'],
    ['Jueves', 'J'],
    ['Viernes', 'V'],
    ['Sábado', 'S'],
    ['Domingo', 'D'],
  ];

  const obtenerFechaHoy = () => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');

    return `${año}-${mes}-${dia}`;
  };

  const seleccionarDia = (dia) => {
    if (frecuencia.includes(dia)) {
      setFrecuencia(frecuencia.filter((item) => item !== dia));
    } else {
      setFrecuencia([...frecuencia, dia]);
    }
  };

  useEffect(() => {
    const cargarProfesores = async () => {
      try {
        const respuesta = await apiFetch('/profesores');

        if (!respuesta.ok) {
          throw new Error('No se pudieron cargar los profesores');
        }

        const datos = await respuesta.json();

        const profesoresActivos = datos.filter((item) => item.estado === 'activo');

        setProfesores(profesoresActivos);
      } catch {
        setAviso({
          tipo: 'error',
          texto: 'No se pudieron cargar los profesores. Comprueba tu conexión y recarga la página.',
        });
      } finally {
        setCargandoProfesores(false);
      }
    };

    cargarProfesores();
  }, []);

  const crearClase = async () => {
    if (
      !nivel ||
      !sede ||
      frecuencia.length === 0 ||
      !horaInicio ||
      !horaFin ||
      !profesor ||
      !tarifa ||
      !cupos ||
      !fechaInicio ||
      !duracion
    ) {
      setAviso({ tipo: 'error', texto: 'Completa todos los campos antes de guardar la clase.' });
      return;
    }

    if (horaFin <= horaInicio) {
      setAviso({ tipo: 'error', texto: 'La hora de fin debe ser posterior a la hora de inicio.' });
      return;
    }

    const nuevaClase = {
      nivel,
      sede,
      frecuencia,
      horaInicio,
      horaFin,
      profesor,
      tarifa: Number(tarifa),
      cupos: Number(cupos),
      fechaInicio,
      duracion,
    };

    await ejecutar(async () => {
      const respuesta = await apiFetch('/clases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaClase),
      });
      const resultado = await leerRespuesta(
        respuesta,
        'No se pudo crear la clase. Intenta de nuevo.',
      );

      setUltimaClase({
        ...nuevaClase,
        ...resultado,
      });

      setNivel('');
      setSede('');
      setFrecuencia([]);
      setHoraInicio('');
      setHoraFin('');
      setProfesor('');
      setTarifa('');
      setCupos('');
      setFechaInicio('');
      setDuracion('');
      return 'Clase creada correctamente.';
    });
  };

  const irA = (ruta) => {
    window.location.href = ruta;
  };

  return (
    <div className="min-h-0 bg-[#f7f9fb] text-gray-800">
      <main className="space-y-4 px-4 pb-6 pt-4" aria-busy={ocupado}>
        <Mensaje aviso={aviso} />
        {cargandoProfesores && (
          <p role="status" className="text-sm text-gray-600">
            Cargando profesores…
          </p>
        )}
        {/* ÚLTIMA CLASE CREADA */}

        {ultimaClase && (
          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-400">ÚLTIMA CLASE CREADA</p>

              <h2 className="mt-1 text-base font-bold text-gray-900">
                {`Karate · ${ultimaClase.nivel}`}
              </h2>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-gray-400">SEDE</p>

                  <p className="mt-1 text-sm font-semibold text-gray-700">{ultimaClase.sede}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400">PROFESOR</p>

                  <p className="mt-1 text-sm font-semibold text-gray-700">{ultimaClase.profesor}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400">DÍAS</p>

                  <p className="mt-1 text-sm font-semibold text-gray-700">
                    {ultimaClase.frecuencia.join(', ')}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400">HORARIO</p>

                  <p className="mt-1 text-sm font-semibold text-gray-700">
                    {ultimaClase.horaInicio} - {ultimaClase.horaFin}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400">TARIFA</p>

                  <p className="mt-1 text-sm font-semibold text-gray-700">
                    S/ {ultimaClase.tarifa}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400">CUPOS</p>

                  <p className="mt-1 text-sm font-semibold text-gray-700">{ultimaClase.cupos}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => irA('/')}
                className="h-9 w-full rounded-xl border border-blue-200 bg-white text-sm font-semibold text-blue-500 hover:bg-blue-50"
              >
                Gestionar clases
              </button>
            </div>
          </section>
        )}

        {/* FORMULARIO */}

        <fieldset
          disabled={ocupado}
          aria-label="Nueva clase"
          className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <h2 className="text-sm font-bold text-gray-900">Configurar nueva clase</h2>

          {/* VIGENCIA */}

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium tracking-wide text-gray-500">
              VIGENCIA DE LA CLASE
            </p>

            <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
              <div>
                <p className="mb-1 text-xs text-gray-400">FECHA DE INICIO</p>

                <input
                  type="date"
                  value={fechaInicio}
                  min={obtenerFechaHoy()}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="block h-9 w-full min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <p className="mb-1 text-xs text-gray-400">DURACIÓN</p>

                <select
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                  className="block h-9 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-blue-500"
                >
                  <option value="">Seleccionar</option>

                  <option value="1 semana">1 semana</option>

                  <option value="2 semanas">2 semanas</option>

                  <option value="3 semanas">3 semanas</option>

                  <option value="1 mes">1 mes</option>
                </select>
              </div>
            </div>

            <p className="mt-2 text-xs leading-4 text-gray-400">
              La fecha de finalización se calculará automáticamente.
            </p>
          </div>

          {/* SEDE */}

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium tracking-wide text-gray-500">SEDE</p>

            <div className="grid grid-cols-3 gap-2">
              {['Callao', 'San Miguel', 'Ventanilla'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSede(item)}
                  className={
                    'h-8 rounded-full border text-xs transition ' +
                    (sede === item
                      ? 'border-blue-500 bg-blue-50 font-semibold text-blue-600'
                      : 'border-gray-200 bg-white text-gray-500')
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* NIVEL */}

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium tracking-wide text-gray-500">NIVEL</p>

            <div className="grid grid-cols-3 gap-2">
              {['Básico', 'Intermedio', 'Avanzado'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setNivel(item)}
                  className={
                    'h-8 rounded-full border text-xs transition ' +
                    (nivel === item
                      ? 'border-blue-500 bg-blue-50 font-semibold text-blue-600'
                      : 'border-gray-200 bg-white text-gray-500')
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* HORARIO */}

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium tracking-wide text-gray-500">HORARIO</p>

            <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
              <div>
                <p className="mb-1 text-xs text-gray-400">HORA DE INICIO</p>

                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="block h-9 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <p className="mb-1 text-xs text-gray-400">HORA DE FIN</p>

                <input
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  className="block h-9 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* DÍAS */}

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium tracking-wide text-gray-500">
              DÍAS DE ENTRENAMIENTO
            </p>

            <div className="grid grid-cols-7 gap-1.5">
              {diasSemana.map(([dia, abreviatura]) => (
                <button
                  key={dia}
                  type="button"
                  title={dia}
                  onClick={() => seleccionarDia(dia)}
                  className={
                    'h-8 rounded-full border text-xs font-semibold transition ' +
                    (frecuencia.includes(dia)
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 bg-white text-gray-400')
                  }
                >
                  {abreviatura}
                </button>
              ))}
            </div>

            {frecuencia.length > 0 && (
              <p className="mt-2 text-xs text-gray-400">Seleccionados: {frecuencia.join(', ')}</p>
            )}
          </div>

          {/* PROFESOR */}

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium tracking-wide text-gray-500">PROFESOR</p>

            <select
              value={profesor}
              onChange={(e) => setProfesor(e.target.value)}
              className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none"
            >
              <option value="">Seleccionar profesor</option>

              {profesores.map((item) => (
                <option key={item.id} value={item.nombre}>
                  {item.nombre}
                </option>
              ))}
            </select>

            {profesores.length === 0 && (
              <p className="mt-2 text-xs text-gray-400">No hay profesores activos disponibles.</p>
            )}
          </div>

          {/* TARIFA */}

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium tracking-wide text-gray-500">TARIFA MENSUAL</p>

            <div className="grid grid-cols-3 gap-2">
              {['150', '300', '450'].map((precio) => (
                <button
                  key={precio}
                  type="button"
                  onClick={() => setTarifa(precio)}
                  className={
                    'h-8 rounded-full border text-sm font-semibold ' +
                    (tarifa === precio
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 text-gray-500')
                  }
                >
                  S/ {precio}
                </button>
              ))}
            </div>
          </div>

          {/* CUPOS */}

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium tracking-wide text-gray-500">
              CUPOS DISPONIBLES
            </p>

            <input
              type="number"
              min="1"
              value={cupos}
              onChange={(e) => setCupos(e.target.value)}
              placeholder="Ej. 10"
              className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-blue-500"
            />
          </div>

          {/* ACCIONES */}

          <button
            type="button"
            onClick={crearClase}
            disabled={ocupado || cargandoProfesores}
            className="mt-5 h-9 w-full rounded-xl bg-blue-500 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
          >
            {ocupado ? 'Guardando…' : 'Guardar clase'}
          </button>

          <button
            type="button"
            onClick={() => irA('/calendario')}
            className="mt-2 h-9 w-full rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Ver calendario
          </button>
        </fieldset>
      </main>
    </div>
  );
}
