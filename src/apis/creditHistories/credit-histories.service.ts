import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreditHistory } from './entities/credit-history.entity';
import { Repository, DataSource } from 'typeorm';
import { ChannelsService } from '../channels/channels.service';
import { UsersService } from '../users/users.service';
import {
  ICreaditHistoriesServiceCreateCreditHistory,
  ICreaditHistoriesServiceFindByLiveId,
  ICreaditHistoriesServiceFindCreditHistoryByChannel,
  ICreditHistoriesServiceFindCreditHistoryListByLive,
  ICreditHistoriesServiceFindCreditHistroyList,
} from './interfaces/creditHistories-service.interface';

@Injectable()
export class CreditHistoriesService {
  constructor(
    @InjectRepository(CreditHistory)
    private readonly creditHistoriesRepository: Repository<CreditHistory>,
    private readonly channelsService: ChannelsService,
    private readonly usersService: UsersService,
    private readonly datasource: DataSource,
  ) {}

  async createCreditHistory({
    createCreditHistoryDto,
    userId,
  }: ICreaditHistoriesServiceCreateCreditHistory): Promise<CreditHistory> {
    const { amount, liveId } = createCreditHistoryDto;
    const user = await this.usersService.findById({ userId });

    if (user.credit < amount)
      throw new ConflictException('후원금액보다 가진 돈이 적습니다.');

    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const manager = queryRunner.manager;
    try {
      const creditHistory = await this.creditHistoriesRepository.save({
        amount,
        live: { id: liveId },
        user: { id: userId },
      });
      await this.usersService.updateCreditWithManager({
        manager,
        user,
        amount,
        isDecrement: true,
      });
      await queryRunner.commitTransaction();
      return creditHistory;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, error.status || 500);
    } finally {
      await queryRunner.release();
    }
  }

  async findCreditHistoryList({
    userId,
    page,
    size,
  }: ICreditHistoriesServiceFindCreditHistroyList) {
    const creditHistoryList = await this.creditHistoriesRepository
      .createQueryBuilder('creditHistory')
      .select([
        'creditHistory.id',
        'creditHistory.amount',
        'creditHistory.createdAt',
        'live.id',
        'channel.id',
        'channel.name',
        'channel.profileImgUrl',
      ])
      .leftJoin('creditHistory.live', 'live')
      .leftJoin('creditHistory.user', 'user')
      .leftJoin('live.channel', 'channel')
      .where('user.id = :userId', { userId })
      .orderBy('creditHistory.createdAt', 'DESC')
      .take(size)
      .skip((page - 1) * size)
      .getMany();
    return creditHistoryList;
  }

  // 해당 방송의 크레딧 사용내역 조회(스트리머)
  async findCreditHistoryListByLive({
    liveId,
    userId,
  }: ICreditHistoriesServiceFindCreditHistoryListByLive) {
    const channel = await this.channelsService.findByUserId({ userId });
    if (!channel)
      throw new NotFoundException(
        '채널을 보유한 스트리머만 방송별 수익 조회가 가능합니다.',
      );
    // TODO : liveId로 방송 조회 후 방송 채널의 userId와 넘겨받은 userId 일치하는지 확인
    const creditHistoryListByLive = await this.findByLiveId({ liveId });
    return creditHistoryListByLive;
  }

  async findByLiveId({
    liveId,
  }: ICreaditHistoriesServiceFindByLiveId): Promise<CreditHistory[]> {
    const creditHistoryListByLive = await this.creditHistoriesRepository.find({
      where: { live: { id: liveId } },
    });
    return creditHistoryListByLive;
  }

  async findCreditHistoryByChannel({
    channelId,
  }: ICreaditHistoriesServiceFindCreditHistoryByChannel): Promise<
    CreditHistory[]
  > {
    const creditHistoryLiist = await this.creditHistoriesRepository
      .createQueryBuilder('history')
      .select([
        'history.id',
        'live.id',
        'user.id',
        'user.nickname',
        'user.imageUrl',
        'channel.id',
      ])
      .addSelect('SUM(history.amount)', 'total_amount')
      .leftJoin('history.live', 'live')
      .leftJoin('history.user', 'user')
      .leftJoin('live.channel', 'channel')
      .where('channel.id = :id', { id: channelId })
      .groupBy('user.nickname')
      .orderBy('total_amount', 'DESC')
      .limit(5)
      .getRawMany();
    return creditHistoryLiist;
  }
}
