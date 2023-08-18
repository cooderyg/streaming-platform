import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewHistory } from './entities/view-history.entity';
import { ViewHistoriesController } from './view-histories.controller';
import { ViewHistoriesService } from './view-histories.service';
import { UsersModule } from '../users/users.module';
import { LivesModule } from '../lives/lives.module';

@Module({
  imports: [TypeOrmModule.forFeature([ViewHistory]), LivesModule, UsersModule],
  controllers: [ViewHistoriesController],
  providers: [ViewHistoriesService],
})
export class ViewHistoriesModule {}
