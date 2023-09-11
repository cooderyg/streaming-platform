import { IsNotEmpty, IsString } from 'class-validator';

export class FindChatBanDto {
  @IsNotEmpty()
  @IsString()
  userEmail: string;
}
