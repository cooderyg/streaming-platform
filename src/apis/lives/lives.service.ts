import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLiveDto } from './dto/create-live.dto';
import { ChannelsService } from 'src/apis/channels/channels.service';
import { Live } from './entities/live.entity';
import { TagsService } from '../tags/tags.service';
import { CreateTagDto } from '../tags/dto/create-tag.dto';
import { UpdateLiveDto } from './dto/update-live.dto';

@Injectable()
export class LivesService {
  constructor(
    @InjectRepository(Live)
    private readonly livesRepository: Repository<Live>,
    private readonly channelsService: ChannelsService,
    private readonly tagsService: TagsService,
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

  async updateLive({ liveId, updateLiveDto }: ILivesServiceUpdateLive) {
    const { title, ...createTagDto } = updateLiveDto;
    const live = await this.livesRepository.findOneBy({ id: liveId });
    const tags = await this.tagsService.createTags({ createTagDto });
    live.title = title;
    live.tags = tags;
    return await this.livesRepository.save(live);
  }

  /**
   * @todo
   * 방송 종료 시 endDate, income, replayUrl을 업데이트 하는 로직 작성
   */
}

interface ILivesServiceCreateLive {
  createLiveDto: CreateLiveDto;
  userId: string;
}

interface ILivesServiceUpdateLive {
  updateLiveDto: UpdateLiveDto;
  liveId: string;
}
