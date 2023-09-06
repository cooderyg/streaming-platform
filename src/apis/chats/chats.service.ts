import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from './schemas/chat.schema';
import { Model } from 'mongoose';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat.name)
    private chatModel: Model<Chat>,
  ) {}

  async findChatByLiveId({ liveId }) {
    const chats = this.chatModel
      .find({ liveId })
      .sort({ createdAt: -1 })
      .limit(30);
    return chats;
  }

  async createChat(createChatDto: CreateChatDto): Promise<Chat> {
    const chat = new this.chatModel(createChatDto);
    return chat.save();
  }
}
