import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { In, Repository } from 'typeorm';
import { ICategoriesServiceCreateCategory } from './interfaces/categories-service.interface';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async createCategory({
    crateCategoryDto,
  }: ICategoriesServiceCreateCategory): Promise<Category> {
    return await this.categoriesRepository.save(crateCategoryDto);
  }

  async findCategories({ categoryIds }): Promise<Category[]> {
    return await this.categoriesRepository.find({
      where: { id: In(categoryIds) },
    });
  }
}
