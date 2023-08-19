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
}
