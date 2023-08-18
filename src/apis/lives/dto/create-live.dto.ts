import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateLiveDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsArray()
  tagNames: string[];
}
