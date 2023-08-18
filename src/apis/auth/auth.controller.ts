import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { RefreshAuthGuard } from './guard/auth.guard';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, //
  ) {}
  @Post('login')
  async login(
    @Body() loginDto: LoginDto, //
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login({
      loginDto,
    });
    res.cookie('refreshToken', refreshToken);
    // , { httpOnly: true, secure: true }
    console.log(accessToken);
    res.setHeader('Authorization', `Bearer ${accessToken}`);

    return { message: '로그인을 성공적으로 완료하였습니다.' };
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refresh(
    @User() user: UserAfterAuth,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken = await this.authService.refresh({
      userId: user.id,
    });

    res.setHeader('Authorization', `Bearer ${accessToken}`);
    console.log(accessToken);
    return { message: 'refresh' };
  }
}
