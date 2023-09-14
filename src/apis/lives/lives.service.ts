import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelsService } from 'src/apis/channels/channels.service';
import { Live } from './entities/live.entity';
import { TagsService } from '../tags/tags.service';
import { CreditHistoriesService } from '../creditHistories/credit-histories.service';
import { Channel } from '../channels/entities/channel.entity';
import { EventsGateway } from '../events/events.gateway';
import {
  ILivesServiceAddThumbnail,
  ILivesServiceCloseOBS,
  ILivesServiceCreateLive,
  ILivesServiceGetLiveById,
  ILivesServiceGetLiveForAdmin,
  ILivesServiceGetLiveIncome,
  ILivesServiceGetLives,
  ILivesServiceGetLivesForAdmin,
  ILivesServiceGetRecentReplays,
  ILivesServiceGetReplaysByChannelId,
  ILivesServiceSearch,
  ILivesServiceStartLive,
  ILivesServiceUpdateLive,
  ILivesServiceVerifyOwner,
  ILivesServiceVerifyOwnerRetrun,
} from './interfaces/lives-service.interface';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { UsersService } from '../users/users.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { SubscribesService } from '../subscribes/subscribes.service';

@Injectable()
export class LivesService {
  constructor(
    @InjectRepository(Live)
    private readonly livesRepository: Repository<Live>,
    @InjectQueue('alertsQueue')
    private readonly alertsQueue: Queue,
    private readonly channelsService: ChannelsService,
    private readonly creditHistoriesService: CreditHistoriesService,
    private readonly dataSource: DataSource,
    private readonly eventsGateway: EventsGateway,
    private readonly subscribesService: SubscribesService,
    private readonly tagsService: TagsService,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly usersService: UsersService,
  ) {}
  async getLives({ pageReqDto }: ILivesServiceGetLives): Promise<Live[]> {
    const { page, size } = pageReqDto;
    const lives = await this.livesRepository
      .createQueryBuilder('live')
      .select([
        'live.id',
        'live.title',
        'live.createdAt',
        'channel.id',
        'channel.name',
        'tag.id',
        'tag.name',
        'user.id',
        'user.nickname',
        'user.imageUrl',
        'live.thumbnailUrl',
      ])
      .leftJoin('live.channel', 'channel')
      .leftJoin('live.tags', 'tag')
      .leftJoin('channel.user', 'user')
      .where('live.endDate IS NULL')
      .orderBy('live.createdAt', 'DESC')
      .take(size)
      .skip((page - 1) * size)
      .getMany();
    return lives;
  }

  async getLiveById({ liveId }: ILivesServiceGetLiveById): Promise<Live> {
    return await this.livesRepository
      .createQueryBuilder('live')
      .select([
        'live.id',
        'live.title',
        'live.income',
        'live.thumbnailUrl',
        'live.endDate',
        'live.replayUrl',
        'live.playtime',
        'live.createdAt',
        'live.updatedAt',
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

  async getLivesByChannelId({ channelId }) {
    return await this.livesRepository
      .createQueryBuilder('live')
      .select(['live.id', 'live.title', 'live.createdAt', 'channel.id'])
      .leftJoin('live.channel', 'channel')
      .where('channel.id = :id', { id: channelId })
      .getMany();
  }

  async getRecentReplays({ pageReqDto }: ILivesServiceGetRecentReplays) {
    const { page, size } = pageReqDto;
    const replays = await this.livesRepository
      .createQueryBuilder('live')
      .select([
        'live.id',
        'live.title',
        'live.createdAt',
        'live.thumbnailUrl',
        'tag.id',
        'tag.name',
        'channel.id',
        'channel.name',
        'user.id',
        'user.imageUrl',
      ])
      .leftJoin('live.channel', 'channel')
      .leftJoin('live.tags', 'tag')
      .leftJoin('channel.user', 'user')
      .where('live.endDate IS NOT NULL')
      .orderBy('live.createdAt', 'DESC')
      .take(size)
      .skip((page - 1) * size)
      .getMany();

    return replays;
  }

  async getReplaysByChannelId({
    channelId,
    pageReqDto,
  }: ILivesServiceGetReplaysByChannelId): Promise<Live[]> {
    const { page, size } = pageReqDto;
    return await this.livesRepository
      .createQueryBuilder('live')
      .select([
        'live.id',
        'live.title',
        'live.createdAt',
        'live.thumbnailUrl',
        'tag.name',
        'channel.id',
      ])
      .leftJoin('live.channel', 'channel')
      .leftJoin('live.tags', 'tag')
      .where('channel.id = :id', { id: channelId })
      .andWhere('live.endDate IS NOT NULL')
      .orderBy('live.createdAt', 'DESC')
      .take(size)
      .skip((page - 1) * size)
      .getMany();
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

  async getLiveForAdmin({
    userId,
  }: ILivesServiceGetLiveForAdmin): Promise<Live> {
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

  // 키워드 검색
  async searchLives({ searchReqDto }: ILivesServiceSearch): Promise<Live[]> {
    const { page, size, keyword } = searchReqDto;
    const lives = await this.livesRepository
      .createQueryBuilder('live')
      .select([
        'live.id',
        'live.title',
        'live.onAir',
        'live.thumbnailUrl',
        'live.createdAt',
        'tag.id',
        'tag.name',
        'channel.id',
        'channel.name',
        'category.id',
        'category.name',
      ])
      .leftJoin('live.channel', 'channel')
      .leftJoin('live.tags', 'tag')
      .leftJoin('channel.categories', 'category')
      .where('live.title like :keyword', { keyword: `%${keyword}%` })
      .orWhere('tag.name like :keyword', { keyword: `%${keyword}%` })
      .orWhere('channel.name like :keyword', { keyword: `%${keyword}%` })
      .orWhere('category.name like :keyword', { keyword: `%${keyword}%` })
      .take(size)
      .skip((page - 1) * size)
      .getMany();

    return lives;
  }

  async getElasticsearch({ keyword, page, size }) {
    try {
      const lives = await this.elasticsearchService.search({
        index: 'test13',
        size: size,
        from: (page - 1) * size,
        query: {
          bool: {
            must: {
              multi_match: {
                query: keyword,
                fields: ['title', 'tags', 'channel_name'],
              },
            },
            must_not: {
              exists: {
                field: 'end_date',
              },
            },
          },
        },
      });
      return lives;
    } catch (error) {
      throw new HttpException(
        error?.body?.error?.type || 'ES',
        error?.body?.status || 500,
      );
    }
  }

  async getElasticsearchReplaies({ keyword, page, size }) {
    try {
      const lives = await this.elasticsearchService.search({
        index: 'test13',
        size: size,
        from: (page - 1) * size,
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: keyword,
                  fields: ['title', 'tags', 'channel_name'],
                },
              },
              {
                exists: {
                  field: 'replay_url',
                },
              },
            ],
          },
        },
      });

      return lives;
    } catch (error) {
      throw new HttpException(
        error?.body?.error?.type || 'ES',
        error?.body?.status || 500,
      );
    }
  }

  async createLive({
    userId,
    createLiveDto,
  }: ILivesServiceCreateLive): Promise<Live> {
    const { title, ...createTagDto } = createLiveDto;
    const channel = await this.channelsService.findByUserId({ userId });
    const tags = await this.tagsService.createTags({ createTagDto });
    const live = await this.livesRepository.save({
      title,
      channel: { id: channel.id, name: channel.name },
      tags,
    });
    return live;
  }

  async startLive({ liveId }: ILivesServiceStartLive): Promise<void> {
    const live = await this.getLiveById({ liveId });
    if (!live) throw new NotFoundException();

    await this.livesRepository.save({
      ...live,
      onAir: true,
    });

    const subscribedUsersCount = await this.subscribesService.countByChannel({
      channelId: live.channel.id,
    });

    const size = 50;
    if (subscribedUsersCount > size) {
      for (let i = 0; i < subscribedUsersCount / size; i++) {
        const subscribedUsers = await this.usersService.findSubscribedUsers({
          channelId: live.channel.id,
          page: i + 1,
          size,
        });
        await this.alertsQueue.add(
          'addAlertsQueue',
          {
            channelId: live.channel.id,
            channelName: live.channel.name,
            users: subscribedUsers,
          },
          { removeOnComplete: true, removeOnFail: true },
        );
      }
    } else if (subscribedUsersCount > 0 && subscribedUsersCount <= size) {
      const subscribedUsers = await this.usersService.findSubscribedUsers({
        channelId: live.channel.id,
        page: 1,
        size,
      });
      await this.alertsQueue.add(
        'addAlertsQueue',
        {
          channelId: live.channel.id,
          channelName: live.channel.name,
          users: subscribedUsers,
        },
        { removeOnComplete: true, removeOnFail: true },
      );
    }

    this.eventsGateway.server.of('/').to(live.channel.id).emit('alert', {
      isOnAir: true,
      channelName: live.channel.name,
      profileImgUrl: live.channel.profileImgUrl,
    });
    this.eventsGateway.server.of('/').to(liveId).emit('startLive', { liveId });
  }

  // 썸네일 추가
  async addThumbnail({
    thumbnailUrl,
    liveId,
  }: ILivesServiceAddThumbnail): Promise<Live> {
    const live = await this.getLiveById({ liveId });
    console.log('service', live);
    const result = await this.livesRepository.save({
      ...live,
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

  async closeOBS({ liveId }: ILivesServiceCloseOBS): Promise<void> {
    const live = await this.getLiveById({ liveId });
    if (!live)
      throw new HttpException('라이브 아이디가 유효하지 않습니다.', 404);

    const now = new Date();
    const playtime = Math.floor(
      (now.getTime() - live.createdAt.getTime()) / 1000 / 60,
    );
    const channel = await this.channelsService.getOnlyChannel({
      channelId: live.channel.id,
    });

    // 트랜잭션
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const manager = queryRunner.manager;
    try {
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

      // 다시보기 url 등록(서버에서 수정 필요)
      live.replayUrl = `http://d2hv45obrzuf2s.cloudfront.net/videos/${liveId}/index.m3u8`;

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
  }: ILivesServiceVerifyOwner): Promise<ILivesServiceVerifyOwnerRetrun> {
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
}
