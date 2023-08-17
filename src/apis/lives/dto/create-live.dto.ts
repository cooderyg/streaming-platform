import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLiveDto {
  @IsNotEmpty()
  @IsString()
  title: string;
}
