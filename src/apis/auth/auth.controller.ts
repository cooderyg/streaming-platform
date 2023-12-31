import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import {
  GoogleAuthGuard,
  KakaoAuthGuard,
  RefreshAuthGuard,
} from './guard/auth.guard';
import {
  SocialUser,
  SocialUserAfterAuth,
  User,
  UserAfterAuth,
} from 'src/commons/decorators/user.decorator';
import { MessageResDto } from 'src/commons/dto/message-res.dto';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, //
  ) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto, //
    @Res({ passthrough: true }) res: Response,
  ): Promise<MessageResDto> {
    const { accessToken, refreshToken } = await this.authService.login({
      loginDto,
    });
    res.cookie('refreshToken', refreshToken);
    res.cookie('accessToken', accessToken);
    // , { httpOnly: true, secure: true }
    // res.setHeader('Authorization', `Bearer ${accessToken}`);

    return { message: '로그인을 성공적으로 완료하였습니다.' };
  }

  @UseGuards(KakaoAuthGuard)
  @Get('login/kakao')
  async kakaoCallback(
    @SocialUser() socialUser: SocialUserAfterAuth,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { accessToken, refreshToken } = await this.authService.OAuthLogin({
      socialLoginDto: socialUser,
    });

    res.cookie('refreshToken', refreshToken);
    res.cookie('accessToken', accessToken);

    res.redirect('/');
  }

  @UseGuards(GoogleAuthGuard)
  @Get('login/google')
  async googleCallback(
    @SocialUser() socialUser: SocialUserAfterAuth,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { accessToken, refreshToken } = await this.authService.OAuthLogin({
      socialLoginDto: socialUser,
    });

    res.cookie('refreshToken', refreshToken);
    res.cookie('accessToken', accessToken);

    res.redirect('/');
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refresh(
    @User() user: UserAfterAuth,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MessageResDto> {
    const accessToken = this.authService.refresh({
      userId: user.id,
    });

    res.setHeader('Authorization', `Bearer ${accessToken}`);
    return { message: 'refresh' };
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) res: Response): void {
    res.cookie('accessToken', '', { expires: new Date(0) });
    res.cookie('refreshToken', '', { expires: new Date(0) });
  }
}
