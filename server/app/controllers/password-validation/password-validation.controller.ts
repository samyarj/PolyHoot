import { VALID_PASSWORD } from '@app/constants/valid-password';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('validate-password')
export class PasswordValidationController {
    @Post()
    verifyPassword(@Body() body: { password: string }): boolean {
        return body.password === VALID_PASSWORD;
    }
}
