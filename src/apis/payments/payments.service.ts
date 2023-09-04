import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PAYMENTSTATUS, Payment } from './entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import {
  IPaymentsServiceCancelPayment,
  IPaymentsServiceCreatePayment,
  IPaymentsServiceFindById,
  IPaymentsServiceFindByIdAndUserId,
  IPaymentsServiceFindByImpUid,
  IPaymentsServiceFindPayment,
  IPaymentsServiceFindPayments,
  IPaymentsServiceUpdateStatusWithManager,
} from './interfaces/payments-service.interface';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
  ) {}

  async findPayment({
    paymentId,
    userId,
  }: IPaymentsServiceFindPayment): Promise<Payment> {
    const payment = await this.findByIdAneUserId({ paymentId, userId });
    if (!payment) throw new NotFoundException();
    return payment;
  }

  async findPayments({
    page,
    size,
    userId,
  }: IPaymentsServiceFindPayments): Promise<Payment[]> {
    return await this.paymentsRepository
      .createQueryBuilder('payment')
      .select([
        'payment.id',
        'payment.status',
        'payment.amount',
        'payment.impUid',
        'payment.createdAt',
        'payment.updatedAt',
      ])
      .leftJoin('payment.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy({ 'payment.createdAt': 'DESC' })
      .take(size)
      .skip((page - 1) * size)
      .getMany();
  }

  async createPayment({
    createPaymentDto,
    userId,
  }: IPaymentsServiceCreatePayment): Promise<Payment> {
    const { amount, impUid } = createPaymentDto;

    const isExist = await this.findByImpUid({ impUid });

    if (isExist) throw new ConflictException('이미 등록된 결제입니다.');
    const paymentEntity = this.paymentsRepository.create({
      amount,
      impUid,
      user: { id: userId },
    });
    const user = await this.usersService.findById({ userId });

    if (!user) throw new NotFoundException();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const manager = queryRunner.manager;
    try {
      // 1. 결제 생성
      const payment = await manager.save(Payment, paymentEntity);

      // 2. 유저 크레딧 업데이트
      await this.usersService.updateCreditWithManager({
        manager,
        user,
        amount,
        isDecrement: false,
      });
      await queryRunner.commitTransaction();
      return payment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, error.status || 500);
    } finally {
      await queryRunner.release();
    }
  }

  async cancelPayment({
    cancelPaymentDto,
    userId,
  }: IPaymentsServiceCancelPayment): Promise<Payment> {
    const { paymentId } = cancelPaymentDto;

    const payment = await this.findById({ paymentId });
    if (payment.status === PAYMENTSTATUS.CANCEL)
      throw new ConflictException('이미 취소된 결제입니다.');

    const user = await this.usersService.findById({ userId });
    if (!user) throw new NotFoundException();

    if (user.credit < payment.amount)
      throw new ConflictException('취소할 포인트가 부족합니다.');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const manager = queryRunner.manager;
    try {
      // 1. 결제 취소
      const _payment = await this.updateStatusWithManager({ manager, payment });

      // 2. 유저 크레딧 업데이트
      await this.usersService.updateCreditWithManager({
        manager,
        user,
        amount: payment.amount,
        isDecrement: true,
      });

      // TODO: iamport service 취소 로직 추가하기
      await queryRunner.commitTransaction();
      return _payment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, error.status || 500);
    } finally {
      await queryRunner.release();
    }
  }

  async findById({ paymentId }: IPaymentsServiceFindById): Promise<Payment> {
    return await this.paymentsRepository.findOne({ where: { id: paymentId } });
  }

  async findByIdAneUserId({
    paymentId,
    userId,
  }: IPaymentsServiceFindByIdAndUserId): Promise<Payment> {
    return await this.paymentsRepository
      .createQueryBuilder('payment')
      .select([
        'payment.id',
        'payment.status',
        'payment.amount',
        'payment.impUid',
        'payment.createdAt',
        'payment.updatedAt',
        'user.id',
      ])
      .leftJoin('payment.user', 'user')
      .where('payment.id = :paymentId', { paymentId })
      .andWhere('user.id = :userId', { userId })
      .getOne();
  }

  async findByImpUid({
    impUid,
  }: IPaymentsServiceFindByImpUid): Promise<Payment> {
    return await this.paymentsRepository.findOne({
      where: { impUid },
    });
  }

  async updateStatusWithManager({
    manager,
    payment,
  }: IPaymentsServiceUpdateStatusWithManager): Promise<Payment> {
    return await manager.save(Payment, {
      ...payment,
      status: PAYMENTSTATUS.CANCEL,
    });
  }
}
