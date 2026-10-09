import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api.js';

export default function CrearClase() {
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
        const respuesta = await fetch('http://127.0.0.1:3000/profesores');

        if (!respuesta.ok) {
          throw new Error('No se pudieron cargar los profesores');
        }

        const datos = await respuesta.json();

        const profesoresActivos = datos.filter((item) => item.estado === 'activo');

        setProfesores(profesoresActivos);
      } catch (error) {
        console.error('Error al cargar profesores:', error);
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
      alert('Por favor rellene todos los campos');
      return;
    }

    if (horaFin <= horaInicio) {
      alert('La hora de fin debe ser posterior a la hora de inicio');
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

    try {
      const respuesta = await fetch('http://127.0.0.1:3000/clases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaClase),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        alert(resultado.message || 'No se pudo crear la clase');
        return;
      }

      setUltimaClase({
        ...nuevaClase,
        ...resultado,
      });

      alert('Clase creada correctamente');

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
    } catch (error) {
      console.error('Error al crear la clase:', error);

      alert('No se pudo crear la clase');
    }
  };

  const irA = (ruta) => {
    window.location.href = ruta;
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-gray-800">
      {/* ENCABEZADO */}

      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div>
          <p className="text-[9px] font-semibold text-gray-400">DOJO</p>

          <h1 className="text-sm font-bold text-gray-900">Crear clase</h1>
        </div>
      </header>

      <main className="space-y-4 px-4 pb-24 pt-4">
        {/* ÚLTIMA CLASE CREADA */}

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3">
            <p className="text-[9px] font-semibold text-gray-400">ÚLTIMA CLASE CREADA</p>

            <h2 className="mt-1 text-[12px] font-bold text-gray-900">
              {ultimaClase ? `Karate · ${ultimaClase.nivel}` : 'Todavía no hay una clase creada'}
            </h2>
          </div>

          {ultimaClase ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[7px] font-medium text-gray-400">SEDE</p>

                  <p className="mt-1 text-[9px] font-semibold text-gray-700">{ultimaClase.sede}</p>
                </div>

                <div>
                  <p className="text-[7px] font-medium text-gray-400">PROFESOR</p>

                  <p className="mt-1 text-[9px] font-semibold text-gray-700">
                    {ultimaClase.profesor}
                  </p>
                </div>

                <div>
                  <p className="text-[7px] font-medium text-gray-400">DÍAS</p>

                  <p className="mt-1 text-[9px] font-semibold text-gray-700">
                    {ultimaClase.frecuencia.join(', ')}
                  </p>
                </div>

                <div>
                  <p className="text-[7px] font-medium text-gray-400">HORARIO</p>

                  <p className="mt-1 text-[9px] font-semibold text-gray-700">
                    {ultimaClase.horaInicio} - {ultimaClase.horaFin}
                  </p>
                </div>

                <div>
                  <p className="text-[7px] font-medium text-gray-400">TARIFA</p>

                  <p className="mt-1 text-[9px] font-semibold text-gray-700">
                    S/ {ultimaClase.tarifa}
                  </p>
                </div>

                <div>
                  <p className="text-[7px] font-medium text-gray-400">CUPOS</p>

                  <p className="mt-1 text-[9px] font-semibold text-gray-700">{ultimaClase.cupos}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => irA('/clases')}
                className="h-9 w-full rounded-xl border border-blue-200 bg-white text-[9px] font-semibold text-blue-500 hover:bg-blue-50"
              >
                Gestionar clases
              </button>
            </div>
          ) : (
            <p className="text-[8px] text-gray-400">
              La información de la última clase creada aparecerá aquí.
            </p>
          )}
        </section>

        {/* FORMULARIO */}

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-[11px] font-bold text-gray-900">Configurar nueva clase</h2>

          {/* VIGENCIA */}

          <div className="mt-4">
            <p className="mb-2 text-[8px] font-medium tracking-wide text-gray-500">
              VIGENCIA DE LA CLASE
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="mb-1 text-[7px] text-gray-400">FECHA DE INICIO</p>

                <input
                  type="date"
                  value={fechaInicio}
                  min={obtenerFechaHoy()}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="block h-9 w-full min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-3 text-[9px] text-gray-700 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <p className="mb-1 text-[7px] text-gray-400">DURACIÓN</p>

                <select
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                  className="block h-9 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-[9px] text-gray-700 outline-none focus:border-blue-500"
                >
                  <option value="">Seleccionar</option>

                  <option value="1 semana">1 semana</option>

                  <option value="2 semanas">2 semanas</option>

                  <option value="3 semanas">3 semanas</option>

                  <option value="1 mes">1 mes</option>
                </select>
              </div>
            </div>

            <p className="mt-2 text-[7px] leading-4 text-gray-400">
              La fecha de finalización se calculará automáticamente.
            </p>
          </div>

          {/* SEDE */}

          <div className="mt-4">
            <p className="mb-2 text-[8px] font-medium tracking-wide text-gray-500">SEDE</p>

            <div className="grid grid-cols-3 gap-2">
              {['Callao', 'San Miguel', 'Ventanilla'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSede(item)}
                  className={
                    'h-8 rounded-full border text-[8px] transition ' +
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
            <p className="mb-2 text-[8px] font-medium tracking-wide text-gray-500">NIVEL</p>

            <div className="grid grid-cols-3 gap-2">
              {['Básico', 'Intermedio', 'Avanzado'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setNivel(item)}
                  className={
                    'h-8 rounded-full border text-[8px] transition ' +
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
            <p className="mb-2 text-[8px] font-medium tracking-wide text-gray-500">HORARIO</p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="mb-1 text-[7px] text-gray-400">HORA DE INICIO</p>

                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="block h-9 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-[9px] text-gray-700 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <p className="mb-1 text-[7px] text-gray-400">HORA DE FIN</p>

                <input
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  className="block h-9 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-[9px] text-gray-700 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* DÍAS */}

          <div className="mt-4">
            <p className="mb-2 text-[8px] font-medium tracking-wide text-gray-500">
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
                    'h-8 rounded-full border text-[8px] font-semibold transition ' +
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
              <p className="mt-2 text-[7px] text-gray-400">
                Seleccionados: {frecuencia.join(', ')}
              </p>
            )}
          </div>

          {/* PROFESOR */}

          <div className="mt-4">
            <p className="mb-2 text-[8px] font-medium tracking-wide text-gray-500">PROFESOR</p>

            <select
              value={profesor}
              onChange={(e) => setProfesor(e.target.value)}
              className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-[9px] text-gray-700 outline-none"
            >
              <option value="">Seleccionar profesor</option>

              {profesores.map((item) => (
                <option key={item.id} value={item.nombre}>
                  {item.nombre}
                </option>
              ))}
            </select>

            {profesores.length === 0 && (
              <p className="mt-2 text-[7px] text-gray-400">
                No hay profesores activos disponibles.
              </p>
            )}
          </div>

          {/* TARIFA */}

          <div className="mt-4">
            <p className="mb-2 text-[8px] font-medium tracking-wide text-gray-500">
              TARIFA MENSUAL
            </p>

            <div className="grid grid-cols-3 gap-2">
              {['150', '300', '450'].map((precio) => (
                <button
                  key={precio}
                  type="button"
                  onClick={() => setTarifa(precio)}
                  className={
                    'h-8 rounded-full border text-[9px] font-semibold ' +
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
            <p className="mb-2 text-[8px] font-medium tracking-wide text-gray-500">
              CUPOS DISPONIBLES
            </p>

            <input
              type="number"
              min="1"
              value={cupos}
              onChange={(e) => setCupos(e.target.value)}
              placeholder="Ej. 10"
              className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-[9px] text-gray-700 outline-none focus:border-blue-500"
            />
          </div>

          {/* ACCIONES */}

          <button
            type="button"
            onClick={crearClase}
            className="mt-5 h-9 w-full rounded-xl bg-blue-500 text-[9px] font-semibold text-white shadow-sm transition hover:bg-blue-600"
          >
            Aceptar y publicar ciclo
          </button>

          <button
            type="button"
            onClick={() => irA('/calendario')}
            className="mt-2 h-9 w-full rounded-xl border border-gray-200 bg-white text-[9px] font-semibold text-gray-600 hover:bg-gray-50"
          >
            Ver calendario
          </button>
        </section>
      </main>

      {/* NAVEGACIÓN DEL DOJO */}

      <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex h-14 max-w-82.5 items-center justify-around border-t border-gray-200 bg-white">
        {/* INICIO */}

        <button
          type="button"
          onClick={() => irA('/')}
          className="flex flex-col items-center gap-1 text-blue-500"
        >
          <span className="text-base">🏠</span>

          <span className="text-[7px]">Inicio</span>
        </button>

        {/* ALUMNOS */}

        <button
          type="button"
          onClick={() => irA('/postulaciones')}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-500"
        >
          <span className="text-base">🥋</span>

          <span className="text-[7px]">Postulaciones</span>
        </button>

        {/* CLASES */}

        <button
          type="button"
          onClick={() => irA('/clases')}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-500"
        >
          <span className="text-base">📅</span>

          <span className="text-[7px]">Clases</span>
        </button>

        {/* PROFESORES */}

        <button
          type="button"
          onClick={() => irA('/profesores')}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-500"
        >
          <span className="text-base">👨‍🏫</span>

          <span className="text-[7px]">Profesores</span>
        </button>

        {/* AJUSTES */}

        <button
          type="button"
          onClick={() => irA('/configurar-convocatoria')}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-500"
        >
          <span className="text-base">⚙️</span>

          <span className="text-[7px]">Ajustes</span>
        </button>
      </nav>
    </div>
  );
}
