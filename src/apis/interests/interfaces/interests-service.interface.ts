import { CreateInterestsDto } from '../dto/create-interests.dto';
import { UpdateInterestsDto } from '../dto/update-interests.dto';

export interface IInterestsServiceCreateInterests {
  createInterestsDto: CreateInterestsDto;
  userId: string;
}

export interface IInterestsServiceUpdateInterests {
  updateInterestsDto: UpdateInterestsDto;
  userId: string;
}

export interface IInterestsServiceCreateInterestMany {
  categoryIds: string[];
  userId: string;
}

export interface IInterestsServiceDeleteInterestMany {
  userId: string;
}

export interface IInterestsServiceFindByUserId {
  userId: string;
}
