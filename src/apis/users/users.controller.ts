import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersSerivce: UsersService) {}

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto, //
  ): Promise<User> {
    const user = await this.usersSerivce.createUser({ createUserDto });
    return user;
  }
}
