import type { PostulacionDto } from '@dojo/shared';
import { crearClienteSheets } from '../../google/sheets.client.js';
import { PostulacionesRepository } from './postulaciones.repository.js';

vi.mock('../../google/sheets.client.js', () => ({ crearClienteSheets: vi.fn() }));

describe('Persistencia de postulaciones', () => {
  const append = vi.fn();
  const get = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(crearClienteSheets).mockResolvedValue({
      spreadsheets: { values: { append, get } },
    } as unknown as Awaited<ReturnType<typeof crearClienteSheets>>);
  });

  it('escribe texto sin interpretar fórmulas y conserva el orden de las 19 columnas con el consentimiento', async () => {
    const datos: PostulacionDto = {
      id: 1,
      nombre: '=1+1',
      telefono: '999888111',
      correo: 'alumno@example.com',
      fechaNacimiento: '2000-01-01',
      claseId: 2,
      nivel: 'Principiante',
      sede: 'Centro',
      profesor: 'Ana',
      frecuencia: ['Lunes', 'Miércoles'],
      horaInicio: '09:00',
      horaFin: '10:00',
      estado: 'pendiente',
      fechaPostulacion: '2026-10-27T17:00:00Z',
      consentimientoVersion: '2026-10-27',
      consentimientoFecha: '2026-10-27T17:00:00Z',
    };
    await new PostulacionesRepository().guardar(datos);
    expect(append).toHaveBeenCalledWith(
      expect.objectContaining({
        range: 'Postulaciones!A:S',
        valueInputOption: 'RAW',
        requestBody: {
          values: [
            [
              1,
              '=1+1',
              '999888111',
              'alumno@example.com',
              '2000-01-01',
              '',
              '',
              '',
              2,
              'Principiante',
              'Centro',
              'Ana',
              'Lunes, Miércoles',
              '09:00',
              '10:00',
              'pendiente',
              '2026-10-27T17:00:00Z',
              '2026-10-27',
              '2026-10-27T17:00:00Z',
            ],
          ],
        },
      }),
    );
  });

  it('lee filas antiguas sin columnas de consentimiento sin inventar una aceptación', async () => {
    get.mockResolvedValue({
      data: {
        values: [
          ['id'],
          [
            1,
            'Alumno',
            '999888111',
            'alumno@example.com',
            '2000-01-01',
            '',
            '',
            '',
            2,
            'Principiante',
            'Centro',
            'Ana',
            'Lunes',
            '09:00',
            '10:00',
            'pendiente',
            '2026-10-27T17:00:00Z',
          ],
        ],
      },
    });
    const filas = await new PostulacionesRepository().obtenerTodas();
    expect(filas[0]).toMatchObject({ consentimientoVersion: '', consentimientoFecha: '' });
  });
});
