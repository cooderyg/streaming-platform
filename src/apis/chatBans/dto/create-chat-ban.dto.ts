import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChatBanDto {
  @IsNotEmpty()
  @IsString()
  userNickname: string;

  @IsString()
  reason: string;
}
