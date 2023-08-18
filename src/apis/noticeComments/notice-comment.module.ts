import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeComment } from './entities/notice-comment.entity';
import { NoticeCommentsController } from './notice-comment.controller';
import { NoticeCommentsService } from './notice-comment.service';
import { NoticesModule } from '../notices/notices.module';

@Module({
  imports: [TypeOrmModule.forFeature([NoticeComment]), NoticesModule],
  controllers: [NoticeCommentsController],
  providers: [NoticeCommentsService],
})
export class NoticeCommentsModule {}
