import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Put,
  Query,
  Delete,
} from '@nestjs/common';
import { NoticeCommentsService } from './notice-comment.service';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import {
  CreateNoticeCommentDto,
  PutNoticeCommentDto,
} from './dto/notice-comment.dto';
import { NoticeComment } from './entities/notice-comment.entity';
import { UserAfterAuth, User } from 'src/commons/decorators/user.decorator';
import { PageReqDto } from 'src/commons/dto/page-req.dto';

@Controller('api/:noticeId/notice-comments')
export class NoticeCommentsController {
  constructor(private readonly noticeCommentsService: NoticeCommentsService) {}

  // 댓글 전체조회
  @Get()
  async getAllNoticeComment(
    @Query() { page, size }: PageReqDto,
    @Param('noticeId') noticeId: string,
  ): Promise<NoticeComment[]> {
    const noticeComment = await this.noticeCommentsService.getAllNoticeComment({
      page,
      size,
      noticeId,
    });
    return noticeComment;
  }

  // 댓글 생성
  @UseGuards(AccessAuthGuard)
  @Post()
  async createNoticeComment(
    @Param('noticeId') noticeId: string,
    @User() user: UserAfterAuth,
    @Body() createNoticeCommentDto: CreateNoticeCommentDto,
  ): Promise<NoticeComment> {
    const comment = await this.noticeCommentsService.createNoticeComment({
      userId: user.id,
      noticeId,
      createNoticeCommentDto,
    });
    return comment;
  }

  // 댓글 수정
  @UseGuards(AccessAuthGuard)
  @Put(':noticeCommentId')
  async putNoticeComment(
    @Param('noticeCommentId') noticeCommentId: string,
    @User() user: UserAfterAuth,
    @Body() putNoticeCommentDto: PutNoticeCommentDto,
  ): Promise<NoticeComment> {
    const noticeComment = await this.noticeCommentsService.putNoticeComment({
      noticeCommentId,
      userId: user.id,
      putNoticeCommentDto,
    });
    return noticeComment;
  }

  // 댓글 삭제
  @UseGuards(AccessAuthGuard)
  @Delete(':noticeCommentId')
  async deleteNoticeComment(
    @Param('noticeCommentId') noticeCommentId: string,
    @User() user: UserAfterAuth,
  ) {
    await this.noticeCommentsService.deleteNoticeComment({
      noticeCommentId,
      userId: user.id,
    });
  }
}
