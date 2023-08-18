import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notice } from './entities/notice.entity';
import { NoticesController } from './notices.controller';
import { NoticesService } from './notices.service';
import { ChannelsModule } from '../channels/channels.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notice]), ChannelsModule],
  controllers: [NoticesController],
  providers: [NoticesService],
})
export class NoticesModule {}
