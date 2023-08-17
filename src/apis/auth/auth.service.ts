import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService, //
    private readonly jwtService: JwtService,
  ) {}
  async login({ loginDto }: IAuthServiceLogin): Promise<string> {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail({ email });
    if (!user)
      throw new UnauthorizedException('해당하는 이메일의 유저가 없습니다.');
    const isAuth = await bcrypt.compare(password, user.password);
    if (!isAuth) throw new UnauthorizedException();
    const accessToken = this.getAccessToken({ userId: user.id });
    return accessToken;
  }

  private getAccessToken({ userId }): string {
    return this.jwtService.sign(
      { sub: userId },
      { secret: process.env.ACCESS_SECRET_KEY, expiresIn: '1d' },
    );
  }
}

interface IAuthServiceLogin {
  loginDto: LoginDto;
}
