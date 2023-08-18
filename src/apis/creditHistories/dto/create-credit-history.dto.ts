import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCreditHistoryDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  liveId: string;
}
