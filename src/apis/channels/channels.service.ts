import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { Repository } from 'typeorm';
import { CreateChannelDto } from './dto/create-channel.dto';
import { CategoriesService } from '../categories/categories.service';
import { SearchReqDto } from 'src/commons/dto/page-req.dto';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>, //
    private readonly categoriesService: CategoriesService,
  ) {}

  async searchChannels(searchReqDto: SearchReqDto) {
    const { keyword, page, size } = searchReqDto;
    const results = await this.channelsRepository
      .createQueryBuilder('channel')
      .select([
        'channel.id',
        'channel.name',
        'categories.name',
        'channel.imageUrl',
        'channel.createdAt',
      ])
      // TODO: 태그 검색 추가
      .leftJoin('channel.categories', 'categories')
      .where('channel.name like :keyword', { keyword: `%${keyword}%` })
      .orWhere('categories.name like :keyword', { keyword: `%${keyword}%` })
      .take(size)
      .skip((page - 1) * size)
      .getMany();
    return results;
  }

  async createChannel({
    createChannelDto,
    userId,
  }: IChannelsServiceCreateChannel): Promise<Channel> {
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

  async findByUserId({ userId }: IChannelsServiceFindByUserId) {
    const channel = await this.channelsRepository.findOne({
      where: { user: { id: userId } },
    });
    return channel;
  }
}

interface IChannelsServiceCreateChannel {
  createChannelDto: CreateChannelDto;
  userId: string;
}

interface IChannelsServiceFindByUserId {
  userId: string;
}
