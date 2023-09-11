import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';
import { ChatBan } from './entities/chatBans.entity';
import { CreateChatBanDto } from './dto/create-chat-ban.dto';
import { ChatBanService } from './chatBans.service';
import { DeleteBanUserDto } from './dto/delete-ban-user.dto';
import { FindChatBanDto } from './dto/find-chat-ban.dto';

@Controller('/api/channel/:channelId/ban')
export class ChatBanController {
  constructor(private readonly chatBansService: ChatBanService) {}

  @UseGuards(AccessAuthGuard)
  @Get()
  async findChatBanByChannel(
    @Param('channelId') channelId: string,
    @User() user: UserAfterAuth,
  ): Promise<ChatBan[]> {
    const chatBans = await this.chatBansService.findChatBan({
      userId: user.id,
      channelId,
    });
    return chatBans;
  }

  @UseGuards(AccessAuthGuard)
  @Get('/user')
  async findChatBanUserByChannel(
    @Param('channelId') channelId: string,
    @User() user: UserAfterAuth,
    @Body() findChatBanDto: FindChatBanDto,
  ): Promise<ChatBan> {
    const banUser = await this.chatBansService.findChatBanUser({
      userId: user.id,
      channelId,
      findChatBanDto,
    });
    return banUser;
  }

  @UseGuards(AccessAuthGuard)
  @Post()
  async chatBanUser(
    @User() user: UserAfterAuth,
    @Param('channelId') channelId: string,
    @Body() createChatBanDto: CreateChatBanDto,
  ): Promise<ChatBan> {
    const chatBanUser = await this.chatBansService.chatBanUser({
      userId: user.id,
      channelId,
      createChatBanDto,
    });
    return chatBanUser;
  }

  @UseGuards(AccessAuthGuard)
  @Put()
  async banUserDelete(
    @User() user: UserAfterAuth,
    @Param('channelId') channelId: string,
    @Body() deleteBanUserDto: DeleteBanUserDto,
  ): Promise<string> {
    return await this.chatBansService.banUserDelete({
      userId: user.id,
      channelId,
      deleteBanUserDto,
    });
  }
}
