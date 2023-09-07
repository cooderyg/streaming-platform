import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from './schemas/chat.schema';
import { Model } from 'mongoose';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChannelsService } from '../channels/channels.service';
import { LivesService } from '../lives/lives.service';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat.name)
    private chatModel: Model<Chat>,
    private readonly channelsService: ChannelsService,
    @Inject(forwardRef(() => LivesService))
    private readonly livesService: LivesService,
  ) {}

  async findChatByLiveId({ liveId }) {
    const chats = this.chatModel
      .find({ liveId })
      .sort({ createdAt: -1 })
      .limit(30);
    return chats;
  }

  async findChatByEmail({ userId, email }: IFindChatByEmail): Promise<Chat[]> {
    const channel = await this.channelsService.findByUserId({ userId });
    const lives = await this.livesService.getLivesByChannelId({
      channelId: channel.id,
    });

    const liveIds = lives.map((live) => live.id);
    const chats = this.chatModel
      .find({ liveId: { $in: liveIds }, email })
      .sort({ createdAt: 1 });
    return chats;
  }

  async createChat(createChatDto: CreateChatDto): Promise<Chat> {
    const chat = new this.chatModel(createChatDto);
    return chat.save();
  }
}

export interface IFindChatByEmail {
  userId: string;
  email: string;
}
