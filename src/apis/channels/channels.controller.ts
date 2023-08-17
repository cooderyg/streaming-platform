import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';

@Controller('/api/channels')
export class ChannelsController {
  constructor(
    private readonly channelsService: ChannelsService, //
  ) {}
  @UseGuards(AccessAuthGuard)
  @Post()
  async createChannel(
    @Body() createChannelDto: CreateChannelDto, //
    @User() user: UserAfterAuth,
  ) {
    const channel = await this.channelsService.createChannel({
      createChannelDto,
      userId: user.id,
    });
    return channel;
  }
}
