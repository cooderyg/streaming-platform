import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';
import {
  ICreateChat,
  IFindChatsByLive,
} from './interfaces/chats-service.interface';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatsRepository: Repository<Chat>,
  ) {}

  async findChatsByLive({ userId, liveId }: IFindChatsByLive): Promise<Chat[]> {
    const chats = await this.chatsRepository.find({
      where: { live: { id: liveId }, user: { id: userId } },
    });
    return chats;
  }

  async createChat({ userId, createChatDto }: ICreateChat): Promise<Chat> {
    const { content, liveId } = createChatDto;
    const chat = await this.chatsRepository.save({
      content,
      user: { id: userId },
      live: { id: liveId },
    });
    return chat;
  }
}
