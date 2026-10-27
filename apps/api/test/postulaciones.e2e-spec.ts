import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { ClasesRepository } from '../src/clases/repositories/clases.repository.js';
import { PostulacionesRepository } from '../src/clases/repositories/postulaciones.repository.js';

describe('Postulación pública (HTTP, repositorios simulados)', () => {
  let app: INestApplication;
  const guardar = vi.fn();
  const datos = {
    claseId: 1,
    nombre: 'Alumno Ejemplo',
    telefono: '999888111',
    correo: 'alumno@example.com',
    fechaNacimiento: '2000-01-01',
    consentimiento: true,
  };
  beforeEach(async () => {
    guardar.mockReset().mockImplementation(async (valor) => valor);
    const modulo = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ClasesRepository)
      .useValue({
        obtenerTodas: async () => [
          {
            id: 1,
            nivel: 'Principiante',
            sede: 'Centro',
            profesor: 'Ana',
            frecuencia: ['Lunes'],
            horaInicio: '09:00',
            horaFin: '10:00',
            cupos: 3,
            fechaInicio: '2020-01-01',
            fechaFin: '2099-12-31',
          },
        ],
      })
      .overrideProvider(PostulacionesRepository)
      .useValue({ obtenerTodas: async () => [], guardar })
      .compile();
    app = modulo.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });
  afterEach(async () => {
    await app?.close();
  });

  it('acepta sin sesión, normaliza y descarta estado y atributos de la clase enviados por el cliente', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/clases/postulaciones')
      .send({
        ...datos,
        nombre: '  Alumno Ejemplo ',
        correo: ' ALUMNO@EXAMPLE.COM ',
        estado: 'aceptado',
        nivel: 'Falso',
      })
      .expect(201);
    expect(guardar).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Alumno Ejemplo',
        correo: 'alumno@example.com',
        nivel: 'Principiante',
        estado: 'pendiente',
      }),
    );
    expect(respuesta.body).not.toHaveProperty('correo');
  });
  it.each([
    { correo: 'invalido' },
    { nombre: '  ' },
    { telefono: '123' },
    { telefono: 999888111 },
    { fechaNacimiento: '2026-02-30' },
    { fechaNacimiento: 'no-es-fecha' },
    { claseId: -1 },
    { claseId: '1' },
    { claseId: 1.5 },
    { consentimiento: false },
    { consentimiento: 'true' },
    { consentimiento: null },
    { nombreCompletoApoderado: 'A', fechaNacimiento: '2020-01-01' },
  ])('rechaza campos inválidos antes de escribir: %j', async (cambio) => {
    await request(app.getHttpServer())
      .post('/clases/postulaciones')
      .send({ ...datos, ...cambio })
      .expect(400);
    expect(guardar).not.toHaveBeenCalled();
  });
  it('exige consentimiento incluso si el campo se omite', async () => {
    const { consentimiento: _, ...sinConsentimiento } = datos;
    await request(app.getHttpServer())
      .post('/clases/postulaciones')
      .send(sinConsentimiento)
      .expect(400);
    expect(guardar).not.toHaveBeenCalled();
  });
  it('responde 400 para menores sin apoderado y 404 para clases inexistentes', async () => {
    await request(app.getHttpServer())
      .post('/clases/postulaciones')
      .send({ ...datos, fechaNacimiento: '2020-01-01' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/clases/postulaciones')
      .send({ ...datos, claseId: 2 })
      .expect(404);
    expect(guardar).not.toHaveBeenCalled();
  });
  it('limita a 5 intentos en 15 minutos, incluye Retry-After e ignora un X-Forwarded-For falsificado', async () => {
    for (let intento = 0; intento < 5; intento++) {
      await request(app.getHttpServer()).post('/clases/postulaciones').send({}).expect(400);
    }
    const respuesta = await request(app.getHttpServer())
      .post('/clases/postulaciones')
      .set('X-Forwarded-For', '203.0.113.2')
      .send(datos)
      .expect(429);
    expect(Number(respuesta.headers['retry-after'])).toBeGreaterThan(0);
    expect(guardar).not.toHaveBeenCalled();
  });
});
