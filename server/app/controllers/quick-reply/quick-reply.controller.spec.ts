import { Test, TestingModule } from '@nestjs/testing';
import { QuickReplyController } from './quick-reply.controller';

describe('QuickReplyController', () => {
  let controller: QuickReplyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuickReplyController],
    }).compile();

    controller = module.get<QuickReplyController>(QuickReplyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
