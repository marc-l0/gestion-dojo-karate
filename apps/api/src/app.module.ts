import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { ClasesModule } from './clases/clases.module.js';
import { ProfesoresModule } from './profesores/profesores.module.js';

@Module({
  imports: [AuthModule, ClasesModule, ProfesoresModule],
  controllers: [AppController],
  providers: [
    AppService,
    // Todas las rutas exigen sesión salvo las marcadas con @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
