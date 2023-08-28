import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Alert } from './entities/alert.entity';
import { Repository } from 'typeorm';
import {
  IAlertsServiceCreateAlerts,
  IAlertsServiceFindById,
  IAlertsServiceGetAlerts,
  IAlertsServiceReadAlert,
} from './interfaces/alerts-service.interface';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertsRepository: Repository<Alert>,
  ) {}

  async getAlerts({
    userId,
    page,
    size,
  }: IAlertsServiceGetAlerts): Promise<Alert[]> {
    const alerts = await this.alertsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: size,
      skip: (page - 1) * size,
    });
    return alerts;
  }

  async createAlerts({
    users,
    isOnAir,
    channelName,
    noticeContent,
  }: IAlertsServiceCreateAlerts) {
    const temp: Alert[] = [];
    users.forEach((user) => {
      const alert = this.alertsRepository.create({
        user: { id: user.id },
        message: isOnAir
          ? `${channelName} 채널이 방송을 시작했습니다.`
          : `${channelName} 채널의 공지: ${noticeContent}`,
      });
      temp.push(alert);
    });

    await this.alertsRepository.insert(temp);
  }

  async readAlert({ alertId, userId }: IAlertsServiceReadAlert): Promise<void> {
    const alert = await this.findById({ alertId });
    if (!alert) throw new NotFoundException();
    if (alert.user.id !== userId) throw new ForbiddenException();

    await this.alertsRepository.save({
      id: alert.id,
      isRead: true,
    });
  }

  async findById({ alertId }: IAlertsServiceFindById): Promise<Alert> {
    return await this.alertsRepository.findOne({
      where: { id: alertId },
      relations: ['user'],
    });
  }
}
