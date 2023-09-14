import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { LivesService } from './lives.service';
import { AccessAuthGuard } from 'src/apis/auth/guard/auth.guard';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';
import { CreateLiveDto } from './dto/create-live.dto';
import { UpdateLiveDto } from './dto/update-live.dto';
import { PageReqDto, SearchReqDto } from 'src/commons/dto/page-req.dto';
import { DateReqDto } from 'src/commons/dto/date-req.dto';
import { Live } from './entities/live.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GetLiveIncomeResDto } from './dto/res.dto';
import { MessageResDto } from 'src/commons/dto/message-res.dto';
import { AddThumbNailDto } from './dto/addThumbnail.dto';

@Controller('api/lives')
export class LivesController {
  constructor(
    private readonly livesService: LivesService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  async getLives(@Query() pageReqDto: PageReqDto): Promise<Live[]> {
    const { size, page } = pageReqDto;
    const cachedList: Live[] = await this.cacheManager.get(`liveList${page}`); // 캐싱된 리스트가 있는지 조회
    if (cachedList) {
      return cachedList;
    } else {
      const lives = await this.livesService.getLives({ pageReqDto });
      await this.cacheManager.set(`liveList${page}`, lives, 5); // 캐싱된 데이터가 없을경우 set
      return lives;
    }
  }
  @Get('replay')
  async getRecentReplays(@Query() pageReqDto: PageReqDto): Promise<Live[]> {
    const replays = await this.livesService.getRecentReplays({
      pageReqDto,
    });
    return replays;
  }

  @Get('replay/:channelId')
  async getReplays(
    @Param() params: { channelId: string },
    @Query() pageReqDto: PageReqDto,
  ): Promise<Live[]> {
    const replays = await this.livesService.getReplaysByChannelId({
      channelId: params.channelId,
      pageReqDto,
    });
    return replays;
  }

  @Get(':liveId')
  async getLiveById(@Param() params: { liveId: string }): Promise<Live> {
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
  ): Promise<GetLiveIncomeResDto> {
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

  @Get('search/keywords')
  async getSearchLives(@Query() searchReqDto: SearchReqDto): Promise<Live[]> {
    const lives = await this.livesService.searchLives({ searchReqDto });
    return lives;
  }

  @Get('search/elastic-search')
  async getElasticSearch(@Query() searchReqDto: SearchReqDto) {
    const { keyword, page, size } = searchReqDto;

    const lives = await this.livesService.getElasticsearch({
      keyword,
      page,
      size,
    });

    return lives;
  }

  @Get('search/elastic-search/replaies')
  async getElasticSearchReplays(@Query() searchReqDto: SearchReqDto) {
    const { keyword, page, size } = searchReqDto;

    const lives = await this.livesService.getElasticsearchReplaies({
      keyword,
      page,
      size,
    });
    return lives;
  }

  @UseGuards(AccessAuthGuard)
  @Post()
  async createLive(
    @Body() createLiveDto: CreateLiveDto,
    @User() user: UserAfterAuth,
  ): Promise<Live> {
    const live = await this.livesService.createLive({
      userId: user.id,
      createLiveDto,
    });
    return live;
  }

  // // 추후 삭제 필요 (더미 생성용)
  // @Post('dummy')
  // async createLiveDummy(
  //   @Body('userId') userId: string,
  //   @Body('title') title: string,
  //   @Body('tagNames') tagNames: string[],
  // ): Promise<Live> {
  //   const createLiveDto = { title, tagNames };
  //   const live = await this.livesService.createLive({
  //     userId,
  //     createLiveDto,
  //   });
  //   return live;
  // }

  @Post('/start/:liveId')
  async startLive(@Param('liveId') liveId: string): Promise<MessageResDto> {
    await this.livesService.startLive({ liveId });
    return { message: '전달완료' };
  }

  // 썸네일 업로드 시 URL 추가
  @Put(':liveId/thumbnails')
  async addThumbnail(
    @Body() addThumbnailDto: AddThumbNailDto,
    @Param('liveId') liveId: string,
  ): Promise<Live> {
    const { thumbnailUrl } = addThumbnailDto;
    const result = await this.livesService.addThumbnail({
      thumbnailUrl,
      liveId,
    });
    return result;
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
  ): Promise<Live> {
    const live = await this.livesService.updateLiveInfo({
      userId: user.id,
      liveId: params.liveId,
      updateLiveDto,
    });
    return live;
  }

  @Put(':liveId/close-obs')
  async closeOBS(@Param('liveId') liveId: string): Promise<MessageResDto> {
    await this.livesService.closeOBS({ liveId });
    return { message: '방송 종료 완료' };
  }
}
