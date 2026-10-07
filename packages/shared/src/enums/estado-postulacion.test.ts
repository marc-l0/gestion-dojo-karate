import { describe, expect, it } from 'vitest';
import { ocupaCupo } from './estado-postulacion.js';

describe('ocupaCupo', () => {
  it('cuenta las postulaciones aceptadas y aprobadas', () => {
    expect(ocupaCupo('aceptado')).toBe(true);
    expect(ocupaCupo('aprobado')).toBe(true);
  });

  it('no cuenta pendientes, rechazadas ni ignoradas', () => {
    expect(ocupaCupo('pendiente')).toBe(false);
    expect(ocupaCupo('rechazado')).toBe(false);
    expect(ocupaCupo('ignorado')).toBe(false);
  });
});
