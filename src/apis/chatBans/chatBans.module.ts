import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatBan } from './entities/chatBans.entity';
import { ChatBanController } from './chatBans.controller';
import { ChatBanService } from './chatBans.service';
import { UsersModule } from '../users/users.module';
import { ChannelsModule } from '../channels/channels.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChatBan]), UsersModule, ChannelsModule],
  controllers: [ChatBanController],
  providers: [ChatBanService],
  exports: [ChatBanService],
})
export class ChatBanModule {}
