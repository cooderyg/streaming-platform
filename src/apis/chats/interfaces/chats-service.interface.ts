import { CreateChatDto } from '../dto/create-chat.dto';

export interface ICreateChat {
  createChatDto: CreateChatDto;
  userId: string;
}

export interface IFindChatsByLive {
  userId: string;
  liveId: string;
}

export interface IChat {
  createChatDto: CreateChatDto;
}
