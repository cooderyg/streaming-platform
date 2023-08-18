import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';
import { CreateInterestsDto } from './dto/create-interests.dto';
import { InterestsService } from './interests.service';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import { Interest } from './entities/interest.entity';
import { UpdateInterestsDto } from './dto/update-interests.dto';

@Controller('api/interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @UseGuards(AccessAuthGuard)
  @Post()
  async createInterests(
    @Body() createInterestsDto: CreateInterestsDto,
    @User() user: UserAfterAuth,
  ): Promise<Interest[]> {
    const interests = await this.interestsService.createInterests({
      createInterestsDto,
      userId: user.id,
    });
    return interests;
  }

  @UseGuards(AccessAuthGuard)
  @Put()
  async updateInterests(
    @Body() updateInterestsDto: UpdateInterestsDto,
    @User() user: UserAfterAuth,
  ): Promise<Interest[]> {
    const interests = await this.interestsService.updateInterests({
      updateInterestsDto,
      userId: user.id,
    });
    return interests;
  }
}
