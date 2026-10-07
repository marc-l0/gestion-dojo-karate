/** Un profesor inactivo no aparece al crear nuevas clases. */
export const ESTADOS_PROFESOR = ['activo', 'inactivo'] as const;

export type EstadoProfesor = (typeof ESTADOS_PROFESOR)[number];

export const ETIQUETA_ESTADO_PROFESOR: Record<EstadoProfesor, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
};
