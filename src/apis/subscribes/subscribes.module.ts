import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscribe } from './entities/subscribe.entity';
import { SubscribesController } from './subscribes.controller';
import { SubscribesService } from './subscribes.service';
import { ChannelsModule } from '../channels/channels.module';

@Module({
  imports: [TypeOrmModule.forFeature([Subscribe]), ChannelsModule],
  controllers: [SubscribesController],
  providers: [SubscribesService],
})
export class SubscribesModule {}
