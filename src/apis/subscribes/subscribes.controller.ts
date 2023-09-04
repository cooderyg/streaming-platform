import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SubscribesService } from './subscribes.service';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import { ToggleSubscribeDto } from './dto/toggle-subscribe.dto';
import {
  CheckSubscribeResDto,
  ToggleSubscribeResDto,
  getSubscribeCountResDto,
} from './dto/res.dto';

@Controller('api/subscribes')
export class SubscribesController {
  constructor(private readonly subscribesService: SubscribesService) {}

  @UseGuards(AccessAuthGuard)
  @Get()
  async getSubscribeCount(
    @User() user: UserAfterAuth,
  ): Promise<getSubscribeCountResDto> {
    const count = await this.subscribesService.getSubscribeCount({
      userId: user.id,
    });

    return { count };
  }

  @UseGuards(AccessAuthGuard)
  @Get('check/:channelId')
  async checkSubscribe(
    @Param('channelId') channelId: string, //
    @User() user: UserAfterAuth,
  ): Promise<CheckSubscribeResDto> {
    const isSubscribed = await this.subscribesService.checkSubscribe({
      channelId,
      userId: user.id,
    });

    return { isSubscribed };
  }

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

  @Post('/dummy')
  async toggleSubscribeForDummy(
    @Body() toggleSubscribeDto: { channelId: string; userId: string },
  ): Promise<ToggleSubscribeResDto> {
    const isSubscribed = await this.subscribesService.toggleSubscribeForDummy(
      toggleSubscribeDto,
    );

    return { isSubscribed };
  }
}
