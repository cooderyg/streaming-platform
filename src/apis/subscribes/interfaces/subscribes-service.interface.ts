import { ToggleSubscribeDto } from '../dto/toggle-subscribe.dto';

export interface ISubscribesServiceToggleSubscribe {
  toggleSubscribeDto: ToggleSubscribeDto;
  userId: string;
}

export interface ISubscribesServiceFindByChannelIdAndUserId {
  channelId: string;
  userId: string;
}

export interface ISubscribesServiceCountByChannel {
  channelId: string;
}
