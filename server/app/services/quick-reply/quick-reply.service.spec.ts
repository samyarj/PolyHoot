import { Test, TestingModule } from '@nestjs/testing';
import { QuickReplyService } from './quick-reply.service';

describe('QuickReplyService', () => {
  let service: QuickReplyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuickReplyService],
    }).compile();

    service = module.get<QuickReplyService>(QuickReplyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
