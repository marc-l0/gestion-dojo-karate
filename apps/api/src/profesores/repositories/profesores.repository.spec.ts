import { crearClienteSheets } from '../../google/sheets.client.js';
import { ProfesoresRepository } from './profesores.repository.js';

vi.mock('../../google/sheets.client.js', () => ({ crearClienteSheets: vi.fn() }));

describe('Eliminación de profesores en Sheets', () => {
  let filas: (string | number)[][];
  let repositorio: ProfesoresRepository;
  const getValores = vi.fn();
  const getHoja = vi.fn();
  const batchUpdate = vi.fn();
  const update = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    filas = [
      ['id', 'nombre', 'estado'],
      [101, 'Ana', 'activo'],
      [],
      [102, 'Luis', 'inactivo'],
      [103, 'Sol', 'activo'],
    ];
    getValores.mockImplementation(async () => ({
      data: { values: filas.map((fila) => [...fila]) },
    }));
    getHoja.mockResolvedValue({
      data: { sheets: [{ properties: { title: 'Profesores', sheetId: 0 } }] },
    });
    batchUpdate.mockImplementation(async (datos) => {
      const range = datos.requestBody.requests[0].deleteDimension.range;
      filas.splice(range.startIndex, range.endIndex - range.startIndex);
      return {};
    });
    update.mockImplementation(async (datos) => {
      const indice = Number(datos.range.match(/C(\d+)$/)[1]) - 1;
      filas[indice][2] = datos.requestBody.values[0][0];
      return {};
    });
    vi.mocked(crearClienteSheets).mockResolvedValue({
      spreadsheets: { values: { get: getValores, update }, get: getHoja, batchUpdate },
    } as unknown as Awaited<ReturnType<typeof crearClienteSheets>>);
    repositorio = new ProfesoresRepository();
  });

  it.each([
    [101, 1],
    [102, 3],
  ])(
    'elimina por id %i la fila exacta %i, sin borrar encabezado ni otras hojas',
    async (id, indice) => {
      await expect(repositorio.eliminar(id)).resolves.toEqual({
        mensaje: 'Profesor eliminado correctamente',
      });
      expect(getValores).toHaveBeenCalledWith(expect.objectContaining({ range: 'Profesores!A:C' }));
      expect(batchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          requestBody: {
            requests: [
              {
                deleteDimension: {
                  range: {
                    sheetId: 0,
                    dimension: 'ROWS',
                    startIndex: indice,
                    endIndex: indice + 1,
                  },
                },
              },
            ],
          },
        }),
      );
      expect(filas[0]).toEqual(['id', 'nombre', 'estado']);
      expect(filas.some((fila) => fila[0] === id)).toBe(false);
      expect(filas.some((fila) => fila[0] === 103)).toBe(true);
    },
  );

  it('responde 404 y no escribe cuando el profesor no existe', async () => {
    await expect(repositorio.eliminar(999)).rejects.toMatchObject({ status: 404 });
    expect(batchUpdate).not.toHaveBeenCalled();
  });

  it('no elimina si falta la hoja Profesores', async () => {
    getHoja.mockResolvedValue({
      data: { sheets: [{ properties: { title: 'Clases', sheetId: 2 } }] },
    });
    await expect(repositorio.eliminar(101)).rejects.toMatchObject({ status: 500 });
    expect(batchUpdate).not.toHaveBeenCalled();
  });

  it('serializa eliminaciones simultáneas para resolver cada fila después del desplazamiento', async () => {
    await Promise.all([repositorio.eliminar(101), repositorio.eliminar(102)]);
    expect(filas).toEqual([['id', 'nombre', 'estado'], [], [103, 'Sol', 'activo']]);
  });

  it('un cambio de estado concurrente alcanza al profesor correcto tras eliminar otra fila', async () => {
    await Promise.all([repositorio.eliminar(101), repositorio.actualizarEstado(103, 'inactivo')]);
    expect(filas.find((fila) => fila[0] === 103)).toEqual([103, 'Sol', 'inactivo']);
    expect(filas.find((fila) => fila[0] === 102)).toEqual([102, 'Luis', 'inactivo']);
  });

  it('propaga errores de Sheets y permite reintentar sin bloquear la cola', async () => {
    batchUpdate.mockRejectedValueOnce(new Error('Sheets no disponible'));
    await expect(repositorio.eliminar(101)).rejects.toThrow('Sheets no disponible');
    expect(filas.some((fila) => fila[0] === 101)).toBe(true);
    await expect(repositorio.eliminar(101)).resolves.toEqual({
      mensaje: 'Profesor eliminado correctamente',
    });
  });
});
