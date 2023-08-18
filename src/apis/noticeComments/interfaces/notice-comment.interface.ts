import {
  CreateNoticeCommentDto,
  PutNoticeCommentDto,
} from '../dto/notice-comment.dto';

export interface INoticeCommentCreateComment {
  userId: string;
  noticeId: string;
  createNoticeCommentDto: CreateNoticeCommentDto;
}

export interface INoticeCommentFindComment {
  page: number;
  size: number;
  noticeId: string;
}

export interface INoticeCommentDeleteComment {
  userId: string;
  noticeCommentId: string;
}

export interface INoticeCommentPutComment extends INoticeCommentDeleteComment {
  putNoticeCommentDto: PutNoticeCommentDto;
}
