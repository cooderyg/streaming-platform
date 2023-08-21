import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Category } from 'src/apis/categories/entities/category.entity';

export class UpdateChannelDto {
  @IsString()
  name?: string;

  @IsArray()
  categoryIds?: string[];

  @IsString()
  profileImgUrl?: string;

  @IsString()
  bannerImgUrl?: string;
}
