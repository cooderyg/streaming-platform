import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';
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

  @UseGuards(AccessAuthGuard)
  @Get('search/:email')
  async findChatByEmail(
    @User() user: UserAfterAuth,
    @Param('email') email: string,
  ): Promise<Chat[]> {
    console.log(email);
    const chats = await this.chatsService.findChatByEmail({
      userId: user.id,
      email,
    });
    return chats;
  }
}
