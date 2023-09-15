import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticeComment } from './entities/notice-comment.entity';
import { Repository, UpdateResult } from 'typeorm';
import { NoticesService } from '../notices/notices.service';
import {
  INoticeCommentCreateComment,
  INoticeCommentDeleteComment,
  INoticeCommentFindComment,
  INoticeCommentPutComment,
} from './interfaces/notice-comment.interface';

@Injectable()
export class NoticeCommentsService {
  constructor(
    @InjectRepository(NoticeComment)
    private readonly noticeCommentRepository: Repository<NoticeComment>,
    private readonly noticesService: NoticesService,
  ) {}

  // 댓글 전체 조회
  async getAllNoticeComment({
    page,
    size,
    noticeId,
  }: INoticeCommentFindComment): Promise<NoticeComment[]> {
    return await this.noticeCommentRepository
      .createQueryBuilder('noticeComment')
      .select([
        'noticeComment.id',
        'noticeComment.content',
        'noticeComment.createdAt',
        'noticeComment.updatedAt',
        'user.id',
        'user.nickname',
        'user.imageUrl',
      ])
      .leftJoin('noticeComment.notice', 'notice')
      .leftJoin('noticeComment.user', 'user')
      .where('notice.id = :noticeId', { noticeId })
      .orderBy({ 'noticeComment.createdAt': 'DESC' })
      .take(size)
      .skip((page - 1) * size)
      .getMany();
  }

  // 댓글 생성
  async createNoticeComment({
    userId,
    noticeId,
    createNoticeCommentDto,
  }: INoticeCommentCreateComment): Promise<NoticeComment> {
    const notice = await this.noticesService.getNotice({ noticeId });
    if (!notice) throw new NotFoundException('공지글을 찾을 수 없습니다.');

    const { content } = createNoticeCommentDto;
    const comment = await this.noticeCommentRepository.save({
      user: { id: userId },
      notice: { id: noticeId },
      content,
    });
    return comment;
  }

  // 댓글 수정
  async putNoticeComment({
    noticeCommentId,
    userId,
    putNoticeCommentDto,
  }: INoticeCommentPutComment): Promise<NoticeComment> {
    const { content } = putNoticeCommentDto;

    const findComment = await this.noticeCommentRepository.findOne({
      where: { id: noticeCommentId },
      relations: ['user'],
    });

    if (!findComment || userId !== findComment.user.id)
      throw new NotFoundException('권한이 없습니다.');

    const noticeComment = await this.noticeCommentRepository.save({
      id: noticeCommentId,
      content,
    });
    return noticeComment;
  }

  // 댓글 삭제
  async deleteNoticeComment({
    noticeCommentId,
    userId,
  }: INoticeCommentDeleteComment): Promise<UpdateResult> {
    const findComment = await this.noticeCommentRepository.findOne({
      where: { id: noticeCommentId },
      relations: ['user'],
    });

    if (!findComment || userId !== findComment.user.id)
      throw new NotFoundException('권한이 없습니다.');

    return await this.noticeCommentRepository.softDelete({
      id: noticeCommentId,
    });
  }
}
