import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLiveDto } from './dto/create-live.dto';
import { ChannelsService } from 'src/apis/channels/channels.service';
import { Live } from './entities/live.entity';
import { TagsService } from '../tags/tags.service';
import { CreateTagDto } from '../tags/dto/create-tag.dto';
import { UpdateLiveDto } from './dto/update-live.dto';
import { CreditHistoriesService } from '../creditHistories/credit-histories.service';
import { Channel } from '../channels/entities/channel.entity';

@Injectable()
export class LivesService {
  constructor(
    @InjectRepository(Live)
    private readonly livesRepository: Repository<Live>,
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    private readonly channelsService: ChannelsService,
    private readonly tagsService: TagsService,
    private readonly creditHistoriesService: CreditHistoriesService,
  ) {}

  async getLiveById(liveId: string) {
    return await this.livesRepository
      .createQueryBuilder('live')
      .leftJoinAndSelect('live.tags', 'tag')
      .where('live.id = :id', { id: liveId })
      .getOne();
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
    let { channel, live } = await this.verifyOwner({ userId, liveId });

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

    await this.livesRepository.save(live);
    await this.channelRepository.save(channel);
    return { message: '방송이 종료되었습니다.' };
  }

  async verifyOwner({ userId, liveId }) {
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
