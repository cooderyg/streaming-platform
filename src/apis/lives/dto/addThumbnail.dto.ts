import { IsString } from 'class-validator';

export class AddThumbNailDto {
  @IsString()
  thumbnailUrl: string;
}
