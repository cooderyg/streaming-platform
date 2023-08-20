import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateChannelManagerDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class DeleteChannelManagerDto {
  @IsNotEmpty()
  @IsUUID()
  managerId: string;
}
