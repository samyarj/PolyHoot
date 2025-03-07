import { Test, TestingModule } from '@nestjs/testing';
import { UploadImgController } from './upload-img.controller';

describe('UploadImgController', () => {
  let controller: UploadImgController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadImgController],
    }).compile();

    controller = module.get<UploadImgController>(UploadImgController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
