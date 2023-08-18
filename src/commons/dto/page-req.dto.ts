import { Transform } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

export class PageReqDto {
  @Transform((param) => Number(param.value))
  @IsInt()
  page?: number = 1;

  @Transform((param) => Number(param.value))
  @IsInt()
  size?: number = 20;
}

export class SearchReqDto extends PageReqDto {
  @IsString()
  keyword: string;
}
