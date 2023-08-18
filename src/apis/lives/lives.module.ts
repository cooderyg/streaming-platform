import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LivesController } from './lives.controller';
import { LivesService } from './lives.service';
import { ChannelsModule } from 'src/apis/channels/channels.module';
import { Live } from './entities/live.entity';
import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [TypeOrmModule.forFeature([Live]), ChannelsModule, TagsModule],
  controllers: [LivesController],
  providers: [LivesService],
})
export class LivesModule {}
