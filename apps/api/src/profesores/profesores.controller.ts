import { Body, Controller, Get, Post } from '@nestjs/common';

import { ProfesoresService } from './profesores.service.js';

@Controller('profesores')
export class ProfesoresController {
  constructor(private readonly profesoresService: ProfesoresService) {}

  @Get()
  obtenerProfesores() {
    return this.profesoresService.obtenerProfesores();
  }

  @Post()
  crearProfesor(@Body() datos: { nombre: string }) {
    return this.profesoresService.crearProfesor(datos.nombre);
  }

  @Post('estado')
  cambiarEstado(
    @Body()
    datos: { id: number; estado: string },
  ) {
    return this.profesoresService.cambiarEstado(datos.id, datos.estado);
  }
}
