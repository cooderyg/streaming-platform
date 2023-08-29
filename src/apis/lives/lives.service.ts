import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLiveDto } from './dto/create-live.dto';
import { ChannelsService } from 'src/apis/channels/channels.service';
import { Live } from './entities/live.entity';
import { TagsService } from '../tags/tags.service';
import { UpdateLiveDto } from './dto/update-live.dto';
import { CreditHistoriesService } from '../creditHistories/credit-histories.service';
import { Channel } from '../channels/entities/channel.entity';
import { PageReqDto } from 'src/commons/dto/page-req.dto';
import { DateReqDto } from 'src/commons/dto/date-req.dto';
import { EventsGateway } from '../events/events.gateway';
import { UsersService } from '../users/users.service';
import { AlertsService } from '../alerts/alerts.service';

@Injectable()
export class LivesService {
  constructor(
    @InjectRepository(Live)
    private readonly livesRepository: Repository<Live>,
    private readonly alertsService: AlertsService,
    private readonly channelsService: ChannelsService,
    private readonly creditHistoriesService: CreditHistoriesService,
    private readonly dataSource: DataSource,
    private readonly eventsGateway: EventsGateway,
    private readonly tagsService: TagsService,
    private readonly usersService: UsersService,
  ) {}

  async getLives({ pageReqDto }) {
    const { page, size } = pageReqDto;
    const lives = await this.livesRepository
      .createQueryBuilder('live')
      .select([
        'live.id',
        'live.title',
        'channel.id',
        'channel.name',
        'tag.id',
        'tag.name',
        'user.id',
        'user.nickname',
        'user.imageUrl',
      ])
      .where('live.endDate IS NULL')
      .leftJoin('live.channel', 'channel')
      .leftJoin('live.tags', 'tag')
      .leftJoin('channel.user', 'user')
      .take(size)
      .skip((page - 1) * size)
      .getMany();
    return lives;
  }
  async getLiveById({ liveId }) {
    return await this.livesRepository
      .createQueryBuilder('live')
      .select([
        'live.id',
        'live.title',
        'live.createdAt',
        'tag.id',
        'tag.name',
        'channel.id',
        'channel.name',
        'channel.profileImgUrl',
        'channel.bannerImgUrl',
      ])
      .leftJoin('live.tags', 'tag')
      .leftJoin('live.channel', 'channel')
      .where('live.id = :id', { id: liveId })
      .getOne();
  }

  async getLivesForAdmin({
    userId,
    pageReqDto,
  }: ILivesServiceGetLivesForAdmin): Promise<Live[]> {
    const { page, size } = pageReqDto;
    const lives = await this.livesRepository
      .createQueryBuilder('live')
      .select(['live.id', 'live.income', 'live.title', 'live.createdAt'])
      .leftJoin('live.channel', 'channel')
      .leftJoin('channel.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('live.createdAt', 'DESC')
      .take(size)
      .skip((page - 1) * size)
      .getMany();
    return lives;
  }

  async getLiveForAdmin({ userId }) {
    const live = await this.livesRepository
      .createQueryBuilder('live')
      .leftJoinAndSelect('live.channel', 'channel')
      .leftJoinAndSelect('channel.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('live.endDate IS NULL')
      .getOne();

    if (!live) throw new NotFoundException();

    return live;
  }

  async getLiveIncome({
    userId,
    dateReqDto,
  }: ILivesServiceGetLiveIncome): Promise<{ income: number }> {
    const channel = await this.channelsService.findByUserId({ userId });
    const { year, month } = dateReqDto;
    const result = await this.livesRepository
      .createQueryBuilder('live')
      .select('SUM(live.income)', 'income')
      .leftJoin('live.channel', 'channel')
      .where('channel.id = :channelId', {
        channelId: channel.id,
        year,
        month,
      })
      .getRawOne();
    if (result.income === null) {
      result.income = 0;
    }
    return result;
  }

  async createLive({ userId, createLiveDto }: ILivesServiceCreateLive) {
    const { title, ...createTagDto } = createLiveDto;
    const channel = await this.channelsService.findByUserId({ userId });
    const tags = await this.tagsService.createTags({ createTagDto });
    const live = await this.livesRepository.save({
      title,
      channel: { id: channel.id },
      tags,
    });
    return live;
  }

  async startLive({ liveId }) {
    const live = await this.getLiveById({ liveId });

    if (!live) throw new NotFoundException();

    await this.livesRepository.save({
      id: liveId,
      onAir: true,
    });
    live.channel.id;
    const subscribedUsers = await this.usersService.findSubscribedUsers({
      channelId: live.channel.id,
    });

    if (subscribedUsers?.length > 0) {
      await this.alertsService.createAlerts({
        users: subscribedUsers,
        channelId: live.channel.id,
        isOnAir: true,
        channelName: live.channel.name,
      });
    }

    this.eventsGateway.server.of('/').to(liveId).emit('startLive', { liveId });

    // const streamer = this.eventsGateway.onAirStreamers.find(
    //   (el) => el.liveId === liveId,
    // );
    // this.eventsGateway.server
    //   .to(streamer?.socket?.id)
    //   .emit('startLive', { liveId });
  }

  // 썸네일 추가
  async addThumbnail({ thumbnailUrl, liveId }) {
    const result = await this.livesRepository.save({
      id: liveId,
      thumbnailUrl,
    });
    return result;
  }

  async updateLiveInfo({
    userId,
    liveId,
    updateLiveDto,
  }: ILivesServiceUpdateLive): Promise<Live> {
    const { title, ...createTagDto } = updateLiveDto;
    const { live } = await this.verifyOwner({ userId, liveId });

    // 태그 생성 및 적용
    const tags = await this.tagsService.createTags({ createTagDto });
    live.title = title;
    live.tags = tags;
    return await this.livesRepository.save(live);
  }

  async turnOff({ userId, liveId }: ILivesServiceTurnOff) {
    const { channel, live } = await this.verifyOwner({ userId, liveId });

    // 트랜잭션
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const manager = queryRunner.manager;
    try {
      // 종료 시간을 업데이트 합니다.
      live.endDate = new Date();

      // 방송 정산하기
      const creditHistories =
        await this.creditHistoriesService.findCreditHistoryListByLive({
          liveId,
          userId,
        });
      const totalLiveIncome = creditHistories.reduce(
        (acc, history) => acc + history.amount,
        0,
      );
      live.income = totalLiveIncome;

      // 채널 정산하기
      channel.income += totalLiveIncome;

      await manager.save(Live, live);
      await manager.save(Channel, channel);
      await queryRunner.commitTransaction();
      return { message: '방송이 종료되었습니다.' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async closeOBS({ liveId }): Promise<void> {
    const live = await this.getLiveById({ liveId });
    const now = new Date();
    const playtime = Math.floor(
      (now.getTime() - live.createdAt.getTime()) / 1000 / 60,
    );
    console.log('플레이타임', playtime);
    const channel = await this.channelsService.getChannel({
      channelId: live.channel.id,
    });

    // 트랜잭션
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const manager = queryRunner.manager;
    try {
      // 종료 시간을 업데이트 합니다.

      // 방송 정산하기
      const creditHistories = await this.creditHistoriesService.findByLiveId({
        liveId,
      });
      const totalLiveIncome = creditHistories.reduce(
        (acc, history) => acc + history.amount,
        0,
      );
      // 채널 정산하기
      const totalChannelIncome = channel.income + totalLiveIncome;

      await manager.save(Live, {
        ...live,
        endDate: new Date(),
        income: totalLiveIncome,
        onAir: false,
        playtime,
      });
      await manager.save(Channel, {
        ...channel,
        income: totalChannelIncome,
      });
      await queryRunner.commitTransaction();

      this.eventsGateway.server.to(liveId).emit('endLive', { liveId });
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async verifyOwner({
    userId,
    liveId,
  }): Promise<{ channel: Channel; live: Live }> {
    const channel = await this.channelsService.findByUserId({ userId });
    const live = await this.livesRepository.findOne({
      where: { id: liveId },
      relations: ['channel'],
    });
    if (channel.id !== live.channel.id)
      throw new UnauthorizedException('채널 주인만 방송 수정이 가능합니다.');

    if (live.endDate)
      throw new ConflictException('이미 방송이 종료되었습니다.');

    return { channel, live };
  }

  /**
   * @todo
   * 방송 종료 시 replayUrl을 업데이트 하는 로직 작성
   */
}

interface ILivesServiceGetLivesForAdmin {
  userId: string;
  pageReqDto: PageReqDto;
}

interface ILivesServiceCreateLive {
  createLiveDto: CreateLiveDto;
  userId: string;
}

interface ILivesServiceUpdateLive {
  updateLiveDto: UpdateLiveDto;
  userId: string;
  liveId: string;
}

interface ILivesServiceTurnOff {
  userId: string;
  liveId: string;
}

interface ILivesServiceGetLiveIncome {
  userId: string;
  dateReqDto: DateReqDto;
}
