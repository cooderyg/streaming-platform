import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LivesService } from './lives.service';
import { AccessAuthGuard } from 'src/apis/auth/guard/auth.guard';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';
import { CreateLiveDto } from './dto/create-live.dto';
import { UpdateLiveDto } from './dto/update-live.dto';

@Controller('api/lives')
export class LivesController {
  constructor(private readonly livesService: LivesService) {}

  /**
   * @todo
   * 메인페이지 라이브 방송목록 나열용 findAll 필요
   * 페이지네이션 적용 필요
   */

  @Get(':liveId')
  async getLiveById(@Param() params: { liveId: string }) {
    const live = await this.livesService.getLiveById(params.liveId);
    return live;
  }

  @UseGuards(AccessAuthGuard)
  @Post()
  async createLive(
    @Body() createLiveDto: CreateLiveDto,
    @User() user: UserAfterAuth,
  ) {
    const live = await this.livesService.createLive({
      userId: user.id,
      createLiveDto,
    });
    return live;
  }

  @UseGuards(AccessAuthGuard)
  @Put(':liveId')
  async updateLive(
    @Param() params: { liveId: string },
    @Body() updateLiveDto: UpdateLiveDto,
  ) {
    console.log(params);
    const live = await this.livesService.updateLive({
      liveId: params.liveId,
      updateLiveDto,
    });
    return live;
  }
}
