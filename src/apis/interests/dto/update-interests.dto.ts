import { IsArray, IsNotEmpty } from 'class-validator';

export class UpdateInterestsDto {
  @IsNotEmpty()
  @IsArray()
  categoryIds: string[];
}
