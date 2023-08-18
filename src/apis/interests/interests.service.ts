import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Interest } from './entities/interest.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IInterestsServiceCreateInterestMany,
  IInterestsServiceCreateInterests,
  IInterestsServiceDeleteInterestMany,
  IInterestsServiceFindByUserId,
  IInterestsServiceUpdateInterests,
} from './interfaces/interests-service.interface';

@Injectable()
export class InterestsService {
  constructor(
    @InjectRepository(Interest)
    private readonly interestsRepository: Repository<Interest>,
  ) {}

  async createInterests({
    createInterestsDto,
    userId,
  }: IInterestsServiceCreateInterests): Promise<Interest[]> {
    const { categoryIds } = createInterestsDto;

    const interests = await this.createInterestMany({ categoryIds, userId });
    return interests;
  }

  async updateInterests({
    updateInterestsDto,
    userId,
  }: IInterestsServiceUpdateInterests): Promise<Interest[]> {
    const { categoryIds } = updateInterestsDto;
    await this.deleteInterestMany({ userId });
    const interests = await this.createInterestMany({ categoryIds, userId });

    return interests;
  }

  async createInterestMany({
    categoryIds,
    userId,
  }: IInterestsServiceCreateInterestMany): Promise<Interest[]> {
    const temp = [];
    categoryIds.forEach((categoryId) => {
      const interest = this.interestsRepository.create({
        category: { id: categoryId },
        user: { id: userId },
      });
      temp.push(interest);
    });

    const interests = await this.interestsRepository.save(temp);
    return interests;
  }

  async deleteInterestMany({
    userId,
  }: IInterestsServiceDeleteInterestMany): Promise<void> {
    const interests = await this.findByUserId({ userId });

    const interestIds = interests.map((el) => el.id);

    await this.interestsRepository.delete(interestIds);
  }

  async findByUserId({
    userId,
  }: IInterestsServiceFindByUserId): Promise<Interest[]> {
    return await this.interestsRepository.find({
      where: { user: { id: userId } },
    });
  }
}
