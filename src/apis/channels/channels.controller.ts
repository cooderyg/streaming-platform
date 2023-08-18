import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';
import { SearchReqDto } from 'src/commons/dto/page-req.dto';

@Controller('/api/channels')
export class ChannelsController {
  constructor(
    private readonly channelsService: ChannelsService, //
  ) {}

  @Get('search')
  async searchChannels(@Query() searchReqDto: SearchReqDto) {
    const results = await this.channelsService.searchChannels(searchReqDto);
    return results;
  }

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
