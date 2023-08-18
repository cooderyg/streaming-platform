import { EntityManager } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';

export interface IUsersServiceCreateUser {
  createUserDto: CreateUserDto;
}

export interface IUsersServiceFindByEmail {
  email: string;
}

export interface IUsersServiceFindById {
  userId: string;
}

export interface IUsersServiceUpdateCreditWithManager {
  manager: EntityManager;
  user: User;
  amount: number;
  isDecrement: boolean;
}
