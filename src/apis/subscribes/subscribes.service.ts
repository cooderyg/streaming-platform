import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Subscribe } from './entities/subscribe.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ISubscribesServiceCountByChannel,
  ISubscribesServiceFindByChannelIdAndUserId,
  ISubscribesServiceToggleSubscribe,
} from './interfaces/subscribes-service.interface';

@Injectable()
export class SubscribesService {
  constructor(
    @InjectRepository(Subscribe)
    private readonly subscribesRepository: Repository<Subscribe>,
  ) {}

  async toggleSubscribe({
    toggleSubscribeDto,
    userId,
  }: ISubscribesServiceToggleSubscribe): Promise<boolean> {
    const { channelId } = toggleSubscribeDto;

    const isExist = await this.findByChannelIdAndUserId({ channelId, userId });
    console.log(isExist);
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
}
