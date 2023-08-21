import { Transform } from 'class-transformer';
import { IsInt } from 'class-validator';

export class DateReqDto {
  @Transform((param) => Number(param.value))
  @IsInt()
  year?: number = new Date().getFullYear();

  @Transform((param) => Number(param.value))
  @IsInt()
  month?: number = new Date().getMonth() + 1;
}
