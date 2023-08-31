import { NestFactory } from '@nestjs/core';
import { AlertsService } from 'src/apis/alerts/alerts.service';
import { AppModule } from 'src/app.module';
import { parentPort, workerData } from 'worker_threads';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // const usersService = app.get(UsersService);
  const alertsService = app.get(AlertsService);

  const { users, channelId, channelName, index } = workerData;
  try {
    console.log(`start time:${Date.now()} ${index}`);
    // const subscribedUsers = await usersService.findSubscribedUsers({
    //   channelId,
    // });

    await alertsService.createAlerts({
      users,
      channelId,
      isOnAir: true,
      channelName,
    });
    console.log(`end time:${Date.now()} ${index}`);
  } catch (error) {
    console.log(error);
  } finally {
    parentPort.postMessage('message');
    parentPort.close();
  }
}

run();
