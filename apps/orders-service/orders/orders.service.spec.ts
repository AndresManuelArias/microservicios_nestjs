import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from './entities/order.entity';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const mockRepository = (): MockRepository => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
});

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: MockRepository;
  let inventoryClient: { emit: jest.Mock };

  beforeEach(async () => {
    inventoryClient = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: mockRepository() },
        { provide: 'INVENTORY_SERVICE', useValue: inventoryClient },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepository = module.get<MockRepository>(getRepositoryToken(Order));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates an order and emits order_created', async () => {
    const createDto = {
      orderId: 'order-123',
      productId: 'prod-123',
      quantity: 2,
      totalAmount: 100,
    };
    const orderEntity = { ...createDto, status: OrderStatus.PENDING };
    const savedOrder = { id: 1, ...orderEntity };

    orderRepository.create?.mockReturnValue(orderEntity);
    orderRepository.save?.mockResolvedValue(savedOrder);

    const result = await service.create(createDto);

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
    expect(result).toEqual(savedOrder);
  });

  it('throws ConflictException on duplicate order', async () => {
    const createDto = {
      orderId: 'order-123',
      productId: 'prod-123',
      quantity: 2,
      totalAmount: 100,
    };
    const orderEntity = { ...createDto, status: OrderStatus.PENDING };

    orderRepository.create?.mockReturnValue(orderEntity);
    orderRepository.save?.mockRejectedValue({ code: '23505' });

    await expect(service.create(createDto)).rejects.toThrow('La orden con el producto prod-123 ya existe.');
  });

  it('returns all orders', async () => {
    const orders = [{ id: 1, orderId: 'order-123', productId: 'prod-123', quantity: 2, totalAmount: 100, status: OrderStatus.PENDING }];
    orderRepository.find?.mockResolvedValue(orders);

    expect(await service.findAll()).toBe(orders);
  });

  it('returns one order by id', async () => {
    const order = { id: 1, orderId: 'order-123', productId: 'prod-123', quantity: 2, totalAmount: 100, status: OrderStatus.PENDING };
    orderRepository.findOneBy?.mockResolvedValue(order);

    expect(await service.findOne(1)).toBe(order);
  });

  it('updates order status and saves the order', async () => {
    const order = {
      id: 1,
      orderId: 'order-123',
      productId: 'prod-123',
      quantity: 2,
      totalAmount: 100,
      status: OrderStatus.PENDING,
    };
    const updatedOrder = { ...order, status: OrderStatus.CONFIRMED };

    orderRepository.findOneBy?.mockResolvedValue(order);
    orderRepository.save?.mockResolvedValue(updatedOrder);

    await service.updateStatus(1, OrderStatus.CONFIRMED);

    expect(orderRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(orderRepository.save).toHaveBeenCalledWith(updatedOrder);
  });

  it('emits order_cancelled when status is CANCELLED', async () => {
    const order = {
      id: 1,
      orderId: 'order-123',
      productId: 'prod-123',
      quantity: 2,
      totalAmount: 100,
      status: OrderStatus.PENDING,
    };

    orderRepository.findOneBy?.mockResolvedValue(order);
    orderRepository.save?.mockResolvedValue({ ...order, status: OrderStatus.CANCELLED });

    await service.updateStatus(1, OrderStatus.CANCELLED);

    expect(inventoryClient.emit).toHaveBeenCalledWith('order_cancelled', {
      productId: order.productId,
      quantity: order.quantity,
    });
  });

  it('handles payment_processed events', async () => {
    const updateStatusSpy = jest.spyOn(service, 'updateStatus').mockResolvedValue(undefined);

    await service.handlePaymentProcessed({ orderId: 1 });

    expect(updateStatusSpy).toHaveBeenCalledWith(1, OrderStatus.CONFIRMED);
  });
});
