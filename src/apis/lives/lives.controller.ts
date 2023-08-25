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
import { PageReqDto } from 'src/commons/dto/page-req.dto';
import { DateReqDto } from 'src/commons/dto/date-req.dto';
import { Live } from './entities/live.entity';

@Controller('api/lives')
export class LivesController {
  constructor(private readonly livesService: LivesService) {}

  /**
   * @todo
   * 메인페이지 라이브 방송목록 나열용 findAll 필요
   * 페이지네이션 적용 필요
   * 정렬 기준이 필요함(현재 접속자 수 기준 등)
   * 종료된 방송을 띄우면 안됨
   */
  @Get()
  async getLives(@Query() pageReqDto: PageReqDto) {
    const lives = await this.livesService.getLives({ pageReqDto });
    return lives;
  }

  @Get(':liveId')
  async getLiveById(@Param() params: { liveId: string }) {
    const live = await this.livesService.getLiveById({ liveId: params.liveId });
    return live;
  }

  @UseGuards(AccessAuthGuard)
  @Get('admin/sales')
  async getLivesForAdmin(
    @User() user: UserAfterAuth,
    @Query() pageReqDto: PageReqDto,
  ): Promise<Live[]> {
    const lives = await this.livesService.getLivesForAdmin({
      userId: user.id,
      pageReqDto,
    });

    return lives;
  }

  @UseGuards(AccessAuthGuard)
  @Get('income/monthly-income')
  async getLiveIncome(
    @User() user: UserAfterAuth,
    @Query() dateReqDto: DateReqDto,
  ): Promise<{ income: number }> {
    const income = await this.livesService.getLiveIncome({
      userId: user.id,
      dateReqDto,
    });
    return income;
  }

  @UseGuards(AccessAuthGuard)
  @Get('admin/control')
  async getLiveAdmin(@User() user: UserAfterAuth): Promise<Live> {
    const live = await this.livesService.getLiveForAdmin({ userId: user.id });

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

  @Post('/start/:liveId')
  async startLive(@Param('liveId') liveId: string) {
    console.log(liveId);
    console.log('미디어 서버에서 왔어요');
    this.livesService.startLive({ liveId });
    return { message: '전달완료' };
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
   * [x] 트랜잭션 적용 필요
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

  @Put(':liveId/close-obs')
  async closeOBS(
    @Param('liveId') liveId: string,
  ): Promise<{ message: string }> {
    await this.livesService.closeOBS({ liveId });
    console.log('방송종료');
    return { message: '종료 완료' };
  }

  /**
   * @todo
   * 방송종료 후 영상 업로드 관련 로직 작성해야함
   * 영상 편집(자르기)
   * 영상 업로드(S3)
   * 업로드 링크 획득 및 replay_url 업데이트
   */
}
