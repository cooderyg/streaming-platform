import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class VerifyEmailDto {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(30)
  email: string;
}
