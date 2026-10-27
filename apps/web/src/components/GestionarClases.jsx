import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api.js';

export default function GestionarClases() {
  const [clases, setClases] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

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
  const [fechaFin, setFechaFin] = useState('');

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const ordenarDias = (dias) => {
    return diasSemana.filter((dia) => dias.includes(dia));
  };

  const obtenerFechaHoy = () => {
    const hoy = new Date();

    const año = hoy.getFullYear();

    const mes = String(hoy.getMonth() + 1).padStart(2, '0');

    const dia = String(hoy.getDate()).padStart(2, '0');

    return año + '-' + mes + '-' + dia;
  };

  const calcularFechaFin = (inicio, duracionSeleccionada) => {
    if (!inicio || !duracionSeleccionada) {
      return '';
    }

    const fecha = new Date(inicio + 'T00:00:00');

    if (duracionSeleccionada === '1 semana') {
      fecha.setDate(fecha.getDate() + 7);
    }

    if (duracionSeleccionada === '2 semanas') {
      fecha.setDate(fecha.getDate() + 14);
    }

    if (duracionSeleccionada === '3 semanas') {
      fecha.setDate(fecha.getDate() + 21);
    }

    if (duracionSeleccionada === '1 mes') {
      fecha.setMonth(fecha.getMonth() + 1);
    }

    const año = fecha.getFullYear();

    const mes = String(fecha.getMonth() + 1).padStart(2, '0');

    const dia = String(fecha.getDate()).padStart(2, '0');

    return año + '-' + mes + '-' + dia;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return 'Sin fecha';
    }

    const partes = fecha.split('-');

    if (partes.length !== 3) {
      return fecha;
    }

    return partes[2] + '/' + partes[1] + '/' + partes[0];
  };

  const obtenerEstadoClase = (clase) => {
    if (!clase.fechaInicio || !clase.fechaFin) {
      return {
        texto: 'Vigente',
        estilo: 'bg-green-50 text-green-600',
      };
    }

    const hoy = obtenerFechaHoy();

    if (hoy < clase.fechaInicio) {
      return {
        texto: 'Por iniciar',
        estilo: 'bg-yellow-50 text-yellow-600',
      };
    }

    if (hoy > clase.fechaFin) {
      return {
        texto: 'Finalizada',
        estilo: 'bg-gray-100 text-gray-500',
      };
    }

    return {
      texto: 'Vigente',
      estilo: 'bg-green-50 text-green-600',
    };
  };

  const cargarClases = async () => {
    try {
      const respuesta = await apiFetch('/clases');

      if (!respuesta.ok) {
        throw new Error('No se pudieron cargar las clases');
      }

      const datos = await respuesta.json();

      setClases(datos);
    } catch (error) {
      console.error('Error al cargar clases:', error);

      alert('No se pudieron cargar las clases');
    }
  };

  const cargarProfesores = async () => {
    try {
      const respuesta = await apiFetch('/profesores');

      if (!respuesta.ok) {
        throw new Error('No se pudieron cargar los profesores');
      }

      const datos = await respuesta.json();

      setProfesores(datos.filter((item) => item.estado === 'activo'));
    } catch (error) {
      console.error('Error al cargar profesores:', error);
    }
  };

  useEffect(() => {
    cargarClases();
    cargarProfesores();
  }, []);

  useEffect(() => {
    if (fechaInicio && duracion) {
      const nuevaFechaFin = calcularFechaFin(fechaInicio, duracion);

      setFechaFin(nuevaFechaFin);
    } else {
      setFechaFin('');
    }
  }, [fechaInicio, duracion]);

  const iniciarEdicion = (clase) => {
    setEditandoId(clase.id);

    setNivel(clase.nivel || '');

    setSede(clase.sede || '');

    setFrecuencia(Array.isArray(clase.frecuencia) ? ordenarDias(clase.frecuencia) : []);

    setHoraInicio(clase.horaInicio || '');

    setHoraFin(clase.horaFin || '');

    setProfesor(clase.profesor || '');

    setTarifa(clase.tarifa !== undefined && clase.tarifa !== null ? String(clase.tarifa) : '');

    setCupos(clase.cupos !== undefined && clase.cupos !== null ? String(clase.cupos) : '');

    setFechaInicio(clase.fechaInicio || '');

    setDuracion(clase.duracion || '');

    setFechaFin(clase.fechaFin || '');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);

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

    setFechaFin('');
  };

  const cambiarDia = (dia) => {
    if (frecuencia.includes(dia)) {
      setFrecuencia(frecuencia.filter((item) => item !== dia));
    } else {
      setFrecuencia(ordenarDias([...frecuencia, dia]));
    }
  };

  const aceptarEdicion = async () => {
    if (
      nivel === '' ||
      sede === '' ||
      frecuencia.length === 0 ||
      horaInicio === '' ||
      horaFin === '' ||
      profesor === '' ||
      tarifa === '' ||
      cupos === '' ||
      fechaInicio === '' ||
      duracion === ''
    ) {
      alert('Por favor rellene todos los campos');

      return;
    }

    try {
      const frecuenciaOrdenada = ordenarDias(frecuencia);

      const respuesta = await apiFetch('/clases/' + editandoId, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          nivel: nivel,

          sede: sede,

          frecuencia: frecuenciaOrdenada,

          horaInicio: horaInicio,

          horaFin: horaFin,

          profesor: profesor,

          tarifa: Number(tarifa),

          cupos: Number(cupos),

          fechaInicio: fechaInicio,

          duracion: duracion,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        alert(resultado.message || 'No se pudo actualizar la clase');

        return;
      }

      alert('Clase actualizada correctamente');

      cancelarEdicion();

      await cargarClases();
    } catch (error) {
      console.error('Error al actualizar clase:', error);

      alert('No se pudo actualizar la clase');
    }
  };

  const eliminarClase = async (id) => {
    const confirmar = confirm('¿Desea eliminar esta clase?');

    if (!confirmar) {
      return;
    }

    try {
      const respuesta = await apiFetch('/clases/' + id, {
        method: 'DELETE',
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        alert(resultado.message || 'No se pudo eliminar la clase');

        return;
      }

      alert('Clase eliminada correctamente');

      await cargarClases();
    } catch (error) {
      console.error('Error al eliminar clase:', error);

      alert('No se pudo eliminar la clase');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-gray-800">
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div>
          <p className="text-[9px] font-semibold text-gray-400">ADMINISTRACIÓN</p>

          <h1 className="text-sm font-bold text-gray-900">Clases</h1>
        </div>

        <button
          type="button"
          onClick={() => {
            window.location.href = '/';
          }}
          className="rounded-full border border-gray-200 px-3 py-1.5 text-[8px] font-semibold text-gray-500"
        >
          Volver
        </button>
      </header>

      <main className="space-y-4 px-4 pb-10 pt-4">
        {editandoId !== null && (
          <section className="relative z-10 rounded-2xl border-2 border-blue-100 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <p className="text-[9px] font-semibold text-blue-500">EDITANDO CLASE</p>

              <h2 className="mt-1 text-[13px] font-bold text-gray-900">
                Modificar datos de la clase
              </h2>

              <p className="mt-1 text-[8px] text-gray-400">
                Los cambios solo se guardarán al pulsar Aceptar.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[8px] font-semibold text-gray-500">NIVEL</label>

                <select
                  value={nivel}
                  onChange={(e) => setNivel(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-[9px] text-gray-700"
                >
                  <option value="">Seleccionar nivel</option>

                  <option value="Básico">Básico</option>

                  <option value="Intermedio">Intermedio</option>

                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>

              <div>
                <label className="text-[8px] font-semibold text-gray-500">SEDE</label>

                <select
                  value={sede}
                  onChange={(e) => setSede(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-[9px] text-gray-700"
                >
                  <option value="">Seleccionar sede</option>

                  <option value="Callao">Callao</option>

                  <option value="San Miguel">San Miguel</option>

                  <option value="Ventanilla">Ventanilla</option>
                </select>
              </div>

              <div>
                <label className="text-[8px] font-semibold text-gray-500">
                  VIGENCIA DE LA CLASE
                </label>

                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <p className="mb-1 text-[7px] text-gray-400">FECHA DE INICIO</p>

                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      min={obtenerFechaHoy()}
                      className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-[9px] text-gray-700"
                    />
                  </div>

                  <div>
                    <p className="mb-1 text-[7px] text-gray-400">DURACIÓN</p>

                    <select
                      value={duracion}
                      onChange={(e) => setDuracion(e.target.value)}
                      className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-[9px] text-gray-700"
                    >
                      <option value="">Seleccionar</option>

                      <option value="1 semana">1 semana</option>

                      <option value="2 semanas">2 semanas</option>

                      <option value="3 semanas">3 semanas</option>

                      <option value="1 mes">1 mes</option>
                    </select>
                  </div>
                </div>

                <div className="mt-2 rounded-xl bg-gray-50 px-3 py-2">
                  <p className="text-[7px] font-medium text-gray-400">FECHA DE FINALIZACIÓN</p>

                  <p className="mt-1 text-[9px] font-semibold text-gray-700">
                    {fechaFin ? formatearFecha(fechaFin) : 'Se calculará automáticamente'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[8px] font-semibold text-gray-500">FRECUENCIA</label>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  {diasSemana.map((dia) => (
                    <label
                      key={dia}
                      className="flex h-9 items-center gap-2 rounded-xl border border-gray-200 px-3"
                    >
                      <input
                        type="checkbox"
                        checked={frecuencia.includes(dia)}
                        onChange={() => cambiarDia(dia)}
                      />

                      <span className="text-[8px] font-medium text-gray-600">{dia}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[8px] font-semibold text-gray-500">HORA INICIO</label>

                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 px-3 text-[9px]"
                  />
                </div>

                <div>
                  <label className="text-[8px] font-semibold text-gray-500">HORA FIN</label>

                  <input
                    type="time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 px-3 text-[9px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[8px] font-semibold text-gray-500">PROFESOR</label>

                <select
                  value={profesor}
                  onChange={(e) => setProfesor(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-[9px] text-gray-700"
                >
                  <option value="">Seleccionar profesor</option>

                  {profesores.map((item) => (
                    <option key={item.id} value={item.nombre}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[8px] font-semibold text-gray-500">TARIFA</label>

                  <select
                    value={tarifa}
                    onChange={(e) => setTarifa(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-[9px] text-gray-700"
                  >
                    <option value="">Seleccionar tarifa</option>

                    <option value="150">S/ 150</option>

                    <option value="300">S/ 300</option>

                    <option value="450">S/ 450</option>
                  </select>
                </div>

                <div>
                  <label className="text-[8px] font-semibold text-gray-500">CUPOS</label>

                  <input
                    type="number"
                    min="1"
                    value={cupos}
                    onChange={(e) => setCupos(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 px-3 text-[9px]"
                  />
                </div>
              </div>

              <div className="relative z-20 mt-5 border-t border-gray-100 pt-4">
                <p className="mb-3 text-center text-[8px] font-medium text-gray-400">
                  CONFIRMAR CAMBIOS
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={aceptarEdicion}
                    className="h-9 rounded-xl border border-blue-200 bg-white text-[9px] font-semibold text-blue-500 hover:bg-blue-50"
                  >
                    Aceptar
                  </button>

                  <button
                    type="button"
                    onClick={cancelarEdicion}
                    className="h-9 rounded-xl border border-red-200 bg-white text-[9px] font-semibold text-red-500 hover:bg-red-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[11px] font-bold text-gray-900">Clases registradas</h2>

              <p className="mt-1 text-[8px] text-gray-400">
                Clases creadas actualmente en el sistema.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[8px] font-semibold text-blue-500">
              {clases.length} clases
            </span>
          </div>
        </section>

        {clases.length === 0 ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="text-[10px] font-semibold text-gray-500">No hay clases registradas.</p>

            <p className="mt-1 text-[8px] text-gray-400">
              Crea una clase desde la página principal.
            </p>
          </section>
        ) : (
          <div className="space-y-3">
            {clases.map((clase) => {
              const estado = obtenerEstadoClase(clase);

              return (
                <section
                  key={clase.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[9px] font-semibold text-gray-400">{clase.sede}</p>

                      <h2 className="mt-1 text-[12px] font-bold text-gray-900">
                        Karate · {clase.nivel}
                      </h2>
                    </div>

                    <span
                      className={
                        'rounded-full px-2.5 py-1 text-[8px] font-semibold ' + estado.estilo
                      }
                    >
                      {estado.texto}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[7px] font-medium text-gray-400">PROFESOR</p>

                      <p className="mt-1 text-[9px] font-semibold text-gray-700">
                        {clase.profesor}
                      </p>
                    </div>

                    <div>
                      <p className="text-[7px] font-medium text-gray-400">TARIFA</p>

                      <p className="mt-1 text-[9px] font-semibold text-gray-700">
                        S/ {clase.tarifa}
                      </p>
                    </div>

                    <div>
                      <p className="text-[7px] font-medium text-gray-400">DÍAS</p>

                      <p className="mt-1 text-[9px] font-semibold text-gray-700">
                        {Array.isArray(clase.frecuencia)
                          ? ordenarDias(clase.frecuencia).join(', ')
                          : clase.frecuencia}
                      </p>
                    </div>

                    <div>
                      <p className="text-[7px] font-medium text-gray-400">HORARIO</p>

                      <p className="mt-1 text-[9px] font-semibold text-gray-700">
                        {clase.horaInicio} - {clase.horaFin}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-gray-50 px-3 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[7px] font-medium text-gray-400">CUPOS DISPONIBLES</p>

                        <p className="mt-1 text-[10px] font-bold text-gray-800">
                          {clase.cuposDisponibles} de {clase.cupos}
                        </p>
                      </div>

                      <span className="text-[8px] text-gray-400">disponibles</span>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-gray-100 bg-white px-3 py-3">
                    <p className="text-[7px] font-medium text-gray-400">VIGENCIA</p>

                    {clase.fechaInicio && clase.fechaFin ? (
                      <div className="mt-1">
                        <p className="text-[9px] font-semibold text-gray-700">
                          {formatearFecha(clase.fechaInicio)} - {formatearFecha(clase.fechaFin)}
                        </p>

                        <p className="mt-1 text-[7px] text-gray-400">Duración: {clase.duracion}</p>
                      </div>
                    ) : (
                      <p className="mt-1 text-[8px] text-gray-400">
                        Esta clase pertenece a una versión anterior y no tiene vigencia registrada.
                      </p>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => iniciarEdicion(clase)}
                      className="h-9 rounded-xl border border-blue-200 bg-white text-[9px] font-semibold text-blue-500 hover:bg-blue-50"
                    >
                      Editar clase
                    </button>

                    <button
                      type="button"
                      onClick={() => eliminarClase(clase.id)}
                      className="h-9 rounded-xl border border-red-200 bg-white text-[9px] font-semibold text-red-500 hover:bg-red-50"
                    >
                      Eliminar clase
                    </button>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
