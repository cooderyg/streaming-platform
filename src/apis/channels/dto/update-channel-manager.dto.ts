import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateChannelManagerDto {
  @IsNotEmpty()
  @IsString()
  managerId: string;
}
