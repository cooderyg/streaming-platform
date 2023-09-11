import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteBanUserDto {
  @IsNotEmpty()
  @IsString()
  email: string;
}
