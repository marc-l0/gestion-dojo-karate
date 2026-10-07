import { Test, TestingModule } from '@nestjs/testing';
import { ClasesController } from './clases.controller.js';

describe('ClasesController', () => {
  let controller: ClasesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClasesController],
    }).compile();

    controller = module.get<ClasesController>(ClasesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
