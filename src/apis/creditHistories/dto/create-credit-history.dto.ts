import {
  IsNotEmpty,
  IsNumber,
  IsString,
  isNotEmpty,
  isString,
} from 'class-validator';

export class CreateCreditHistoryDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  liveId: string;
}
