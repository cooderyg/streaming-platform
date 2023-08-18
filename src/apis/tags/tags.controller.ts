import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { AccessAuthGuard } from '../auth/guard/auth.guard';

@Controller('api/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @UseGuards(AccessAuthGuard)
  @Post()
  async createTags(@Body() createTagDto: CreateTagDto) {
    const tags = await this.tagsService.createTags({
      createTagDto,
    });
    return tags;
  }
}
