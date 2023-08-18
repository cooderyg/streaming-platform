import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';
import { SearchReqDto } from 'src/commons/dto/page-req.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Controller('/api/channels')
export class ChannelsController {
  constructor(
    private readonly channelsService: ChannelsService, //
  ) {}

  // 채널 검색
  @Get('search')
  async searchChannels(@Query() searchReqDto: SearchReqDto) {
    const results = await this.channelsService.searchChannels(searchReqDto);
    return results;
  }

  // 채널 생성
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

  // 채널 정보 업데이트
  @UseGuards(AccessAuthGuard)
  @Put('/update/:channelId')
  async updateChannel(
    @Param('channelId') channelId: string,
    @Body() updateChannelDto: UpdateChannelDto,
    @User() user: UserAfterAuth,
  ) {
    const result = await this.channelsService.updateChannel({
      userId: user.id,
      channelId,
      updateChannelDto,
    });
    return result;
  }

  // 채널 폐쇄
  @UseGuards(AccessAuthGuard)
  @Delete('/:channelId')
  async deleteChannel(
    @Param('channelId') channelId: string,
    @User() user: UserAfterAuth,
  ) {
    const result = await this.channelsService.deleteChannel({
      userId: user.id,
      channelId,
    });
  }
}
