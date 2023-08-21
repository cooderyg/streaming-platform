import { UpdateChannelManagerDto } from './dto/update-channel-manager.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { Repository } from 'typeorm';
import { CreateChannelDto } from './dto/create-channel.dto';
import { CategoriesService } from '../categories/categories.service';
import { SearchReqDto } from 'src/commons/dto/page-req.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>, //
    private readonly categoriesService: CategoriesService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async getMyChannel({ userId }): Promise<Channel> {
    const channel = await this.findByUserId({ userId });
    if (!channel) throw new NotFoundException();

    return channel;
  }

  async getChannel({ channelId }) {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .select([
        'channel.id',
        'channel.name',
        'channel.role',
        'channel.profileImgUrl',
        'channel.bannerImgUrl',
        'channel.introduction',
        'channel.createdAt',
        'subscribes.id',
        'user.email',
      ])
      .leftJoin('channel.subscribes', 'subscribes')
      .leftJoin('channel.user', 'user')
      .where('channel.id = :id', { id: channelId })
      .getOne();
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
        'channel.profileImgUrl',
        'channel.bannerImgUrl',
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

  async getManagers({ userId }) {
    const channel = await this.findByUserId({ userId });

    if (!channel) throw new NotFoundException();

    const userIds = channel.role.manager;

    const managers = await this.usersService.findByIds({ userIds });

    return managers;
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
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .select([
        'channel.id',
        'channel.name',
        'channel.role',
        'channel.income',
        'channel.profileImgUrl',
        'channel.bannerImgUrl',
        'channel.createdAt',
        'channel.updatedAt',
        'user.id',
        'user.email',
      ])
      .leftJoin('channel.user', 'user')
      .where('user.id = :userId', { userId })
      .getOne();

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
    updateChannelManagerDto,
  }: IChannelServiceUpdateChannelManager) {
    const { email } = updateChannelManagerDto;
    const channel = await this.findByUserId({ userId });

    if (!channel) throw new NotFoundException('존재하지 않는 채널입니다.');

    const manager = await this.usersService.findByEmail({ email });

    if (!manager) throw new NotFoundException();

    if (manager.id === userId)
      throw new ForbiddenException(
        '채널 소유자 자신이 매니저가 될 수 없습니다.',
      );

    const filteredRole = channel.role.manager.filter((el) => el === manager.id);
    if (filteredRole.length)
      throw new ConflictException('이미 매니저인 유저입니다.');

    channel.role.manager.push(manager.id);

    const result = await this.channelsRepository.save(channel);
    return result;
  }

  async subtractManager({ userId, deleteChannelManagerDto }) {
    const { managerId } = deleteChannelManagerDto;

    const channel = await this.findByUserId({ userId });

    const manager = await this.usersService.findById({ userId: managerId });
    if (!manager) throw new NotFoundException();

    if (!channel) throw new NotFoundException('존재하지 않는 채널입니다.');

    if (!channel.role.manager.filter((el) => el === manager.id).length)
      throw new NotFoundException('없는 매니저입니다.');

    channel.role.manager = channel.role.manager.filter(
      (el) => el !== manager.id,
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
  updateChannelManagerDto: UpdateChannelManagerDto;
}
