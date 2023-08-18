import { IsNotEmpty, IsString } from 'class-validator';

export class createViewHistoryDto {
  @IsNotEmpty()
  @IsString()
  liveId: string;
}
