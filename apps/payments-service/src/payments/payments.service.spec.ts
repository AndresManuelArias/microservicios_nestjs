import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { GenerateOrderDto } from '@app/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const mockRepository = (): MockRepository => ({
  findOneBy: jest.fn(),
  save: jest.fn(),
});

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentRepo: MockRepository;
  let ordersClient: { emit: jest.Mock };

  beforeEach(async () => {
    paymentRepo = mockRepository();
    ordersClient = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: 'ORDERS_SERVICE', useValue: ordersClient },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('ignores payment if already processed', async () => {
    paymentRepo.findOneBy?.mockResolvedValue({ id: 1, orderId: 1, amount: 100, status: 'SUCCESS' });

    await service.processPayment({ orderId: '1', totalAmount: 100, priceUnit: 50, quantity: 2 } as GenerateOrderDto);

    expect(paymentRepo.findOneBy).toHaveBeenCalledWith({ orderId: 1 });
    expect(paymentRepo.save).not.toHaveBeenCalled();
    expect(ordersClient.emit).not.toHaveBeenCalled();
  });

  it('saves successful payment and emits payment_processed', async () => {
    paymentRepo.findOneBy?.mockResolvedValue(undefined);
    paymentRepo.save?.mockResolvedValue({ id: 1, orderId: 1, amount: 100, status: 'SUCCESS' });

    await service.processPayment({ orderId: '1', totalAmount: 100, priceUnit: 25, quantity: 2 } as GenerateOrderDto);

    expect(paymentRepo.save).toHaveBeenCalledWith({ orderId: 1, amount: 100, status: 'SUCCESS' });
    expect(ordersClient.emit).toHaveBeenCalledWith('payment_processed', { orderId: 1 });
  });

  it('emits payment_failed when funds are insufficient', async () => {
    paymentRepo.findOneBy?.mockResolvedValue(undefined);

    await service.processPayment({ orderId: '1', totalAmount: 30, priceUnit: 25, quantity: 2 } as GenerateOrderDto);

    expect(paymentRepo.save).not.toHaveBeenCalled();
    expect(ordersClient.emit).toHaveBeenCalledWith('payment_failed', { orderId: 1, reason: 'Fondos insuficientes' });
  });
});
