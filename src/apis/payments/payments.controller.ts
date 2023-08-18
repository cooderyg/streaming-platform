import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessAuthGuard } from '../auth/guard/auth.guard';
import { CreatePaymentDto } from './dto/create-payments.dto';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';
import { PaymentsService } from './payments.service';
import { CancelPaymentDto } from './dto/cancel-payment.dto';
import { PageReqDto } from 'src/commons/dto/page-req.dto';
import { Payment } from './entities/payment.entity';

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(AccessAuthGuard)
  @Get(':paymentId')
  async findPayment(
    @User() user: UserAfterAuth,
    @Param('paymentId') paymentId: string,
  ): Promise<Payment> {
    const payment = await this.paymentsService.findPayment({
      userId: user.id,
      paymentId,
    });
    return payment;
  }

  @UseGuards(AccessAuthGuard)
  @Get()
  async findPayments(
    @Query() { page, size }: PageReqDto, //
    @User() user: UserAfterAuth,
  ): Promise<Payment[]> {
    const payments = await this.paymentsService.findPayments({
      page,
      size,
      userId: user.id,
    });
    return payments;
  }

  @UseGuards(AccessAuthGuard)
  @Post()
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @User() user: UserAfterAuth,
  ): Promise<Payment> {
    const payment = await this.paymentsService.createPayment({
      createPaymentDto,
      userId: user.id,
    });
    return payment;
  }

  @UseGuards(AccessAuthGuard)
  @Put('cancel')
  async cancelPayment(
    @Body() cancelPaymentDto: CancelPaymentDto,
    @User() user: UserAfterAuth,
  ): Promise<Payment> {
    const payment = await this.paymentsService.cancelPayment({
      cancelPaymentDto,
      userId: user.id,
    });
    return payment;
  }
}
