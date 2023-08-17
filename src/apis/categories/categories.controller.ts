import { Body, Controller, Post } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

@Controller('/api/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async createCategory(
    @Body() crateCategoryDto: CreateCategoryDto, //
  ): Promise<Category> {
    const category = await this.categoriesService.createCategory({
      crateCategoryDto,
    });
    return category;
  }
}
