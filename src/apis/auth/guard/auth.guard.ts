import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AccessAuthGuard extends AuthGuard('access') {}

@Injectable()
export class RefreshAuthGuard extends AuthGuard('refresh') {}

@Injectable()
export class KakaoAuthGuard extends AuthGuard('kakao') {}

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
