import { EntityManager } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';

export interface IUsersServiceFindUser {
  userId: string;
}

export interface IUsersServiceFindSubscribedUsers {
  channelId: string;
}

export interface IUsersServiceCreateUser {
  createUserDto: CreateUserDto;
}

export interface IUsersServiceFindByEmail {
  email: string;
}

export interface IUsersServiceVerifyEmail {
  email: string;
}

export interface IUsersServiceFindById {
  userId: string;
}

export interface IUsersServiceFindByIds {
  userIds: string[];
}

export interface IUsersServiceUpdateCreditWithManager {
  manager: EntityManager;
  user: User;
  amount: number;
  isDecrement: boolean;
}

export interface IUsersServiceUpdateUser {
  userId: string;
  updateUserDto: UpdateUserDto;
}
