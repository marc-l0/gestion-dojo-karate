import type { ClaseDto, CrearClaseInput } from '@dojo/shared';
import { BadRequestException, ConflictException } from '@nestjs/common';

type Horario = Pick<
  ClaseDto,
  'profesor' | 'frecuencia' | 'horaInicio' | 'horaFin' | 'fechaInicio' | 'fechaFin'
>;
const DIA_MS = 86400000;
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const nombre = (valor: string) =>
  valor.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('es');

function fechaUtc(valor: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor ?? '')) return null;
  const fecha = new Date(`${valor}T00:00:00Z`);
  return Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== valor
    ? null
    : fecha.getTime();
}

export function validarHorarioClase(datos: CrearClaseInput) {
  if (fechaUtc(datos.fechaInicio) === null)
    throw new BadRequestException('La fecha de inicio no es válida.');
  if (!['1 semana', '2 semanas', '3 semanas', '1 mes'].includes(datos.duracion))
    throw new BadRequestException('La duración de la clase no es válida.');
  if (!datos.profesor?.trim()) throw new BadRequestException('Selecciona un profesor.');
  if (
    !Array.isArray(datos.frecuencia) ||
    !datos.frecuencia.length ||
    !datos.frecuencia.every((dia) => DIAS.includes(dia))
  )
    throw new BadRequestException('Selecciona al menos un día de entrenamiento válido.');
  const hora = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (
    !hora.test(datos.horaInicio) ||
    !hora.test(datos.horaFin) ||
    datos.horaInicio >= datos.horaFin
  )
    throw new BadRequestException(
      'La hora de fin debe ser posterior a la hora de inicio, con horas válidas del mismo día.',
    );
}

/** Los periodos incluyen su último día; dos sesiones contiguas no se superponen. */
function primerDiaEnComun(a: Horario, b: Horario): string | null {
  const aInicio = fechaUtc(a.fechaInicio),
    bInicio = fechaUtc(b.fechaInicio);
  const aFin = fechaUtc(a.fechaFin),
    bFin = fechaUtc(b.fechaFin);
  if (aInicio === null || bInicio === null || aFin === null || bFin === null) return null;
  const inicio = Math.max(aInicio, bInicio),
    fin = Math.min(aFin, bFin);
  if (inicio > fin) return null;
  const diaInicio = new Date(inicio).getUTCDay();
  let primero = Number.POSITIVE_INFINITY;
  for (const dia of a.frecuencia) {
    const indice = DIAS.indexOf(dia);
    if (indice < 0 || !b.frecuencia.includes(dia)) continue;
    const coincidencia = inicio + ((indice - diaInicio + 7) % 7) * DIA_MS;
    if (coincidencia <= fin) primero = Math.min(primero, coincidencia);
  }
  return Number.isFinite(primero) ? new Date(primero).toISOString().slice(0, 10) : null;
}

export function comprobarDisponibilidad(nueva: Horario, clases: ClaseDto[], excluirId?: number) {
  for (const clase of clases) {
    if (
      clase.id === excluirId ||
      !clase.profesor ||
      nombre(clase.profesor) !== nombre(nueva.profesor)
    )
      continue;
    if (!(nueva.horaInicio < clase.horaFin && clase.horaInicio < nueva.horaFin)) continue;
    const dia = primerDiaEnComun(nueva, clase);
    if (!dia) continue;
    const fecha = new Intl.DateTimeFormat('es-PE', { dateStyle: 'long', timeZone: 'UTC' }).format(
      new Date(`${dia}T00:00:00Z`),
    );
    throw new ConflictException(
      `El profesor ${clase.profesor} ya tiene una clase en ${clase.sede} el ${fecha}, de ${clase.horaInicio} a ${clase.horaFin}. Elige otro horario, día o profesor.`,
    );
  }
}
