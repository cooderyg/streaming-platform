import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreditHistory } from './entities/credit-history.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateCreditHistoryDto } from './dto/create-credit-history.dto';
import { ChannelsService } from '../channels/channels.service';
import { UsersService } from '../users/users.service';

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

  async findCreditHistoryList({ userId }) {
    const creditHistoryList = await this.creditHistoriesRepository.find({
      where: { user: { id: userId } },
    });
    return creditHistoryList;
  }

  // 해당 방송의 크레딧 사용내역 조회(스트리머)
  async findCreditHistoryListByLive({
    liveId,
    userId,
  }: IFindCreditHistoryListByLive) {
    const channel = await this.channelsService.findByUserId({ userId });
    if (!channel)
      throw new NotFoundException(
        '채널을 보유한 스트리머만 방송별 수익 조회가 가능합니다.',
      );
    // TODO : liveId로 방송 조회 후 방송 채널의 userId와 넘겨받은 userId 일치하는지 확인
    const creditHistoryListByLive = await this.creditHistoriesRepository.find({
      where: { live: { id: liveId } },
    });
    return creditHistoryListByLive;
  }
}

interface ICreaditHistoriesServiceCreateCreditHistory {
  createCreditHistoryDto: CreateCreditHistoryDto;
  userId: string;
}

interface IFindCreditHistoryListByLive {
  liveId: string;
  userId: string;
}
