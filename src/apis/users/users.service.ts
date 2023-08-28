import { ChannelsService } from 'src/apis/channels/channels.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, Repository } from 'typeorm';
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
    @Inject(forwardRef(() => ChannelsService))
    private readonly channelsService: ChannelsService,
  ) {}

  async findUser({ userId }): Promise<User> {
    const user = await this.findById({ userId });

    if (!user) new NotFoundException();

    return user;
  }

  // ex 구독자 10만명이면 많은 시간동안 대기해야 함
  async findSubscribedUsers({ channelId }) {
    return await this.usersRepository
      .createQueryBuilder('user')
      .select(['user.id'])
      .leftJoin('user.subscribes', 'subscribe')
      .leftJoin('subscribe.channel', 'channel')
      .where('channel.id = :channelId', { channelId })
      .getMany();
  }

  async createUser({ createUserDto }: IUsersServiceCreateUser): Promise<void> {
    const { email, nickname, password } = createUserDto;
    const user = await this.findByEmail({ email });
    if (user) throw new ConflictException('이미 등록된 이메일입니다.');
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await this.usersRepository.save({
      email,
      nickname,
      password: hashedPassword,
    });

    const createChannelDto = { name: result.nickname, categoryIds: [] };
    await this.channelsService.createChannel({
      createChannelDto,
      userId: result.id,
    });
  }

  async findByEmail({ email }: IUsersServiceFindByEmail): Promise<User> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findById({ userId }: IUsersServiceFindById): Promise<User> {
    return await this.usersRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'email',
        'credit',
        'nickname',
        'createdAt',
        'updatedAt',
        'imageUrl',
      ],
    });
  }

  async findByIds({ userIds }) {
    return await this.usersRepository.find({
      where: { id: In(userIds) },
      select: ['id', 'email', 'nickname', 'imageUrl', 'createdAt'],
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
