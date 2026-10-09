import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { Public } from '../common/decorators/public.decorator.js';

import { ClasesService } from './clases.service.js';

import { CrearClaseDto } from './dto/crear-clase.dto.js';

@Controller('clases')
export class ClasesController {
  constructor(private readonly clasesService: ClasesService) {}

  @Get()
  obtenerClases() {
    return this.clasesService.obtenerClases();
  }

  @Get('postulaciones')
  obtenerPostulaciones() {
    return this.clasesService.obtenerPostulaciones();
  }

  // NUEVA: pública, la usa el formulario del QR.
  // Debe ir DESPUÉS de @Get("postulaciones").
  @Public()
  @Get(':id')
  obtenerClase(
    @Param('id')
    id: string,
  ) {
    return this.clasesService.obtenerClase(Number(id));
  }

  @Post()
  crearClase(
    @Body()
    datos: CrearClaseDto,
  ) {
    return this.clasesService.crearClase(datos);
  }

  // Pública: es el envío del formulario del QR.
  @Public()
  @Post('postulaciones')
  crearPostulacion(
    @Body()
    datos: any,
  ) {
    return this.clasesService.crearPostulacion(datos);
  }

  @Post('postulaciones/estado')
  actualizarEstadoPostulacion(
    @Body()
    datos: { id: number; estado: string },
  ) {
    return this.clasesService.actualizarEstadoPostulacion(datos.id, datos.estado);
  }

  @Post(':id')
  actualizarClase(
    @Param('id')
    id: string,

    @Body()
    datos: CrearClaseDto,
  ) {
    return this.clasesService.actualizarClase(Number(id), datos);
  }

  @Delete('postulaciones/:id')
  eliminarPostulacion(
    @Param('id')
    id: string,
  ) {
    return this.clasesService.eliminarPostulacion(Number(id));
  }

  @Delete(':id')
  eliminarClase(
    @Param('id')
    id: string,
  ) {
    return this.clasesService.eliminarClase(Number(id));
  }
}
