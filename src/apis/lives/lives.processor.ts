import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as path from 'path';
import { Worker } from 'worker_threads';
import { UsersService } from '../users/users.service';
import { AlertsService } from '../alerts/alerts.service';

@Processor('alertsQueue')
export class LivesProcessor {
  constructor(
    private readonly usersService: UsersService,
    private readonly alertsService: AlertsService,
  ) {}
  private readonly logger = new Logger(LivesProcessor.name);

  @Process('addAlertQueue')
  async addOrderQueue(job: IAddAlertQueueJob): Promise<void> {
    this.logger.debug('대기열 큐가 실행되었습니다.');
    try {
      const { channelId, channelName } = job.data;
      const subscribedUsers = await this.usersService.findSubscribedUsers({
        channelId,
      });
      // 워커스레드 관리하는 것 있음!
      const userCount = subscribedUsers.length;
      for (let i = 0; i < userCount / 1000; i++) {
        const users = subscribedUsers.slice(i * 1000, (i + 1) * 1000);
        const workerData = { channelId, channelName, users, index: i };
        const worker = new Worker(
          path.join(__dirname + '../../../', 'workers', 'workers.app.js'),
          { workerData },
        );

        worker.on('message', (result) => {
          console.log('worker result', result);
        });

        worker.on('error', (error) => {
          console.log('worker error', error);
        });

        worker.on('exit', (code) => {
          console.log('worker exit', code);
        });
      }
    } catch (error) {
      console.log(error);
      return;
    }
  }
}

interface IAddAlertQueueJob extends Job {
  data: {
    channelId: string;
    channelName: string;
  };
}
