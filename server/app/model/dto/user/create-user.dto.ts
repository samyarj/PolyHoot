import { PASSWORD_MIN_LENGTH } from '@app/constants';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(PASSWORD_MIN_LENGTH)
    password: string;
}
