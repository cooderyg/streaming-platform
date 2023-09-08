import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LivesController } from './lives.controller';
import { LivesService } from './lives.service';
import { ChannelsModule } from 'src/apis/channels/channels.module';
import { Live } from './entities/live.entity';
import { TagsModule } from '../tags/tags.module';
import { CreditHistoriesModule } from '../creditHistories/credit-histories.module';
import { Channel } from '../channels/entities/channel.entity';
import { EventsModule } from '../events/events.module';
import { AlertsModule } from '../alerts/alerts.module';
import { UsersModule } from '../users/users.module';
import { BullModule } from '@nestjs/bull';
import { LivesProcessor } from './lives.processor';

@Module({
  imports: [
    AlertsModule,
    BullModule.registerQueue({ name: 'alertsQueue' }),
    ChannelsModule,
    CreditHistoriesModule,
    EventsModule,
    TagsModule,
    TypeOrmModule.forFeature([Live, Channel]),
    UsersModule,
  ],
  controllers: [LivesController],
  providers: [LivesService, LivesProcessor],
  exports: [LivesService],
})
export class LivesModule {}
