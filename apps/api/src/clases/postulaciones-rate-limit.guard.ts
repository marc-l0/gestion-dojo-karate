import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/** Límite por IP para una instancia. No confía en X-Forwarded-For enviado por el usuario. */
@Injectable()
export class PostulacionesRateLimitGuard implements CanActivate {
  private readonly intentos = new Map<string, { cantidad: number; hasta: number }>();
  private readonly ventanaMs = 15 * 60 * 1000;

  canActivate(context: ExecutionContext): boolean {
    const ahora = Date.now();
    for (const [ip, registro] of this.intentos) {
      if (registro.hasta <= ahora) this.intentos.delete(ip);
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const ip = request.ip ?? request.socket.remoteAddress ?? 'desconocida';
    let registro = this.intentos.get(ip);

    if (!registro) {
      // Mantiene acotada la memoria sin expulsar IPs que aún están bloqueadas.
      if (this.intentos.size >= 10000) {
        throw new HttpException('Intenta de nuevo en unos minutos.', HttpStatus.TOO_MANY_REQUESTS);
      }
      registro = { cantidad: 0, hasta: ahora + this.ventanaMs };
      this.intentos.set(ip, registro);
    }

    if (registro.cantidad >= 5) {
      response.setHeader('Retry-After', Math.ceil((registro.hasta - ahora) / 1000));
      throw new HttpException(
        'Has enviado demasiadas solicitudes. Espera unos minutos antes de volver a intentarlo.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    registro.cantidad += 1;
    return true;
  }
}
