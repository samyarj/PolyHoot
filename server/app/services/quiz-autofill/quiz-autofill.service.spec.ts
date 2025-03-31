import { Test, TestingModule } from '@nestjs/testing';
import { QuizAutofillService } from './quiz-autofill.service';

describe('QuizAutofillService', () => {
  let service: QuizAutofillService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuizAutofillService],
    }).compile();

    service = module.get<QuizAutofillService>(QuizAutofillService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
