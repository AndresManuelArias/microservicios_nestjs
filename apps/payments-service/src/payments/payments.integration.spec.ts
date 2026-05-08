import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { GenerateOrderDto } from '@app/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const mockRepository = (): MockRepository => ({
  findOneBy: jest.fn(),
  save: jest.fn(),
});

describe('Payments integration', () => {
  let controller: PaymentsController;
  let paymentRepo: MockRepository;
  let ordersClient: { emit: jest.Mock };

  beforeEach(async () => {
    paymentRepo = mockRepository();
    ordersClient = { emit: jest.fn() };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: 'ORDERS_SERVICE', useValue: ordersClient },
      ],
    }).compile();

    controller = moduleFixture.get<PaymentsController>(PaymentsController);
  });

  it('processes inventory_reserved event through controller and service', async () => {
    paymentRepo.findOneBy?.mockResolvedValue(undefined);
    paymentRepo.save?.mockResolvedValue({ id: 1, orderId: 1, amount: 100, status: 'SUCCESS' });

    const payload: GenerateOrderDto = {
      orderId: '1',
      productId: 'prod-123',
      quantity: 2,
      priceUnit: 25,
      totalAmount: 100,
    };

    await controller.handleInventoryReserved(payload);

    expect(paymentRepo.save).toHaveBeenCalledWith({ orderId: 1, amount: 100, status: 'SUCCESS' });
    expect(ordersClient.emit).toHaveBeenCalledWith('payment_processed', { orderId: 1 });
  });
});
