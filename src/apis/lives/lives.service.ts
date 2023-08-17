import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLiveDto } from './dto/create-live.dto';
import { ChannelsService } from 'src/apis/channels/channels.service';
import { Live } from './entities/live.entity';

@Injectable()
export class LivesService {
  constructor(
    @InjectRepository(Live)
    private readonly livesRepository: Repository<Live>,
    private readonly channelsService: ChannelsService,
  ) {}

  async createLive({ userId, createLiveDto }: ILivesServiceCreateLive) {
    const channel = await this.channelsService.findByUserId({ userId });

    const live = await this.livesRepository.save({
      title: createLiveDto.title,
      channel: { id: channel.id },
    });
    return live;
  }
}

interface ILivesServiceCreateLive {
  createLiveDto: CreateLiveDto;
  userId: string;
}
