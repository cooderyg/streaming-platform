import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SubscribesService } from './subscribes.service';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import { ToggleSubscribeDto } from './dto/toggle-subscribe.dto';
import { ToggleSubscribeResDto } from './dto/res.dto';

@Controller('api/subscribes')
export class SubscribesController {
  constructor(private readonly subscribesService: SubscribesService) {}

  @UseGuards(AccessAuthGuard)
  @Post()
  async toggleSubscribe(
    @Body() toggleSubscribeDto: ToggleSubscribeDto, //
    @User() user: UserAfterAuth,
  ): Promise<ToggleSubscribeResDto> {
    const isSubscribed = await this.subscribesService.toggleSubscribe({
      toggleSubscribeDto,
      userId: user.id,
    });

    return { isSubscribed };
  }
}
