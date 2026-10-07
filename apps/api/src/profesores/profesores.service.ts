import { Injectable } from '@nestjs/common';
import { Profesor } from './interfaces/profesor.interface.js';
import { ProfesoresRepository } from './repositories/profesores.repository.js';

@Injectable()
export class ProfesoresService {
  constructor(private readonly profesoresRepository: ProfesoresRepository) {}

  obtenerProfesores() {
    return this.profesoresRepository.obtenerTodos();
  }

  async crearProfesor(nombre: string) {
    if (!nombre || !nombre.trim()) {
      throw new Error('El nombre del profesor es obligatorio');
    }

    const profesores = await this.profesoresRepository.obtenerTodos();

    const nombreExiste = profesores.some(
      (profesor) =>
        profesor.nombre.toLowerCase() === nombre.trim().toLowerCase() &&
        profesor.estado === 'activo',
    );

    if (nombreExiste) {
      throw new Error('El profesor ya existe');
    }

    const nuevoProfesor: Profesor = {
      id: Date.now(),
      nombre: nombre.trim(),
      estado: 'activo',
    };

    await this.profesoresRepository.guardar(nuevoProfesor);

    return {
      mensaje: 'Profesor creado correctamente',
      profesor: nuevoProfesor,
    };
  }

  async cambiarEstado(id: number, estado: string) {
    return this.profesoresRepository.actualizarEstado(id, estado);
  }
}
