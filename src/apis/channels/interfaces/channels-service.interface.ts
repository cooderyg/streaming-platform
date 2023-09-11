import { SearchReqDto } from 'src/commons/dto/page-req.dto';
import { CreateChannelDto } from '../dto/create-channel.dto';
import {
  DeleteChannelManagerDto,
  UpdateChannelManagerDto,
} from '../dto/update-channel-manager.dto';
import { UpdateChannelDto } from '../dto/update-channel.dto';

export interface IChannelsServiceGetMyChannel {
  userId: string;
}

export interface IChannelsServiceGetChannel {
  channelId: string;
}

export interface IChannelsServiceSearchChannels {
  searchReqDto: SearchReqDto;
}

export interface IChannelsServiceGetAllPlayTimes {
  userId: string;
}

export interface IChannelsServiceGetSubscribedChannels {
  userId: string;
}

export interface IChannelsServiceGetManagers {
  userId: string;
}

export interface IChannelsServiceGetManagersByChannelId {
  channelId: string;
}

export interface IChannelsServiceCreateChannel {
  createChannelDto: CreateChannelDto;
  userId: string;
}

export interface IChannelsServiceFindByUserId {
  userId: string;
}

export interface IChannelServiceUpdateChannel {
  userId: string;
  channelId: string;
  updateChannelDto: UpdateChannelDto;
}

export interface IChannelServiceUpdateChannelManager {
  userId: string;
  updateChannelManagerDto: UpdateChannelManagerDto;
}

export interface IChannelServiceSubtractManager {
  userId: string;
  deleteChannelManagerDto: DeleteChannelManagerDto;
}

export interface IChannelsServiceDeleteChannel {
  userId: string;
  channelId: string;
}
