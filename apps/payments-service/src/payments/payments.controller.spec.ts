import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { GenerateOrderDto } from '@app/common';

type PaymentsServiceMock = Partial<Record<keyof PaymentsService, jest.Mock>>;

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let paymentsService: PaymentsServiceMock;

  beforeEach(async () => {
    paymentsService = {
      processPayment: jest.fn(),
      failedOrder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: paymentsService }],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('handles inventory_reserved events', async () => {
    const payload: GenerateOrderDto = {
      orderId: '1',
      productId: 'prod-123',
      quantity: 2,
      priceUnit: 25,
      totalAmount: 50,
    };

    await controller.handleInventoryReserved(payload);

    expect(paymentsService.processPayment).toHaveBeenCalledWith(payload);
  });

  it('handles inventory_failed events', async () => {
    await controller.handleInventoryFailed({ orderId: 1, reason: 'error' });

    expect(paymentsService.failedOrder).toHaveBeenCalledWith(1);
  });
});
