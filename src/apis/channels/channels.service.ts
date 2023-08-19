import { UpdateChannelManagerDto } from './dto/update-channel-manager.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel, ChannelRole } from './entities/channel.entity';
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

  async getChannel({ userId }): Promise<Channel> {
    const channel = await this.findByUserId({ userId });
    if (!channel) throw new NotFoundException();

    return channel;
  }

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
      role: { manager: [] },
    });
    return channel;
  }

  async findByUserId({ userId }: IChannelsServiceFindByUserId) {
    const channel = await this.channelsRepository.findOne({
      where: { user: { id: userId } },
    });
    return channel;
  }

  async updateChannel({
    userId,
    channelId,
    updateChannelDto,
  }: IChannelServiceUpdateChannel) {
    const channel = await this.channelsRepository.findOne({
      where: { id: channelId },
      relations: ['user', 'categories'],
    });
    if (!channel) throw new NotFoundException('없는 채널입니다.');
    if (channel.user.id !== userId)
      throw new ForbiddenException('채널 소유자가 아닙니다.');
    const { categoryIds, ...rest } = updateChannelDto;
    const categories = await this.categoriesService.findCategories({
      categoryIds,
    });
    const result = await this.channelsRepository.save({
      ...channel,
      ...rest,
      categories,
    });
    return result;
  }

  async addManager({
    userId,
    channelId,
    updateChannelManagerDto,
  }: IChannelServiceUpdateChannelManager) {
    const { managerId } = updateChannelManagerDto;
    const channel = await this.channelsRepository.findOne({
      where: { id: channelId },
      relations: ['user'],
    });
    if (!channel) throw new NotFoundException('존재하지 않는 채널입니다.');
    if (managerId === userId)
      throw new ForbiddenException(
        '채널 소유자 자신이 매니저가 될 수 없습니다.',
      );
    if (channel.user.id !== userId)
      throw new ForbiddenException('채널 소유자가 아닙니다.');
    await channel.role.manager.push(managerId);
    const result = await this.channelsRepository.save(channel);
    return result;
  }

  async subtractManager({ userId, channelId, updateChannelManagerDto }) {
    const { managerId } = updateChannelManagerDto;
    const channel = await this.channelsRepository.findOne({
      where: { id: channelId },
      relations: ['user'],
    });
    if (!channel) throw new NotFoundException('존재하지 않는 채널입니다.');
    if (!channel.role.manager.filter((manager) => manager === managerId))
      throw new NotFoundException('없는 매니저입니다.');
    channel.role.manager = channel.role.manager.filter(
      (manager) => manager !== managerId,
    );
    const result = await this.channelsRepository.save(channel);
    return result;
  }

  async deleteChannel({ userId, channelId }) {
    const channel = await this.channelsRepository.findOne({
      where: { id: channelId },
      relations: ['user'],
    });
    if (channel.user.id !== userId)
      throw new ForbiddenException('채널 소유자가 아닙니다.');
    await this.channelsRepository.softDelete({ id: channelId });
    return '채널이 삭제되었습니다.';
  }
}

interface IChannelsServiceCreateChannel {
  createChannelDto: CreateChannelDto;
  userId: string;
}

interface IChannelsServiceFindByUserId {
  userId: string;
}

interface IChannelServiceUpdateChannel {
  userId: string;
  channelId: string;
  updateChannelDto: UpdateChannelDto;
}

interface IChannelServiceUpdateChannelManager {
  userId: string;
  channelId: string;
  updateChannelManagerDto: UpdateChannelManagerDto;
}
