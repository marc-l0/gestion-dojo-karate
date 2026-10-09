import { Injectable, NotFoundException } from '@nestjs/common';
import { CrearClaseDto } from './dto/crear-clase.dto.js';
import { ClasesRepository } from './repositories/clases.repository.js';
import { PostulacionesRepository } from './repositories/postulaciones.repository.js';

@Injectable()
export class ClasesService {
  constructor(
    private readonly clasesRepository: ClasesRepository,

    private readonly postulacionesRepository: PostulacionesRepository,
  ) {}

  private calcularFechaFin(fechaInicio: string, duracion: string) {
    const fecha = new Date(fechaInicio + 'T00:00:00');

    if (duracion === '1 semana') {
      fecha.setDate(fecha.getDate() + 7);
    }

    if (duracion === '2 semanas') {
      fecha.setDate(fecha.getDate() + 14);
    }

    if (duracion === '3 semanas') {
      fecha.setDate(fecha.getDate() + 21);
    }

    if (duracion === '1 mes') {
      fecha.setMonth(fecha.getMonth() + 1);
    }

    const año = fecha.getFullYear();

    const mes = String(fecha.getMonth() + 1).padStart(2, '0');

    const dia = String(fecha.getDate()).padStart(2, '0');

    return año + '-' + mes + '-' + dia;
  }

  async obtenerClases() {
    const clases = await this.clasesRepository.obtenerTodas();

    const postulaciones = await this.postulacionesRepository.obtenerTodas();

    return clases.map((clase) => {
      const aceptados = postulaciones.filter(
        (postulacion) =>
          Number(postulacion.claseId) === Number(clase.id) &&
          (postulacion.estado === 'aceptado' || postulacion.estado === 'aprobado'),
      ).length;

      return {
        ...clase,

        cuposDisponibles: Math.max(clase.cupos - aceptados, 0),
      };
    });
  }

  async obtenerClase(id: number) {
    const clases = await this.obtenerClases();
    const clase = clases.find((item) => Number(item.id) === id);

    if (!clase) {
      throw new NotFoundException('Clase no encontrada');
    }

    return clase;
  }

  async obtenerPostulaciones() {
    return this.postulacionesRepository.obtenerTodas();
  }

  async crearClase(datos: CrearClaseDto) {
    const fechaFin = this.calcularFechaFin(datos.fechaInicio, datos.duracion);

    const nuevaClase = {
      id: Date.now(),

      nivel: datos.nivel,

      sede: datos.sede,

      frecuencia: datos.frecuencia,

      profesor: datos.profesor,

      horaInicio: datos.horaInicio,

      horaFin: datos.horaFin,

      tarifa: datos.tarifa,

      cupos: datos.cupos,

      cuposDisponibles: datos.cupos,

      fechaInicio: datos.fechaInicio,

      duracion: datos.duracion,

      fechaFin: fechaFin,
    };

    return this.clasesRepository.guardar(nuevaClase);
  }

  async crearPostulacion(datos: any) {
    const clases = await this.clasesRepository.obtenerTodas();

    const clase = clases.find((item) => Number(item.id) === Number(datos.claseId));

    if (!clase) {
      throw new Error('Clase no encontrada');
    }

    const postulacion = {
      id: Date.now(),

      nombre: datos.nombre,

      telefono: datos.telefono,

      correo: datos.correo,

      fechaNacimiento: datos.fechaNacimiento,

      nombreCompletoApoderado: datos.nombreCompletoApoderado,

      correoApoderado: datos.correoApoderado,

      telefonoApoderado: datos.telefonoApoderado,

      claseId: clase.id,

      nivel: clase.nivel,

      sede: clase.sede,

      profesor: clase.profesor,

      frecuencia: clase.frecuencia,

      horaInicio: clase.horaInicio,

      horaFin: clase.horaFin,

      estado: 'pendiente',

      fechaPostulacion: new Date().toISOString(),
    };

    return this.postulacionesRepository.guardar(postulacion);
  }

  async actualizarEstadoPostulacion(id: number, estado: string) {
    const postulaciones = await this.postulacionesRepository.obtenerTodas();

    const postulacion = postulaciones.find((item) => item.id === id);

    if (!postulacion) {
      throw new Error('Postulación no encontrada');
    }

    await this.postulacionesRepository.actualizarEstado(id, estado);

    await this.actualizarCuposClase(postulacion.claseId);

    return {
      mensaje: 'Estado actualizado correctamente',
    };
  }

  async actualizarCuposClase(claseId: number) {
    const clases = await this.clasesRepository.obtenerTodas();

    const clase = clases.find((item) => Number(item.id) === Number(claseId));

    if (!clase) {
      throw new Error('Clase no encontrada');
    }

    const postulaciones = await this.postulacionesRepository.obtenerTodas();

    const aceptados = postulaciones.filter(
      (postulacion) =>
        Number(postulacion.claseId) === Number(claseId) &&
        (postulacion.estado === 'aceptado' || postulacion.estado === 'aprobado'),
    ).length;

    const cuposDisponibles = Math.max(clase.cupos - aceptados, 0);

    await this.clasesRepository.actualizarCuposDisponibles(claseId, cuposDisponibles);

    return cuposDisponibles;
  }

  async eliminarPostulacion(id: number) {
    const postulaciones = await this.postulacionesRepository.obtenerTodas();

    const postulacion = postulaciones.find((item) => item.id === id);

    if (!postulacion) {
      throw new Error('Postulación no encontrada');
    }

    await this.postulacionesRepository.eliminar(id);

    await this.actualizarCuposClase(postulacion.claseId);

    return {
      mensaje: 'Postulación eliminada correctamente',
    };
  }

  async actualizarClase(id: number, datos: CrearClaseDto) {
    const clases = await this.clasesRepository.obtenerTodas();

    const claseActual = clases.find((item) => item.id === id);

    if (!claseActual) {
      throw new Error('Clase no encontrada');
    }

    const fechaFin = this.calcularFechaFin(datos.fechaInicio, datos.duracion);

    const claseActualizada = {
      ...claseActual,

      nivel: datos.nivel,

      sede: datos.sede,

      frecuencia: datos.frecuencia,

      profesor: datos.profesor,

      horaInicio: datos.horaInicio,

      horaFin: datos.horaFin,

      tarifa: datos.tarifa,

      cupos: datos.cupos,

      fechaInicio: datos.fechaInicio,

      duracion: datos.duracion,

      fechaFin: fechaFin,
    };

    return this.clasesRepository.actualizar(claseActualizada);
  }

  async eliminarClase(id: number) {
    const clases = await this.clasesRepository.obtenerTodas();

    const clase = clases.find((item) => item.id === id);

    if (!clase) {
      throw new Error('Clase no encontrada');
    }

    await this.clasesRepository.eliminar(id);

    return {
      mensaje: 'Clase eliminada correctamente',
    };
  }
}
