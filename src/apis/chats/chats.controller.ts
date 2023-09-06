import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatsService } from './chats.service';
import { Chat } from './schemas/chat.schema';

@Controller('/api/chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get(':liveId')
  async findChatByLiveId(@Param() live): Promise<Chat[]> {
    const chats = await this.chatsService.findChatByLiveId({
      liveId: live.liveId,
    });
    return chats;
  }
}
