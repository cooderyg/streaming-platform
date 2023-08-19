import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  nickname: string;

  @IsString()
  imageUrl: string;
}
