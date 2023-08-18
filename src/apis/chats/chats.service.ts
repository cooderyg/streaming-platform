import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from '../categories/dto/create-category.dto';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatsRepository: Repository<Chat>,
  ) {}

  async findChatsByLive({ userId, liveId }: IFindChatsByLive) {
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

interface ICreateChat {
  createChatDto: CreateChatDto;
  userId: string;
}

interface IFindChatsByLive {
  userId: string;
  liveId: string;
}
