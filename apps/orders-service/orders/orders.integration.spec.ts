import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from './entities/order.entity';
import { Repository } from 'typeorm';
import { CreateOrderDto } from '@app/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const mockRepository = (): MockRepository => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
});

describe('OrdersModule integration', () => {
  let controller: OrdersController;
  let orderRepository: MockRepository;
  let inventoryClient: { emit: jest.Mock };

  beforeEach(async () => {
    inventoryClient = { emit: jest.fn() };
    orderRepository = mockRepository();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: orderRepository },
        { provide: 'INVENTORY_SERVICE', useValue: inventoryClient },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('creates an order through the controller and service', async () => {
    const createDto: CreateOrderDto = {
      orderId: 'order-123',
      productId: 'prod-123',
      quantity: 2,
      totalAmount: 100,
    };
    const orderEntity = { ...createDto, status: OrderStatus.PENDING };
    const savedOrder = { id: 1, ...orderEntity };

    orderRepository.create?.mockReturnValue(orderEntity);
    orderRepository.save?.mockResolvedValue(savedOrder);

    expect(await controller.create(createDto)).toEqual(savedOrder);
    expect(orderRepository.create).toHaveBeenCalledWith({
      ...createDto,
      status: OrderStatus.PENDING,
    });
    expect(orderRepository.save).toHaveBeenCalledWith(orderEntity);
    expect(inventoryClient.emit).toHaveBeenCalledWith('order_created', {
      orderId: savedOrder.id,
      productId: savedOrder.productId,
      quantity: savedOrder.quantity,
      totalAmount: savedOrder.totalAmount,
    });
  });

  it('returns a single order through the controller', async () => {
    const order = { id: 1, orderId: 'order-123', productId: 'prod-123', quantity: 2, totalAmount: 100, status: OrderStatus.PENDING };
    orderRepository.findOneBy?.mockResolvedValue(order);

    expect(await controller.findOne('1')).toEqual(order);
  });
});
