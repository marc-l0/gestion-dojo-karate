import { Module } from '@nestjs/common';

import { ProfesoresController } from './profesores.controller.js';

import { ProfesoresService } from './profesores.service.js';

import { ProfesoresRepository } from './repositories/profesores.repository.js';

@Module({
  controllers: [ProfesoresController],
  providers: [ProfesoresService, ProfesoresRepository],
})
export class ProfesoresModule {}
