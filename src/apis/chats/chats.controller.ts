import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatsService } from './chats.service';
import { Chat } from './entities/chat.entity';

@Controller('/api/chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @UseGuards(AccessAuthGuard)
  @Get('/:liveId')
  async findChatsByLive(
    @Param('liveId') liveId: string,
    @User() user: UserAfterAuth,
  ): Promise<Chat[]> {
    const chats = await this.chatsService.findChatsByLive({
      userId: user.id,
      liveId,
    });
    return chats;
  }

  @UseGuards(AccessAuthGuard)
  @Post()
  async createChat(
    @User() user: UserAfterAuth,
    @Body() createChatDto: CreateChatDto,
  ): Promise<Chat> {
    const chat = await this.chatsService.createChat({
      userId: user.id,
      createChatDto,
    });
    return chat;
  }
}
