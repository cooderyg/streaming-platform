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
import { CategoriesService } from '../categories/categories.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import {
  IChannelServiceSubtractManager,
  IChannelServiceUpdateChannel,
  IChannelServiceUpdateChannelManager,
  IChannelsServiceCreateChannel,
  IChannelsServiceDeleteChannel,
  IChannelsServiceFindByUserId,
  IChannelsServiceGetAllPlayTimes,
  IChannelsServiceGetChannel,
  IChannelsServiceGetManagers,
  IChannelsServiceGetMyChannel,
  IChannelsServiceGetSubscribedChannels,
  IChannelsServiceSearchChannels,
} from './interfaces/channels-service.interface';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>, //
    private readonly categoriesService: CategoriesService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async getMyChannel({
    userId,
  }: IChannelsServiceGetMyChannel): Promise<Channel> {
    const channel = await this.findByUserId({ userId });
    if (!channel) throw new NotFoundException();

    return channel;
  }

  async getChannel({
    channelId,
  }: IChannelsServiceGetChannel): Promise<Channel> {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .select([
        'channel.id',
        'channel.name',
        'channel.role',
        'channel.income',
        'channel.profileImgUrl',
        'channel.bannerImgUrl',
        'channel.introduction',
        'channel.createdAt',
        'subscribes.id',
        'user.email',
      ])
      .leftJoin('channel.categories', 'categoryChannel')
      .leftJoin('channel.subscribes', 'subscribes')
      .leftJoin('channel.user', 'user')
      .where('channel.id = :id', { id: channelId })
      .getOne();
    if (!channel) throw new NotFoundException();

    return channel;
  }

  async searchChannels({
    searchReqDto,
  }: IChannelsServiceSearchChannels): Promise<Channel[]> {
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

  async getAllPlayTimes({
    userId,
  }: IChannelsServiceGetAllPlayTimes): Promise<Channel> {
    const channel = await this.getMyChannel({ userId });
    const beforeAMonth = new Date();
    beforeAMonth.setDate(beforeAMonth.getDate() - 30);
    const playtimes = await this.channelsRepository
      .createQueryBuilder('channel')
      .select('SUM(live.playtime)', 'playtimes')
      .leftJoin('channel.lives', 'live')
      .where('channel.id = :id', { id: channel.id })
      .andWhere('live.createdAt >= :date', { date: beforeAMonth })
      .getRawOne();
    return playtimes;
  }
  async getSubscribedChannels({
    userId,
  }: IChannelsServiceGetSubscribedChannels): Promise<Channel[]> {
    return await this.channelsRepository
      .createQueryBuilder('channel')
      .select(['channel.id', 'channel.name', 'channel.profileImgUrl'])
      .leftJoin('channel.subscribes', 'subscribe')
      .leftJoin('subscribe.user', 'user')
      .where('subscribe.user = :userId', { userId })
      .orderBy('subscribe.createdAt', 'ASC')
      .getMany();
  }

  async getManagers({ userId }: IChannelsServiceGetManagers): Promise<User[]> {
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
      name: categoryIds,
    });
    const channel = await this.channelsRepository.save({
      name,
      user: { id: userId },
      categories,
      role: { manager: [] },
    });
    return channel;
  }

  async findByUserId({
    userId,
  }: IChannelsServiceFindByUserId): Promise<Channel> {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .select([
        'channel.id',
        'channel.name',
        'channel.role',
        'channel.income',
        'channel.profileImgUrl',
        'channel.bannerImgUrl',
        'channel.introduction',
        'channel.createdAt',
        'channel.updatedAt',
        'subscribes.id',
        'user.id',
        'user.email',
      ])
      .leftJoin('channel.user', 'user')
      .leftJoin('channel.subscribes', 'subscribes')
      .where('user.id = :userId', { userId })
      .getOne();

    return channel;
  }

  async updateChannel({
    userId,
    channelId,
    updateChannelDto,
  }: IChannelServiceUpdateChannel): Promise<Channel> {
    const channel = await this.channelsRepository.findOne({
      where: { id: channelId },
      relations: ['user', 'categories'],
    });
    if (!channel) throw new NotFoundException('없는 채널입니다.');
    if (channel.user.id !== userId)
      throw new ForbiddenException('채널 소유자가 아닙니다.');
    const { categoryIds, ...rest } = updateChannelDto;
    const categories = await this.categoriesService.findCategories({
      name: categoryIds,
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
  }: IChannelServiceUpdateChannelManager): Promise<Channel> {
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

  async subtractManager({
    userId,
    deleteChannelManagerDto,
  }: IChannelServiceSubtractManager): Promise<Channel> {
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

  async deleteChannel({
    userId,
    channelId,
  }: IChannelsServiceDeleteChannel): Promise<string> {
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
