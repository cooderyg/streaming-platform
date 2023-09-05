import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        if (!req.cookies.accessToken) throw new UnauthorizedException();
        const cookie = req.cookies.accessToken; //accessToken=pvgkmjsklfmsk
        const accessToken = cookie.replace('accessToken=', '');
        return accessToken;
      },
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_SECRET_KEY,
    });
  }
  validate(payload) {
    return {
      id: payload.sub,
    };
  }
}
