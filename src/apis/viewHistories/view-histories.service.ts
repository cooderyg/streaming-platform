import { createViewHistoryDto } from './dto/create-view-history.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ViewHistory } from './entities/view-history.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ViewHistoriesService {
  constructor(
    @InjectRepository(ViewHistory)
    private readonly viewHistoriesRepository: Repository<ViewHistory>,
  ) {}

  async findViewHistoryList({ userId }) {
    const viewHistory = await this.viewHistoriesRepository.find({
      where: { user: { id: userId } },
    });
    return viewHistory;
  }

  async createViewHistory({ userId, createViewHistoryDto }) {
    const { liveId } = createViewHistoryDto;
    const viewHistory = await this.viewHistoriesRepository.save({
      user: { id: userId },
      live: { id: liveId },
    });
    return viewHistory;
  }
}
