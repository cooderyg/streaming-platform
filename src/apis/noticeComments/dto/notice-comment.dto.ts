import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNoticeCommentDto {
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class PutNoticeCommentDto extends CreateNoticeCommentDto {}
