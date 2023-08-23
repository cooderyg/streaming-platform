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

@Module({
  imports: [
    TypeOrmModule.forFeature([Live, Channel]),
    ChannelsModule,
    TagsModule,
    CreditHistoriesModule,
    EventsModule,
  ],
  controllers: [LivesController],
  providers: [LivesService],
  exports: [LivesService],
})
export class LivesModule {}
