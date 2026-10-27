import { ESTADOS_POSTULACION, ocupaCupo } from '@dojo/shared';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CrearClaseDto } from './dto/crear-clase.dto.js';
import { CrearPostulacionDto } from './dto/crear-postulacion.dto.js';
import { ClasesRepository } from './repositories/clases.repository.js';
import { PostulacionesRepository } from './repositories/postulaciones.repository.js';

@Injectable()
export class ClasesService {
  private readonly operaciones = new Map<number, Promise<void>>();
  private ultimoId = 0;

  // Serializa la lectura y escritura por clase dentro de esta instancia de la API.
  private async enClase<T>(claseId: number, operacion: () => Promise<T>): Promise<T> {
    const anterior = this.operaciones.get(claseId) ?? Promise.resolve();
    let liberar!: () => void;
    const actual = new Promise<void>((resolve) => {
      liberar = resolve;
    });
    this.operaciones.set(claseId, actual);
    await anterior;
    try {
      return await operacion();
    } finally {
      liberar();
      if (this.operaciones.get(claseId) === actual) this.operaciones.delete(claseId);
    }
  }

  private hoyEnLima() {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }

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

  async crearPostulacion(datos: CrearPostulacionDto) {
    return this.enClase(datos.claseId, async () => {
      const clase = await this.obtenerClase(datos.claseId);
      const hoy = this.hoyEnLima();
      if (
        !clase.fechaInicio ||
        !clase.fechaFin ||
        hoy < clase.fechaInicio ||
        hoy > clase.fechaFin
      ) {
        throw new BadRequestException('Esta convocatoria no está vigente.');
      }
      if (clase.cuposDisponibles <= 0) {
        throw new ConflictException('Esta clase ya no tiene cupos disponibles.');
      }

      const nacimiento = datos.fechaNacimiento;
      let edad = Number(hoy.slice(0, 4)) - Number(nacimiento.slice(0, 4));
      if (hoy.slice(5) < nacimiento.slice(5)) edad -= 1;
      if (nacimiento > hoy || edad > 100) {
        throw new BadRequestException(
          'La fecha de nacimiento debe corresponder a una edad de 0 a 100 años.',
        );
      }
      if (
        edad < 18 &&
        (!datos.nombreCompletoApoderado || !datos.correoApoderado || !datos.telefonoApoderado)
      ) {
        throw new BadRequestException(
          'Para menores de edad debes completar los datos del apoderado.',
        );
      }

      const postulaciones = await this.postulacionesRepository.obtenerTodas();
      const correo = datos.correo.trim().toLowerCase();
      if (
        postulaciones.some(
          (item) =>
            Number(item.claseId) === datos.claseId && item.correo?.trim().toLowerCase() === correo,
        )
      ) {
        throw new ConflictException('Este correo ya tiene una postulación para esta clase.');
      }

      this.ultimoId = Math.max(Date.now(), this.ultimoId + 1);
      const postulacion = {
        id: this.ultimoId,
        nombre: datos.nombre,
        telefono: datos.telefono,
        correo,
        fechaNacimiento: datos.fechaNacimiento,
        nombreCompletoApoderado: edad < 18 ? datos.nombreCompletoApoderado : undefined,
        correoApoderado: edad < 18 ? datos.correoApoderado : undefined,
        telefonoApoderado: edad < 18 ? datos.telefonoApoderado : undefined,
        claseId: clase.id,
        nivel: clase.nivel,
        sede: clase.sede,
        profesor: clase.profesor,
        frecuencia: clase.frecuencia,
        horaInicio: clase.horaInicio,
        horaFin: clase.horaFin,
        estado: 'pendiente',
        fechaPostulacion: new Date().toISOString(),
        consentimientoVersion: '2026-10-27',
        consentimientoFecha: new Date().toISOString(),
      };

      await this.postulacionesRepository.guardar(postulacion);
      // La ruta pública no devuelve datos personales ni datos del apoderado.
      return {
        id: postulacion.id,
        estado: postulacion.estado,
        mensaje: 'Postulación registrada correctamente.',
      };
    });
  }

  async actualizarEstadoPostulacion(id: number, estado: string) {
    if (!(ESTADOS_POSTULACION as readonly string[]).includes(estado)) {
      throw new BadRequestException('Estado de postulación no válido.');
    }
    const postulaciones = await this.postulacionesRepository.obtenerTodas();
    const postulacion = postulaciones.find((item) => item.id === id);
    if (!postulacion) throw new NotFoundException('Postulación no encontrada');

    return this.enClase(postulacion.claseId, async () => {
      const actuales = await this.postulacionesRepository.obtenerTodas();
      const actual = actuales.find((item) => item.id === id);
      if (!actual) throw new NotFoundException('Postulación no encontrada');
      if (ocupaCupo(estado) && !ocupaCupo(actual.estado)) {
        const clase = await this.obtenerClase(actual.claseId);
        if (clase.cuposDisponibles <= 0) {
          throw new ConflictException('Esta clase ya no tiene cupos disponibles.');
        }
      }
      await this.postulacionesRepository.actualizarEstado(id, estado);
      await this.actualizarCuposClase(actual.claseId);
      return { mensaje: 'Estado actualizado correctamente' };
    });
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
