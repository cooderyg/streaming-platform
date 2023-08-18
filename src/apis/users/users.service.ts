import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  IUsersServiceCreateUser,
  IUsersServiceFindByEmail,
  IUsersServiceFindById,
  IUsersServiceUpdateCreditWithManager,
} from './interfaces/users-service.interface';

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

  async findByEmail({ email }: IUsersServiceFindByEmail): Promise<User> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findById({ userId }: IUsersServiceFindById): Promise<User> {
    return await this.usersRepository.findOne({
      where: { id: userId },
    });
  }

  async updateCreditWithManager({
    manager,
    user,
    amount,
    isDecrement,
  }: IUsersServiceUpdateCreditWithManager): Promise<void> {
    if (isDecrement) {
      await manager.save(User, {
        ...user,
        credit: user.credit - amount,
      });
    } else {
      await manager.save(User, {
        ...user,
        credit: user.credit + amount,
      });
    }
  }
}
