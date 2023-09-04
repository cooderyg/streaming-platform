import { EntityManager } from 'typeorm';
import { CancelPaymentDto } from '../dto/cancel-payment.dto';
import { CreatePaymentDto } from '../dto/create-payments.dto';
import { Payment } from '../entities/payment.entity';

export interface IPaymentsServiceFindPayment {
  paymentId: string;
  userId: string;
}

export interface IPaymentsServiceFindPayments {
  page: number;
  size: number;
  userId: string;
}

export interface IPaymentsServiceCreatePayment {
  createPaymentDto: CreatePaymentDto;
  userId: string;
}

export interface IPaymentsServiceCancelPayment {
  cancelPaymentDto: CancelPaymentDto;
  userId: string;
}

export interface IPaymentsServiceFindById {
  paymentId: string;
}

export interface IPaymentsServiceFindByIdAndUserId {
  paymentId: string;
  userId: string;
}

export interface IPaymentsServiceFindByImpUid {
  impUid: string;
}

export interface IPaymentsServiceUpdateStatusWithManager {
  manager: EntityManager;
  payment: Payment;
}
