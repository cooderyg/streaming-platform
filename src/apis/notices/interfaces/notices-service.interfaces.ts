import { PageReqDto } from 'src/commons/dto/page-req.dto';
import { CreateNoticeDto } from '../dto/create-notice.dto';

export interface INoticesServiceCreateNotice {
  channelId: string;
  userId: string;
  createNoticeDto: CreateNoticeDto;
}

export interface IINoticesServiceGetAllNotice extends PageReqDto {
  channelId: string;
}

export interface IINoticesServiceGetNotice {
  noticeId: string;
}

export interface INoticesServicePutNotice {
  noticeId: string;
  channelId: string;
  userId: string;
  createNoticeDto: CreateNoticeDto;
}

export interface INoticesServiceDeleteNotice {
  channelId: string;
  noticeId: string;
  userId: string;
}
