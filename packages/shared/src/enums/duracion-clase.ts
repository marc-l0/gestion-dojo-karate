/** Duraciones permitidas al crear una clase (la fecha de fin se calcula a partir de ellas). */
export const DURACIONES_CLASE = ['1 semana', '2 semanas', '3 semanas', '1 mes'] as const;

export type DuracionClase = (typeof DURACIONES_CLASE)[number];
