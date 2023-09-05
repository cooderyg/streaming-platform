import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtKakaoStrategy } from './strategies/jwt-social-kakao.strategy';
import { JwtGoogleStrategy } from './strategies/jwt-social-google.strategy';

@Module({
  imports: [
    JwtModule.register({}),
    UsersModule, //
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    JwtKakaoStrategy,
    JwtGoogleStrategy,
  ],
})
export class AuthModule {}
