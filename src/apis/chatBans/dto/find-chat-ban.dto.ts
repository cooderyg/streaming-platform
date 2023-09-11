import { IsNotEmpty, IsString } from 'class-validator';

export class FindChatBanDto {
  @IsNotEmpty()
  @IsString()
  email: string;
}
