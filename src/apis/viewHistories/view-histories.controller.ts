import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';
import { ViewHistoriesService } from './view-histories.service';
import { createViewHistoryDto } from './dto/create-view-history.dto';

@Controller('/api/view-histories')
export class ViewHistoriesController {
  constructor(private readonly viewHistoriesService: ViewHistoriesService) {}

  @UseGuards(AccessAuthGuard)
  @Get()
  async findViewHistoryList(@User() user: UserAfterAuth) {
    const viewHistory = await this.viewHistoriesService.findViewHistoryList({
      userId: user.id,
    });
    return viewHistory;
  }

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
