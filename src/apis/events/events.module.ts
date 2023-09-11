import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { ChatsModule } from '../chats/chats.module';
import { ChatsService } from '../chats/chats.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from '../chats/schemas/chat.schema';

@Module({
  imports: [JwtModule.register({}), UsersModule, ChatsModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
