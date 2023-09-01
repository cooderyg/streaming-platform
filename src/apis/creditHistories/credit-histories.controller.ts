import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CreditHistoriesService } from './credit-histories.service';
import { CreateCreditHistoryDto } from './dto/create-credit-history.dto';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import { CreditHistory } from './entities/credit-history.entity';
import { PageReqDto } from 'src/commons/dto/page-req.dto';

@Controller('/api/credit-histories')
export class CreditHistoriesController {
  constructor(
    private readonly creditHistoriesService: CreditHistoriesService,
  ) {}

  @UseGuards(AccessAuthGuard)
  @Post()
  async createCreditHistory(
    @Body() createCreditHistoryDto: CreateCreditHistoryDto,
    @User() user: UserAfterAuth,
  ): Promise<CreditHistory> {
    const creditHistory = await this.creditHistoriesService.createCreditHistory(
      { createCreditHistoryDto, userId: user.id },
    );
    return creditHistory;
  }

  @UseGuards(AccessAuthGuard)
  @Get()
  async findCreditHistoryList(
    @Query() { page, size }: PageReqDto,
    @User() user: UserAfterAuth,
  ): Promise<CreditHistory[]> {
    const creditHistoryList =
      await this.creditHistoriesService.findCreditHistoryList({
        page,
        size,
        userId: user.id,
      });
    return creditHistoryList;
  }

  @UseGuards(AccessAuthGuard)
  @Get('/:liveId')
  async findCreditHistoryListByLive(
    @User() user: UserAfterAuth,
    @Param('liveId') liveId: string,
  ) {
    const creditHistoryListByLive =
      await this.creditHistoriesService.findCreditHistoryListByLive({
        liveId,
        userId: user.id,
      });
    return creditHistoryListByLive;
  }
}
