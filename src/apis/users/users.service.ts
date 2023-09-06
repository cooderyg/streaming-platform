import { ChannelsService } from 'src/apis/channels/channels.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  IUsersServiceCreateUser,
  IUsersServiceFindByEmail,
  IUsersServiceFindById,
  IUsersServiceFindByIds,
  IUsersServiceFindSubscribedUsers,
  IUsersServiceFindUser,
  IUsersServiceUpdateCreditWithManager,
  IUsersServiceUpdateUser,
  IUsersServiceVerifyEmail,
} from './interfaces/users-service.interface';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateDummyUserResDto } from './dto/res.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(forwardRef(() => ChannelsService))
    private readonly channelsService: ChannelsService,
    private readonly mailerService: MailerService,
  ) {}

  async findUser({ userId }: IUsersServiceFindUser): Promise<User> {
    const user = await this.findById({ userId });

    if (!user) new NotFoundException();

    return user;
  }

  // ex 구독자 10만명이면 많은 시간동안 대기해야 함 페이지네이션
  // 데이터가 크면 함수가 돌다가 실패할 수 있음
  async findSubscribedUsers({
    channelId,
  }: IUsersServiceFindSubscribedUsers): Promise<User[]> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .select(['user.id'])
      .leftJoin('user.subscribes', 'subscribe')
      .leftJoin('subscribe.channel', 'channel')
      .where('channel.id = :channelId', { channelId })
      .getMany();
  }

  async createUser({ createUserDto }: IUsersServiceCreateUser): Promise<User> {
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

    return result
  }

  async findByEmail({ email }: IUsersServiceFindByEmail): Promise<User> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async verifyEmail({ email }: IUsersServiceVerifyEmail): Promise<number> {
    const exUser = await this.findByEmail({ email });
    if (exUser) {
      throw new ForbiddenException('해당 이메일로는 가입하실 수 없습니다');
    } else if (!exUser) {
      const randomNumber = Math.floor(100000 + Math.random() * 900000);
      await this.mailerService.sendMail({
        to: email,
        from: process.env.MAIL_USER,
        subject: 'Freely B 이메일 인증번호입니다.',
        text: '인증번호를 입력해주세요.',
        html: `<b>인증번호: ${randomNumber}</b>`,
      });
      return randomNumber;
    }
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

  async findByIds({ userIds }: IUsersServiceFindByIds): Promise<User[]> {
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

  // 더미데이터 생성용(추후 제거할 것)
  async createDummyUser({
    createUserDto,
  }: IUsersServiceCreateUser): Promise<CreateDummyUserResDto> {
    const { email, nickname, password } = createUserDto;
    const user = await this.findByEmail({ email });
    if (user) throw new ConflictException('이미 등록된 이메일입니다.');
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await this.usersRepository.save({
      email,
      nickname,
      password: hashedPassword,
    });

    const createChannelDto = {
      name: result.nickname,
      categoryIds: [],
    };
    await this.channelsService.createChannel({
      createChannelDto,
      userId: result.id,
    });

    return { userId: result.id };
  }
}
