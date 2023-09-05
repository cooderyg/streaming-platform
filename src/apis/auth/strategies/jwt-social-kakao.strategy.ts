import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';

export class JwtKakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: '',
      callbackURL: process.env.KAKAO_CALLBACK_URL,
      scope: ['account_email', 'profile_nickname'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    console.log('accessToken: ', accessToken)
    console.log('refreshToken: ', refreshToken)
    console.log(profile)

    return {
      email: profile._json.kakao_account.email,
      password: profile.id,
      nickname: profile.displayName,
    };
  }
}
