/**
 * Estados que puede tener una postulación a una clase.
 * "aceptado" y "aprobado" se tratan igual (ocupan cupo); "rechazado" e "ignorado" no.
 */
export const ESTADOS_POSTULACION = [
  'pendiente',
  'aceptado',
  'aprobado',
  'rechazado',
  'ignorado',
] as const;

export type EstadoPostulacion = (typeof ESTADOS_POSTULACION)[number];

export const ETIQUETA_ESTADO_POSTULACION: Record<EstadoPostulacion, string> = {
  pendiente: 'Pendiente',
  aceptado: 'Aceptado',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  ignorado: 'Ignorado',
};

/** Estados que descuentan un cupo de la clase. */
export const ESTADOS_QUE_OCUPAN_CUPO: readonly EstadoPostulacion[] = ['aceptado', 'aprobado'];

export function ocupaCupo(estado: string): boolean {
  return (ESTADOS_QUE_OCUPAN_CUPO as readonly string[]).includes(estado);
}
