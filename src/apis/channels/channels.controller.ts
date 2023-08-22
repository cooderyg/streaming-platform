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
import {
  DeleteChannelManagerDto,
  UpdateChannelManagerDto,
} from './dto/update-channel-manager.dto';
import { Channel } from './entities/channel.entity';

@Controller('/api/channels')
export class ChannelsController {
  constructor(
    private readonly channelsService: ChannelsService, //
  ) {}

  // 나의 채널 조회
  @UseGuards(AccessAuthGuard)
  @Get()
  async getMyChannel(
    @User() user: UserAfterAuth, //
  ): Promise<Channel> {
    const channel = await this.channelsService.getMyChannel({
      userId: user.id,
    });
    return channel;
  }

  // 채널 조회
  @Get('/:channelId')
  async getChannel(@Param('channelId') channelId: string) {
    const channel = await this.channelsService.getChannel({
      channelId,
    });
    return channel;
  }

  // 채널 검색
  @Get('search')
  async searchChannels(@Query() searchReqDto: SearchReqDto) {
    const results = await this.channelsService.searchChannels(searchReqDto);
    return results;
  }

  @UseGuards(AccessAuthGuard)
  @Get('admin/managers')
  async getManagers(@User() user: UserAfterAuth) {
    console.log(user);
    const managers = await this.channelsService.getManagers({
      userId: user.id,
    });

    return managers;
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
    console.log(updateChannelDto);
    const result = await this.channelsService.updateChannel({
      userId: user.id,
      channelId,
      updateChannelDto,
    });
    return result;
  }

  // 채널 매니저 추가
  @UseGuards(AccessAuthGuard)
  @Put('/manager-addition')
  async addManager(
    @Body() updateChannelManagerDto: UpdateChannelManagerDto,
    @User() user: UserAfterAuth,
  ) {
    const result = await this.channelsService.addManager({
      userId: user.id,
      updateChannelManagerDto,
    });
    return result;
  }

  // 채널 매니저 삭제
  @UseGuards(AccessAuthGuard)
  @Put('/manager-subtraction')
  async subtractManager(
    @Body() deleteChannelManagerDto: DeleteChannelManagerDto,
    @User() user: UserAfterAuth,
  ) {
    await this.channelsService.subtractManager({
      userId: user.id,
      deleteChannelManagerDto,
    });
    return { ok: true };
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

    return result;
  }
}
