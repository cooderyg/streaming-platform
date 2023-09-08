import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Subscribe } from './entities/subscribe.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ISubscribesServiceCountByChannel,
  ISubscribesServiceFindByChannelIdAndUserId,
  ISubscribesServiceGetSubscribeCount,
  ISubscribesServiceToggleSubscribe,
} from './interfaces/subscribes-service.interface';
import { ChannelsService } from '../channels/channels.service';

@Injectable()
export class SubscribesService {
  constructor(
    @InjectRepository(Subscribe)
    private readonly subscribesRepository: Repository<Subscribe>,
    private readonly channelsService: ChannelsService,
  ) {}

  async getSubscribeCount({
    userId,
  }: ISubscribesServiceGetSubscribeCount): Promise<number> {
    const channel = await this.channelsService.findByUserId({ userId });
    if (!channel) throw new NotFoundException();

    const count = await this.countByChannel({ channelId: channel.id });

    return count;
  }

  async getSubscribeChannel({ userId }): Promise<Subscribe[]> {
    const subscribes = await this.subscribesRepository
      .createQueryBuilder('subscribe')
      .select(['subscribe.id', 'channel.id'])
      .leftJoin('subscribe.channel', 'channel')
      .where('subscribe.user_id =:userId', { userId })
      .getMany();

    return subscribes;
  }

  async checkSubscribe({ channelId, userId }): Promise<boolean> {
    const subscribe = await this.findByChannelIdAndUserId({
      channelId,
      userId,
    });

    if (subscribe) {
      return true;
    } else {
      return false;
    }
  }

  async toggleSubscribe({
    toggleSubscribeDto,
    userId,
  }: ISubscribesServiceToggleSubscribe): Promise<boolean> {
    const { channelId } = toggleSubscribeDto;

    const isExist = await this.findByChannelIdAndUserId({ channelId, userId });
    if (isExist) {
      await this.subscribesRepository.delete(isExist.id);

      return false;
    } else {
      await this.subscribesRepository.save({
        channel: { id: channelId },
        user: { id: userId },
      });

      return true;
    }
  }

  async findByChannelIdAndUserId({
    channelId,
    userId,
  }: ISubscribesServiceFindByChannelIdAndUserId): Promise<Subscribe> {
    return await this.subscribesRepository.findOne({
      where: {
        channel: { id: channelId },
        user: { id: userId },
      },
    });
  }

  async countByChannel({
    channelId,
  }: ISubscribesServiceCountByChannel): Promise<number> {
    return await this.subscribesRepository.count({
      where: { channel: { id: channelId } },
    });
  }

  // 더미데이터의 구독 등록을 위한 기능
  async toggleSubscribeForDummy(toggleSubscribeDto: {
    channelId: string;
    userId: string;
  }): Promise<boolean> {
    const { channelId, userId } = toggleSubscribeDto;
    // const isExist = await this.findByChannelIdAndUserId({ channelId, userId });
    // if (isExist) {
    //   await this.subscribesRepository.delete(isExist.id);
    //   return false;
    // } else {

    await this.subscribesRepository.save({
      channel: { id: channelId },
      user: { id: userId },
    });

    return true;
    // }
  }
}
