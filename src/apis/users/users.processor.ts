import {
  OnGlobalQueueCompleted,
  OnGlobalQueueFailed,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';

@Processor('mailsQueue')
export class UsersProcessor {
  private readonly logger = new Logger(UsersProcessor.name);

  @OnGlobalQueueCompleted()
  completedHandler(job, result) {
    console.log(result);
    this.logger.debug('완료했음!!!');
  }

  @OnGlobalQueueFailed()
  errorHandler(job, error) {
    console.log(error);
    this.logger.debug('실패했음!!!');
  }
}
