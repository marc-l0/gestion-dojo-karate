/**
 * Contrato de datos entre web y api: la forma de lo que viaja por HTTP.
 * Los campos de estado y duración son `string` porque así los guarda hoy la API;
 * los valores válidos están en los enums de ../enums.
 */

export interface ClaseDto {
  id: number;
  nivel: string;
  sede: string;
  frecuencia: string[];
  profesor: string;
  horaInicio: string;
  horaFin: string;
  tarifa: number;
  cupos: number;
  cuposDisponibles: number;
  fechaInicio: string;
  duracion: string;
  fechaFin: string;
}

/** Cuerpo de POST /clases y POST /clases/:id. */
export interface CrearClaseInput {
  nivel: string;
  sede: string;
  frecuencia: string[];
  profesor: string;
  horaInicio: string;
  horaFin: string;
  tarifa: number;
  cupos: number;
  fechaInicio: string;
  duracion: string;
}

export interface PostulacionDto {
  id: number;
  nombre: string;
  telefono: string;
  correo: string;
  fechaNacimiento: string;

  nombreCompletoApoderado?: string;
  correoApoderado?: string;
  telefonoApoderado?: string;

  claseId: number;
  nivel: string;
  sede: string;
  profesor: string;
  frecuencia: string[];
  horaInicio: string;
  horaFin: string;

  estado: string;
  fechaPostulacion: string;
}

export interface ProfesorDto {
  id: number;
  nombre: string;
  estado: string;
}
