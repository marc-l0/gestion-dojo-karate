import type { ClaseDto } from '@dojo/shared';
import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { ACCESS_TOKEN_COOKIE } from '../src/auth/auth.constants.js';
import { ClasesRepository } from '../src/clases/repositories/clases.repository.js';

const base: ClaseDto = {
  id: 1,
  nivel: 'Básico',
  sede: 'Callao',
  profesor: 'Ana Torres',
  frecuencia: ['Lunes'],
  horaInicio: '16:00',
  horaFin: '17:30',
  tarifa: 150,
  cupos: 10,
  cuposDisponibles: 10,
  fechaInicio: '2026-11-16',
  fechaFin: '2026-12-16',
  duracion: '1 mes',
};
describe('Regla de horarios (HTTP, repositorio simulado)', () => {
  let app: INestApplication;
  let cookie: string;
  const guardar = vi.fn();
  const actualizar = vi.fn();
  beforeEach(async () => {
    vi.resetAllMocks();
    guardar.mockImplementation(async (clase: ClaseDto) => clase);
    actualizar.mockImplementation(async (clase: ClaseDto) => clase);
    const modulo = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ClasesRepository)
      .useValue({ obtenerTodas: async () => [{ ...base }], guardar, actualizar })
      .compile();
    app = modulo.createNestApplication();
    app.use(cookieParser());
    await app.init();
    cookie = `${ACCESS_TOKEN_COOKIE}=${app.get(JwtService).sign({ sub: 'admin' })}`;
  });
  afterEach(async () => {
    await app?.close();
  });
  it('exige sesión para crear y editar clases', async () => {
    await request(app.getHttpServer()).post('/clases').send(base).expect(401);
    await request(app.getHttpServer()).post('/clases/1').send(base).expect(401);
    expect(guardar).not.toHaveBeenCalled();
    expect(actualizar).not.toHaveBeenCalled();
  });
  it('devuelve 409 con el profesor, sede y horario ocupado sin guardar', async () => {
    const r = await request(app.getHttpServer())
      .post('/clases')
      .set('Cookie', cookie)
      .send({ ...base, sede: 'Ventanilla' })
      .expect(409);
    expect(r.body.message).toContain('Ana Torres');
    expect(r.body.message).toContain('Callao');
    expect(r.body.message).toContain('16:00 a 17:30');
    expect(guardar).not.toHaveBeenCalled();
  });
  it('permite clases consecutivas y conserva la fecha final calculada', async () => {
    const r = await request(app.getHttpServer())
      .post('/clases')
      .set('Cookie', cookie)
      .send({ ...base, horaInicio: '17:30', horaFin: '19:00' })
      .expect(201);
    expect(r.body.fechaFin).toBe('2026-12-16');
    expect(guardar).toHaveBeenCalledOnce();
  });
  it('permite editar la propia clase sin un falso conflicto', async () => {
    await request(app.getHttpServer())
      .post('/clases/1')
      .set('Cookie', cookie)
      .send(base)
      .expect(201);
    expect(actualizar).toHaveBeenCalledOnce();
  });
  it('rechaza días vacíos y horas inválidas sin escribir', async () => {
    for (const cambio of [
      { frecuencia: [] },
      { horaFin: '15:00' },
      { fechaInicio: '2026-02-30' },
    ]) {
      await request(app.getHttpServer())
        .post('/clases')
        .set('Cookie', cookie)
        .send({ ...base, ...cambio })
        .expect(400);
    }
    expect(guardar).not.toHaveBeenCalled();
  });
});
