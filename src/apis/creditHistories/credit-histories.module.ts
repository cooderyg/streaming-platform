import { Module } from '@nestjs/common';
import { CreditHistoriesService } from './credit-histories.service';
import { CreditHistoriesController } from './credit-histories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditHistory } from './entities/credit-history.entity';
import { ChannelsModule } from '../channels/channels.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CreditHistory]),
    ChannelsModule,
    UsersModule,
  ],
  controllers: [CreditHistoriesController],
  providers: [CreditHistoriesService],
  exports: [CreditHistoriesService],
})
export class CreditHistoriesModule {}
