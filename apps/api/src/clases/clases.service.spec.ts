import type { ClaseDto, PostulacionDto } from '@dojo/shared';
import { ClasesService } from './clases.service.js';
import { CrearPostulacionDto } from './dto/crear-postulacion.dto.js';
import { ClasesRepository } from './repositories/clases.repository.js';
import { PostulacionesRepository } from './repositories/postulaciones.repository.js';

describe('Postulaciones y cupos', () => {
  let service: ClasesService;
  let clase: ClaseDto;
  let postulaciones: PostulacionDto[];
  let datos: CrearPostulacionDto;
  let guardar: ReturnType<typeof vi.fn>;
  let actualizarEstado: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-27T17:00:00Z'));
    clase = {
      id: 1,
      nivel: 'Principiante',
      sede: 'Centro',
      profesor: 'Ana',
      frecuencia: ['Lunes'],
      horaInicio: '09:00',
      horaFin: '10:00',
      tarifa: 100,
      cupos: 1,
      cuposDisponibles: 1,
      fechaInicio: '2026-10-01',
      fechaFin: '2026-10-31',
      duracion: '1 mes',
    };
    postulaciones = [];
    datos = {
      claseId: 1,
      nombre: 'Alumno Ejemplo',
      telefono: '999888111',
      correo: 'alumno@example.com',
      fechaNacimiento: '2000-01-01',
      consentimiento: true,
    };
    guardar = vi.fn(async (postulacion: PostulacionDto) => {
      postulaciones.push(postulacion);
      return postulacion;
    });
    actualizarEstado = vi.fn(async (id: number, estado: string) => {
      const postulacion = postulaciones.find((item) => item.id === id);
      if (postulacion) postulacion.estado = estado;
    });
    service = new ClasesService(
      {
        obtenerTodas: vi.fn(async () => [clase]),
        actualizarCuposDisponibles: vi.fn(),
      } as unknown as ClasesRepository,
      {
        obtenerTodas: vi.fn(async () => postulaciones),
        guardar,
        actualizarEstado,
      } as unknown as PostulacionesRepository,
    );
  });
  afterEach(() => vi.useRealTimers());

  it('guarda pendiente, con datos de la clase y constancia del consentimiento, sin devolver datos personales', async () => {
    const respuesta = await service.crearPostulacion(datos);
    expect(respuesta).toEqual({
      id: expect.any(Number),
      estado: 'pendiente',
      mensaje: expect.any(String),
    });
    expect(postulaciones[0]).toMatchObject({
      nivel: clase.nivel,
      estado: 'pendiente',
      consentimientoVersion: '2026-10-27',
      consentimientoFecha: '2026-10-27T17:00:00.000Z',
    });
  });
  it('rechaza clases inexistentes', async () => {
    await expect(service.crearPostulacion({ ...datos, claseId: 2 })).rejects.toMatchObject({
      status: 404,
    });
    expect(guardar).not.toHaveBeenCalled();
  });
  it.each(['2026-09-30T17:00:00Z', '2026-11-01T17:00:00Z'])(
    'rechaza fuera de la vigencia: %s',
    async (fecha) => {
      vi.setSystemTime(new Date(fecha));
      await expect(service.crearPostulacion(datos)).rejects.toThrow('no está vigente');
      expect(guardar).not.toHaveBeenCalled();
    },
  );
  it('usa el día en Perú en el límite de medianoche UTC', async () => {
    vi.setSystemTime(new Date('2026-11-01T02:00:00Z'));
    await expect(service.crearPostulacion(datos)).resolves.toMatchObject({ estado: 'pendiente' });
  });
  it('rechaza cuando los aceptados ocupan todos los cupos, aunque la celda esté desactualizada', async () => {
    await service.crearPostulacion(datos);
    postulaciones[0].estado = 'aprobado';
    await expect(
      service.crearPostulacion({ ...datos, correo: 'otro@example.com' }),
    ).rejects.toThrow('no tiene cupos');
    expect(guardar).toHaveBeenCalledTimes(1);
  });
  it('permite pendientes sin reservar la vacante y crea IDs distintos en el mismo milisegundo', async () => {
    await service.crearPostulacion(datos);
    await service.crearPostulacion({ ...datos, correo: 'otro@example.com' });
    expect(postulaciones).toHaveLength(2);
    expect(postulaciones[0].id).not.toBe(postulaciones[1].id);
    expect((await service.obtenerClase(1)).cuposDisponibles).toBe(1);
  });
  it('rechaza correos duplicados ignorando espacios y mayúsculas', async () => {
    await service.crearPostulacion(datos);
    await expect(
      service.crearPostulacion({ ...datos, correo: ' ALUMNO@EXAMPLE.COM ' }),
    ).rejects.toMatchObject({ status: 409 });
    expect(guardar).toHaveBeenCalledTimes(1);
  });
  it('serializa envíos simultáneos del mismo correo', async () => {
    const resultados = await Promise.allSettled([
      service.crearPostulacion(datos),
      service.crearPostulacion(datos),
    ]);
    expect(resultados.filter((item) => item.status === 'fulfilled')).toHaveLength(1);
    expect(guardar).toHaveBeenCalledTimes(1);
  });
  it('libera la cola si Sheets falla y permite reintentar', async () => {
    guardar.mockRejectedValueOnce(new Error('Sheets no disponible'));
    await expect(service.crearPostulacion(datos)).rejects.toThrow('Sheets no disponible');
    await expect(service.crearPostulacion(datos)).resolves.toMatchObject({ estado: 'pendiente' });
  });
  it.each(['2027-01-01', '1900-01-01'])(
    'rechaza nacimiento fuera del rango: %s',
    async (fechaNacimiento) => {
      await expect(service.crearPostulacion({ ...datos, fechaNacimiento })).rejects.toThrow(
        '0 a 100 años',
      );
    },
  );
  it('exige apoderado para menores y permite el día del cumpleaños 18', async () => {
    await expect(
      service.crearPostulacion({ ...datos, fechaNacimiento: '2008-10-28' }),
    ).rejects.toThrow('apoderado');
    await expect(
      service.crearPostulacion({ ...datos, fechaNacimiento: '2008-10-27' }),
    ).resolves.toMatchObject({ estado: 'pendiente' });
  });
  it('guarda los datos del apoderado de un menor', async () => {
    await service.crearPostulacion({
      ...datos,
      fechaNacimiento: '2015-01-01',
      nombreCompletoApoderado: 'Apoderado Ejemplo',
      correoApoderado: 'apoderado@example.com',
      telefonoApoderado: '999888222',
    });
    expect(postulaciones[0].correoApoderado).toBe('apoderado@example.com');
  });
  it('impide aceptar dos postulaciones simultáneas para la última vacante', async () => {
    const primera = await service.crearPostulacion(datos);
    const segunda = await service.crearPostulacion({ ...datos, correo: 'otro@example.com' });
    const resultados = await Promise.allSettled([
      service.actualizarEstadoPostulacion(primera.id, 'aceptado'),
      service.actualizarEstadoPostulacion(segunda.id, 'aprobado'),
    ]);
    expect(resultados.filter((item) => item.status === 'fulfilled')).toHaveLength(1);
    expect(actualizarEstado).toHaveBeenCalledTimes(1);
    expect((await service.obtenerClase(1)).cuposDisponibles).toBe(0);
  });
  it('cambiar aceptado a aprobado no requiere una vacante adicional y rechazar libera la vacante', async () => {
    const primera = await service.crearPostulacion(datos);
    await service.actualizarEstadoPostulacion(primera.id, 'aceptado');
    await service.actualizarEstadoPostulacion(primera.id, 'aprobado');
    await service.actualizarEstadoPostulacion(primera.id, 'rechazado');
    expect((await service.obtenerClase(1)).cuposDisponibles).toBe(1);
  });
  it('rechaza estados desconocidos', async () => {
    await expect(service.actualizarEstadoPostulacion(1, 'inventado')).rejects.toMatchObject({
      status: 400,
    });
    expect(actualizarEstado).not.toHaveBeenCalled();
  });
});
