import { Test, TestingModule } from '@nestjs/testing';
import { ClasesController } from './clases.controller.js';
import { ClasesService } from './clases.service.js';

describe('ClasesController', () => {
  let controller: ClasesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClasesController],
      providers: [
        {
          provide: ClasesService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ClasesController>(ClasesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
