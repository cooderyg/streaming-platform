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

  /**
   * Live의 title, tag 변경을 위한 API 입니다.
   */
  @UseGuards(AccessAuthGuard)
  @Put(':liveId')
  async updateLiveInfo(
    @Param() params: { liveId: string },
    @Body() updateLiveDto: UpdateLiveDto,
    @User() user: UserAfterAuth,
  ) {
    const live = await this.livesService.updateLiveInfo({
      userId: user.id,
      liveId: params.liveId,
      updateLiveDto,
    });
    return live;
  }

  /**
   * @todo
   * [x] 방송 종료 시 해야할 일
   * [x] 종료 시간 업데이트
   * [x] 해당 방송에서 발생한 총 수익 책정
   * [x] 해당 방송을 오픈했던 채널의 총 수익 업데이트
   * [ ] 트랜잭션 적용 필요
   */
  @UseGuards(AccessAuthGuard)
  @Put(':liveId/turn-off')
  async turnOff(
    @Param() params: { liveId: string },
    @User() user: UserAfterAuth,
  ) {
    const live = await this.livesService.turnOff({
      userId: user.id,
      liveId: params.liveId,
    });
    return live;
  }

  /**
   * @todo
   * 방송종료 후 영상 업로드 관련 로직 작성해야함
   * 영상 편집(자르기)
   * 영상 업로드(S3)
   * 업로드 링크 획득 및 replay_url 업데이트
   */
}
