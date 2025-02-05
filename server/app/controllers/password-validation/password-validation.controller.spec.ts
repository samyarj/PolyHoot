import { VALID_PASSWORD } from '@app/constants/valid-password';
import { Test, TestingModule } from '@nestjs/testing';
import { PasswordValidationController } from './password-validation.controller';

describe('PasswordValidationController', () => {
    let controller: PasswordValidationController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PasswordValidationController],
        }).compile();

        controller = module.get<PasswordValidationController>(PasswordValidationController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('verifyPassword should return true if password is valid', () => {
        const password = VALID_PASSWORD;
        const result = controller.verifyPassword({ password });
        expect(result).toBe(true);
    });

    it('verifyPassword should return false if password is invalid', () => {
        const password = 'nikolay';
        const result = controller.verifyPassword({ password });
        expect(result).toBe(false);
    });
});
