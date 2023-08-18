import { IsNotEmpty, IsUUID } from 'class-validator';

export class CancelPaymentDto {
  @IsNotEmpty()
  @IsUUID()
  paymentId: string;
}
