import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from '@app/common';
import { OrderStatus } from './entities/order.entity';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: Partial<Record<keyof OrdersService, jest.Mock>>;

  beforeEach(async () => {
    ordersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: ordersService }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('creates an order', async () => {
    const createDto: CreateOrderDto = {
      orderId: 'order-123',
      productId: 'prod-123',
      quantity: 2,
      totalAmount: 100,
    };
    const order = { id: 1, ...createDto, status: OrderStatus.PENDING };
    ordersService.create.mockResolvedValue(order);

    expect(await controller.create(createDto)).toEqual(order);
    expect(ordersService.create).toHaveBeenCalledWith(createDto);
  });

  it('returns all orders', async () => {
    const orders = [{ id: 1, orderId: 'order-123', productId: 'prod-123', quantity: 2, totalAmount: 100, status: OrderStatus.PENDING }];
    ordersService.findAll.mockResolvedValue(orders);

    expect(await controller.findAll()).toEqual(orders);
    expect(ordersService.findAll).toHaveBeenCalled();
  });

  it('returns one order by id', async () => {
    const order = { id: 1, orderId: 'order-123', productId: 'prod-123', quantity: 2, totalAmount: 100, status: OrderStatus.PENDING };
    ordersService.findOne.mockResolvedValue(order);

    expect(await controller.findOne('1')).toEqual(order);
    expect(ordersService.findOne).toHaveBeenCalledWith(1);
  });

  it('handles payment_processed events', async () => {
    await controller.handlePaymentProcessed({ orderId: 1 });

    expect(ordersService.updateStatus).toHaveBeenCalledWith(1, OrderStatus.CONFIRMED);
  });

  it('handles payment_failed events', async () => {
    await controller.handlePaymentFailed({ orderId: 1, reason: 'error' });

    expect(ordersService.updateStatus).toHaveBeenCalledWith(1, OrderStatus.CANCELLED);
  });

  it('handles inventory_failed events', async () => {
    await controller.handleInventoryFailed({ orderId: 1, reason: 'inventory issue' });

    expect(ordersService.updateStatus).toHaveBeenCalledWith(1, OrderStatus.INVENTORY_FAILED);
  });
});
