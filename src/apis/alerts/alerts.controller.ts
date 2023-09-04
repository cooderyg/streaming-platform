import { Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';
import { AlertsService } from './alerts.service';
import { PageReqDto } from 'src/commons/dto/page-req.dto';
import { Alert } from './entities/alert.entity';
import { ReadAlertResDto } from './dto/res.dto';

@Controller('api/alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @UseGuards(AccessAuthGuard)
  @Get()
  async getAlerts(
    @Query() { page, size }: PageReqDto,
    @User() user: UserAfterAuth, //
  ): Promise<Alert[]> {
    const alerts = await this.alertsService.getAlerts({
      userId: user.id,
      page,
      size,
    });

    return alerts;
  }

  @UseGuards(AccessAuthGuard)
  @Put('read/:alertId')
  async readAlert(
    @Param('alertId') alertId: string, //
    @User() user: UserAfterAuth,
  ): Promise<ReadAlertResDto> {
    await this.alertsService.readAlert({ alertId, userId: user.id });

    return { message: '수정완료' };
  }
}
