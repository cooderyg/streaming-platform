import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChatDto {
  @IsNotEmpty()
  @IsString()
  liveId: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}
