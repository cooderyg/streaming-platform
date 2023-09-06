import { LoginDto, SocialLoginDto } from '../dto/login.dto';

export interface IAuthServiceLogin {
  loginDto: LoginDto;
}

export interface IAuthServiceSocialLogin {
  socialLoginDto: SocialLoginDto;
}
export interface IAuthServiceRefresh {
  userId: string;
}

export interface IAuthServiceGetAccessToken {
  userId: string;
}

export interface IAuthServiceGetRefreshToken {
  userId: string;
}

export interface IAuthServiceLoginReturn {
  accessToken: string;
  refreshToken: string;
}
