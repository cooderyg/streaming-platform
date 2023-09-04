import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import {
  User as UserD,
  UserAfterAuth,
} from 'src/commons/decorators/user.decorator';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  CreateDummyUserResDto,
  CreateUserResDto,
  FindUserByEmailResDto,
} from './dto/res.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersSerivce: UsersService) {}

  @UseGuards(AccessAuthGuard)
  @Get()
  async findUser(@UserD() user: UserAfterAuth): Promise<User> {
    const _user = await this.usersSerivce.findUser({ userId: user.id });

    return _user;
  }

  @Post('/verify-email')
  async findUserByEmail(
    @Body() body: VerifyEmailDto,
  ): Promise<FindUserByEmailResDto> {
    const result = await this.usersSerivce.verifyEmail({ email: body.email });
    return { message: result };
  }

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto, //
  ): Promise<CreateUserResDto> {
    await this.usersSerivce.createUser({ createUserDto });

    return { message: '유저 생성이 완료되었습니다.' };
  }

  @UseGuards(AccessAuthGuard)
  @Put()
  async updateUser(
    @Body() updateUserDto: UpdateUserDto, //
    @UserD() user: UserAfterAuth,
  ): Promise<User> {
    const updatedUser = await this.usersSerivce.updateUser({
      userId: user.id,
      updateUserDto,
    });

    return updatedUser;
  }

  // 더미 유저 생성
  @Post('/dummy')
  async createDummyUser(
    @Body() createUserDto: CreateUserDto, //
  ): Promise<CreateDummyUserResDto> {
    const result = await this.usersSerivce.createDummyUser({ createUserDto });

    return result;
  }
}
