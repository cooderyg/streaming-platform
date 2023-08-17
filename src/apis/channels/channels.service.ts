import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { Repository } from 'typeorm';
import { CreateChannelDto } from './dto/create-channel.dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>, //
    private readonly categoriesService: CategoriesService,
  ) {}

  async createChannel({
    createChannelDto,
    userId,
  }: IChannelsServiceCreateChannel) {
    const { categoryIds, name } = createChannelDto;

    const categories = await this.categoriesService.findCategories({
      categoryIds,
    });
    console.log(categories);
    const channel = await this.channelsRepository.save({
      name,
      user: { id: userId },
      categories,
    });
    return channel;
  }
}

interface IChannelsServiceCreateChannel {
  createChannelDto: CreateChannelDto;
  userId: string;
}
