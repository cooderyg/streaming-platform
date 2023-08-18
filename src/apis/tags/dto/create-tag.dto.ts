import { IsArray, IsNotEmpty } from 'class-validator';

export class CreateTagDto {
  @IsNotEmpty()
  @IsArray()
  tagNames: string[];
}
