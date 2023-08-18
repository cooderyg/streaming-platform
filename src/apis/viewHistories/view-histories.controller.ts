import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';
import { ViewHistoriesService } from './view-histories.service';
import { createViewHistoryDto } from './dto/create-view-history.dto';
import { UpdateChannelDto } from '../channels/dto/update-channel.dto';

@Controller('/api/view-histories')
export class ViewHistoriesController {
  constructor(private readonly viewHistoriesService: ViewHistoriesService) {}

  // 채널 검색
  @UseGuards(AccessAuthGuard)
  @Get()
  async findViewHistoryList(@User() user: UserAfterAuth) {
    const viewHistory = await this.viewHistoriesService.findViewHistoryList({
      userId: user.id,
    });
    return viewHistory;
  }

  // 채널 정보 업데이트
  @UseGuards(AccessAuthGuard)
  @Put()
  async updateChannel(@Body() updateChannelDto: UpdateChannelDto) {}

  @UseGuards(AccessAuthGuard)
  @Post()
  async createViewHistory(
    @User() user: UserAfterAuth,
    @Body() createViewHistoryDto: createViewHistoryDto,
  ) {
    const viewHistory = await this.viewHistoriesService.createViewHistory({
      userId: user.id,
      createViewHistoryDto,
    });
    return viewHistory;
  }
}
