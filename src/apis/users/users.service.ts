import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createUser({ createUserDto }: IUsersServiceCreateUser): Promise<User> {
    const { email, nickname, password } = createUserDto;
    const user = await this.findByEmail({ email });
    if (user) throw new UnauthorizedException('이미 등록된 이메일입니다.');
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.usersRepository.save({
      email,
      nickname,
      password: hashedPassword,
    });

    return newUser;
  }

  async findByEmail({ email }) {
    return await this.usersRepository.findOne({ where: { email } });
  }
}

interface IUsersServiceCreateUser {
  createUserDto: CreateUserDto;
}
