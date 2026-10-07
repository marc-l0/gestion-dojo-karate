import { Module } from '@nestjs/common';
import { ClasesController } from './clases.controller.js';
import { ClasesService } from './clases.service.js';
import { ClasesRepository } from './repositories/clases.repository.js';
import { PostulacionesRepository } from './repositories/postulaciones.repository.js';

@Module({
  controllers: [ClasesController],
  providers: [ClasesService, ClasesRepository, PostulacionesRepository],
})
export class ClasesModule {}
