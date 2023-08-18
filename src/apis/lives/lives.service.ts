import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLiveDto } from './dto/create-live.dto';
import { ChannelsService } from 'src/apis/channels/channels.service';
import { Live } from './entities/live.entity';
import { TagsService } from '../tags/tags.service';
import { CreateTagDto } from '../tags/dto/create-tag.dto';

@Injectable()
export class LivesService {
  constructor(
    @InjectRepository(Live)
    private readonly livesRepository: Repository<Live>,
    private readonly channelsService: ChannelsService,
    private readonly tagsService: TagsService,
  ) {}

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
}

interface ILivesServiceCreateLive {
  createLiveDto: CreateLiveDto;
  userId: string;
}
