import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from './entities/notice.entity';
import { Repository } from 'typeorm';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { ChannelsService } from '../channels/channels.service';
import { PageReqDto } from 'src/commons/dto/page-req.dto';
import {
  IINoticesServiceGetAllNotice,
  IINoticesServiceGetNotice,
  INoticesServiceCreateNotice,
  INoticesServiceDeleteNotice,
  INoticesServicePutNotice,
} from './interfaces/notices-service.interfaces';

@Injectable()
export class NoticesService {
  constructor(
    @InjectRepository(Notice)
    private readonly noticesRepository: Repository<Notice>,
    private readonly channelsService: ChannelsService,
  ) {}

  // 공지전체조회
  async getAllNotice({
    page,
    size,
    channelId,
  }: IINoticesServiceGetAllNotice): Promise<Notice[]> {
    return await this.noticesRepository
      .createQueryBuilder('notice')
      .select([
        'notice.id',
        'notice.content',
        'notice.imageUrl',
        'notice.createdAt',
        'notice.updatedAt',
      ])
      .leftJoin('notice.channel', 'channel')
      .where('channel.id = :channelId', { channelId })
      .orderBy({ 'notice.createdAt': 'DESC' })
      .take(size)
      .skip((page - 1) * size)
      .getMany();
  }

  // 공지 개별조회
  async getNotice({ noticeId }: IINoticesServiceGetNotice): Promise<Notice> {
    const notice = await this.noticesRepository.findOne({
      where: { id: noticeId },
    });
    if (!notice) throw new NotFoundException('공지조회실패');
    return notice;
  }

  // 공지 생성
  async createNotice({
    channelId,
    userId,
    createNoticeDto,
  }: INoticesServiceCreateNotice): Promise<Notice> {
    const channel = await this.channelsService.findByUserId({ userId });
    if (!channel || channel.id !== channelId)
      throw new NotFoundException('권한이 없습니다.');

    const { content, imageUrl } = createNoticeDto;
    const notices = await this.noticesRepository.save({
      channel: { id: channelId },
      content,
      imageUrl,
    });
    return notices;
  }

  // 공지 수정
  async putNotice({
    channelId,
    noticeId,
    userId,
    createNoticeDto,
  }: INoticesServicePutNotice): Promise<Notice> {
    const channel = await this.channelsService.findByUserId({ userId });

    if (!channel || channel.id !== channelId)
      throw new NotFoundException('권한이 없습니다.');

    // channel에서 받아오는 것이 더 좋지않을까?
    const notice = await this.noticesRepository.findOne({
      where: { id: noticeId },
    });

    if (!notice) {
      throw new NotFoundException('해당 공지사항을 찾을 수 없습니다.');
    }

    notice.imageUrl = createNoticeDto.imageUrl;
    notice.content = createNoticeDto.content;
    await this.noticesRepository.save(notice);
    return notice;
  }

  async deleteNotice({
    channelId,
    noticeId,
    userId,
  }: INoticesServiceDeleteNotice): Promise<Notice> {
    const channel = await this.channelsService.findByUserId({ userId });

    if (!channel || channel.id !== channelId) {
      throw new NotFoundException('권한이 없습니다.');
    }

    // channel에서 받아오는 것이 더 좋지않을까?
    const notice = await this.noticesRepository.findOne({
      where: { id: noticeId },
    });

    if (!notice) throw new NotFoundException('공지사항을 찾을 수 없습니다.');

    await this.noticesRepository.softDelete({ id: notice.id }); // 소프트 삭제 수행, 영구삭제는 remove로 바꿔줄 것
    return notice;
  }
}
