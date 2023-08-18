import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { UsersModule } from '../users/users.module';
import { CreditHistory } from '../creditHistories/entities/credit-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), UsersModule, CreditHistory],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
