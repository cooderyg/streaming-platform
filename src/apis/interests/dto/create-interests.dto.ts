import { IsArray, IsNotEmpty } from 'class-validator';

export class CreateInterestsDto {
  @IsNotEmpty()
  @IsArray()
  categoryIds: string[];
}
