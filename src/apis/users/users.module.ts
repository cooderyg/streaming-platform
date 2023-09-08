import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ChannelsModule } from '../channels/channels.module';
import { BullModule } from '@nestjs/bull';
import { UsersProcessor } from './users.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'mailsQueue' }),
    TypeOrmModule.forFeature([User]),
    forwardRef(() => ChannelsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersProcessor],
  exports: [UsersService],
})
export class UsersModule {}
