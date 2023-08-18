import { IsNotEmpty, IsUUID } from 'class-validator';

export class ToggleSubscribeDto {
  @IsNotEmpty()
  @IsUUID()
  channelId: string;
}
