import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, //
  ) {}
  @Post('/login')
  async login(
    @Body() loginDto: LoginDto, //
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken = await this.authService.login({ loginDto });
    console.log(accessToken);
    res.setHeader('Authorization', `Bearer ${accessToken}`);

    return { message: '로그인을 성공적으로 완료하였습니다.' };
  }
}
