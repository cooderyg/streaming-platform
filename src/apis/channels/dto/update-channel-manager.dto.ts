import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateChannelManagerDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
