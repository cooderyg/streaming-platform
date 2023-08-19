import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  IUsersServiceCreateUser,
  IUsersServiceFindByEmail,
  IUsersServiceFindById,
  IUsersServiceUpdateCreditWithManager,
  IUsersServiceUpdateUser,
} from './interfaces/users-service.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findUser({ userId }): Promise<User> {
    const user = await this.findById({ userId });

    if (!user) new NotFoundException();

    return user;
  }

  async createUser({ createUserDto }: IUsersServiceCreateUser): Promise<void> {
    const { email, nickname, password } = createUserDto;
    const user = await this.findByEmail({ email });
    if (user) throw new UnauthorizedException('이미 등록된 이메일입니다.');
    const hashedPassword = await bcrypt.hash(password, 10);

    await this.usersRepository.save({
      email,
      nickname,
      password: hashedPassword,
    });
  }

  async findByEmail({ email }: IUsersServiceFindByEmail): Promise<User> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findById({ userId }: IUsersServiceFindById): Promise<User> {
    return await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'credit', 'nickname', 'createdAt', 'updatedAt'],
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

  async updateUser({
    userId,
    updateUserDto,
  }: IUsersServiceUpdateUser): Promise<User> {
    const user = await this.findById({ userId });

    if (!user) throw new NotFoundException();

    const updatedUser = await this.usersRepository.save({
      ...user,
      ...updateUserDto,
    });

    return updatedUser;
  }
}
