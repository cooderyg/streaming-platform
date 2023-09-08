import {
  OnGlobalQueueCompleted,
  OnGlobalQueueFailed,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('alertsQueue')
export class LivesProcessor {
  private readonly logger = new Logger(LivesProcessor.name);

  //   @Process({ name: 'addAlertQueue', concurrency: 4 })
  //   async addOrderQueue(job: IAddAlertQueueJob): Promise<void> {
  //     this.logger.debug('대기열 큐가 실행되었습니다.');
  //     try {
  //       const { channelId, channelName, users } = job.data;
  //       await this.alertsService.createAlerts({
  //         users,
  //         channelId,
  //         isOnAir: true,
  //         channelName,
  //       });
  //     } catch (error) {
  //       console.log(error);
  //       return;
  //     }
  //   }
  @OnGlobalQueueCompleted()
  completedHandler(job, result) {
    console.log(job.data);
    this.logger.debug('완료했음!!!');
  }

  @OnGlobalQueueFailed()
  errorHandler(job, error) {
    console.log(error);
    this.logger.debug('실패했음!!!');
  }
}

// export interface IAddAlertQueueJob extends Job {
//   data: {
//     channelId: string;
//     channelName: string;
//     users: User[];
//   };
// }
