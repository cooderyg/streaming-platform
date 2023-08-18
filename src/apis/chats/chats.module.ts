import { Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { ChatsService } from './chats.service';

@Module({
  imports: [TypeOrmModule.forFeature([Chat])],
  controllers: [ChatsController],
  providers: [ChatsService],
})
export class ChatsModule {}
