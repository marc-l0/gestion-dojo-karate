import { Test, TestingModule } from '@nestjs/testing';
import { ClasesService } from './clases.service.js';
import { ClasesRepository } from './repositories/clases.repository.js';
import { PostulacionesRepository } from './repositories/postulaciones.repository.js';

describe('ClasesService', () => {
  let service: ClasesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClasesService,
        {
          provide: ClasesRepository,
          useValue: {},
        },
        {
          provide: PostulacionesRepository,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ClasesService>(ClasesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
