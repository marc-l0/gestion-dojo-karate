import type { INestApplication } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { ACCESS_TOKEN_COOKIE } from '../src/auth/auth.constants.js';
import { ProfesoresRepository } from '../src/profesores/repositories/profesores.repository.js';

describe('Eliminación de profesores (HTTP, Sheets simulado)', () => {
  let app: INestApplication;
  let cookie: string;
  const eliminar = vi.fn();
  beforeEach(async () => {
    eliminar.mockReset().mockResolvedValue({ mensaje: 'Profesor eliminado correctamente' });
    const modulo = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ProfesoresRepository)
      .useValue({ eliminar })
      .compile();
    app = modulo.createNestApplication();
    app.use(cookieParser());
    await app.init();
    cookie = `${ACCESS_TOKEN_COOKIE}=${app.get(JwtService).sign({ sub: 'admin' })}`;
  });
  afterEach(async () => {
    await app?.close();
  });

  it('requiere sesión para eliminar y no escribe sin autorización', async () => {
    await request(app.getHttpServer()).delete('/profesores/101').expect(401);
    expect(eliminar).not.toHaveBeenCalled();
  });
  it('elimina el profesor indicado con sesión de administrador', async () => {
    await request(app.getHttpServer())
      .delete('/profesores/101')
      .set('Cookie', cookie)
      .expect(200, { mensaje: 'Profesor eliminado correctamente' });
    expect(eliminar).toHaveBeenCalledExactlyOnceWith(101);
  });
  it.each(['no-es-id', '1.5', '0', '-1', '9007199254740992'])(
    'rechaza el identificador inválido %s sin escribir',
    async (id) => {
      await request(app.getHttpServer())
        .delete(`/profesores/${id}`)
        .set('Cookie', cookie)
        .expect(400);
      expect(eliminar).not.toHaveBeenCalled();
    },
  );
  it('devuelve 404 si el profesor ya fue eliminado', async () => {
    eliminar.mockRejectedValue(new NotFoundException('Profesor no encontrado'));
    await request(app.getHttpServer()).delete('/profesores/101').set('Cookie', cookie).expect(404);
  });
});
