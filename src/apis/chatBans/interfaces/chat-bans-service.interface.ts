import { CreateChatBanDto } from '../dto/create-chat-ban.dto';
import { DeleteBanUserDto } from '../dto/delete-ban-user.dto';
import { FindChatBanDto } from '../dto/find-chat-ban.dto';

export interface IChatBansServiceFindChatBan {
  userId: string;
  channelId: string;
}

export interface IChatBansServiceChatBanUser {
  userId: string;
  channelId: string;
  createChatBanDto: CreateChatBanDto;
}

export interface IChatBansServiceFindChatBanUser {
  userId: string;
  channelId: string;
  email: string;
}

export interface IChatBansServiceDeleteBanUser {
  userId: string;
  channelId: string;
  email: string;
}
