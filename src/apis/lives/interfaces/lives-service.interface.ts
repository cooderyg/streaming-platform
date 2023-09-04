import { PageReqDto, SearchReqDto } from 'src/commons/dto/page-req.dto';
import { CreateLiveDto } from '../dto/create-live.dto';
import { UpdateLiveDto } from '../dto/update-live.dto';
import { DateReqDto } from 'src/commons/dto/date-req.dto';
import { Channel } from 'src/apis/channels/entities/channel.entity';
import { Live } from '../entities/live.entity';

export interface ILivesServiceGetLives {
  pageReqDto: PageReqDto;
}

export interface ILivesServiceGetLiveById {
  liveId: string;
}

export interface ILivesServiceGetReplaysByChannelId {
  channelId: string;
}

export interface ILivesServiceGetLivesForAdmin {
  userId: string;
  pageReqDto: PageReqDto;
}

export interface ILivesServiceGetLiveForAdmin {
  userId: string;
}

export interface ILivesServiceCreateLive {
  createLiveDto: CreateLiveDto;
  userId: string;
}

export interface ILivesServiceUpdateLive {
  updateLiveDto: UpdateLiveDto;
  userId: string;
  liveId: string;
}

export interface ILivesServiceStartLive {
  liveId: string;
}

export interface ILivesServiceAddThumbnail {
  thumbnailUrl: string;
  liveId: string;
}

export interface ILivesServiceTurnOff {
  userId: string;
  liveId: string;
}

export interface ILivesServiceCloseOBS {
  liveId: string;
}

export interface ILivesServiceGetLiveIncome {
  userId: string;
  dateReqDto: DateReqDto;
}

export interface ILivesServiceSearch {
  searchReqDto: SearchReqDto;
}

export interface ILivesServiceVerifyOwner {
  userId: string;
  liveId: string;
}

export interface ILivesServiceVerifyOwnerRetrun {
  channel: Channel;
  live: Live;
}
