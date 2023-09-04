import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { NoticesService } from './notices.service';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';
import { PageReqDto } from 'src/commons/dto/page-req.dto';
import { Notice } from './entities/notice.entity';

@Controller('api/:channelId/notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  // 공지전체조회
  @Get()
  async getAllNotice(
    @Query() { page, size }: PageReqDto,
    @Param('channelId') channelId: string,
  ): Promise<Notice[]> {
    const notice = await this.noticesService.getAllNotice({
      page,
      size,
      channelId,
    });
    return notice;
  }

  @Get(':noticeId')
  async getNotice(@Param('noticeId') noticeId: string): Promise<Notice> {
    const notice = await this.noticesService.getNotice({ noticeId });
    return notice;
  }

  // 공지생성
  @UseGuards(AccessAuthGuard)
  @Post()
  async createNotice(
    @Param('channelId') channelId: string,
    @Body() createNoticeDto: CreateNoticeDto,
    @User() user: UserAfterAuth,
  ): Promise<Notice> {
    const notice = await this.noticesService.createNotice({
      channelId,
      userId: user.id,
      createNoticeDto,
    });
    return notice;
  }

  // 공지 수정
  @UseGuards(AccessAuthGuard)
  @Put(':noticeId')
  async putNotice(
    @Param() params: { noticeId: string; channelId: string },
    @Body() createNoticeDto: CreateNoticeDto,
    @User() user: UserAfterAuth,
  ): Promise<Notice> {
    const notice = await this.noticesService.putNotice({
      channelId: params.channelId,
      noticeId: params.noticeId,
      userId: user.id,
      createNoticeDto,
    });
    return notice;
  }

  // 공지 삭제
  @UseGuards(AccessAuthGuard)
  @Delete(':noticeId')
  async deleteNotice(
    @Param() params: { noticeId: string; channelId: string },
    @User() user: UserAfterAuth,
  ): Promise<Notice> {
    const notice = await this.noticesService.deleteNotice({
      channelId: params.channelId,
      noticeId: params.noticeId,
      userId: user.id,
    });
    return notice;
  }
}
