import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { AlertsService } from '../alerts/alerts.service';
import { User } from '../users/entities/user.entity';

@Processor('alertsQueue')
export class LivesProcessor {
  constructor(private readonly alertsService: AlertsService) {}
  private readonly logger = new Logger(LivesProcessor.name);

  @Process('addAlertsQueue')
  async addOrderQueue(job: IAddAlertQueueJob): Promise<void> {
    this.logger.debug('대기열 큐가 실행되었습니다.');
    try {
      const { channelId, channelName, users } = job.data;
      await this.alertsService.createAlerts({
        users,
        channelId,
        isOnAir: true,
        channelName,
      });
    } catch (error) {
      console.log(error);
      return;
    }
  }
}

export interface IAddAlertQueueJob extends Job {
  data: {
    channelId: string;
    channelName: string;
    users: User[];
  };
}
