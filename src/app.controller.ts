import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  getHello() {
    return { title: 'Title' };
  }

  @Get('billing')
  @Render('billing')
  getBilling() {
    return { title: 'Title' };
  }

  @Get('dashboard')
  @Render('dashboard')
  getDashboard() {
    return { title: 'Title' };
  }

  @Get('profile')
  @Render('profile')
  getProfile() {
    return { title: 'Title' };
  }

  @Get('sign-in')
  @Render('sign-in')
  getSignin() {
    return { title: 'Title' };
  }

  @Get('sign-up')
  @Render('sign-up')
  getSignup() {
    return { title: 'Title' };
  }

  @Get('tables')
  @Render('tables')
  getTables() {
    return { title: 'Title' };
  }

  @Get('my-channel')
  @Render('my-channel')
  getMyChannel() {
    return { title: 'Title' };
  }

  @Get('channel/:channelId')
  @Render('channel')
  getChannel() {
    return { title: 'Title' };
  }

  @Get('streaming/:liveId')
  @Render('streaming')
  getStreaming() {
    return { title: 'Title' };
  }

  @Get('recent-replay')
  @Render('recent-replay')
  getRecentReplay() {
    return { title: 'Title' };
  }

  @Get('replay/:liveId')
  @Render('replay')
  getReplay() {
    return { title: 'Title' };
  }

  @Get('streaming-control/')
  @Render('streaming-control')
  getStreamingControl() {
    return { title: 'Title' };
  }

  @Get('search')
  @Render('search')
  getSearch() {
    return { title: 'Title' };
  }

  @Get('notice/:channelId')
  @Render('notice')
  getNotice() {
    return { title: 'Title' };
  }

  @Get('comments/:noticeId')
  @Render('comment')
  getNoticeComment() {
    return { title: 'Title' };
  }
}
