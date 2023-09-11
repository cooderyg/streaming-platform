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
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { Livesubscriber } from './lives.subscriber';
import { BullModule } from '@nestjs/bull';
import { LivesProcessor } from './lives.processor';
import { SubscribesModule } from '../subscribes/subscribes.module';

@Module({
  imports: [
    AlertsModule,
    BullModule.registerQueue({ name: 'alertsQueue' }),
    ChannelsModule,
    CreditHistoriesModule,
    EventsModule,
    ElasticsearchModule.register({
      node: 'http://localhost:9200',
    }),
    SubscribesModule,
    TagsModule,
    TypeOrmModule.forFeature([Live, Channel]),
    UsersModule,
  ],
  controllers: [LivesController],
  providers: [LivesService, Livesubscriber, LivesProcessor],
  exports: [LivesService],
})
export class LivesModule {}
