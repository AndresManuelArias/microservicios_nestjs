import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { OrdersController } from '../orders/orders.controller';
import { OrdersService } from '../orders/orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
});

describe('OrdersServiceController (e2e)', () => {
  let app: INestApplication;
  let orderRepository: ReturnType<typeof mockRepository>;

  beforeAll(async () => {
    orderRepository = mockRepository();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: orderRepository },
        { provide: 'INVENTORY_SERVICE', useValue: { emit: jest.fn() } },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/orders (POST)', async () => {
    const createDto = {
      orderId: 'order-123',
      productId: 'prod-123',
      quantity: 2,
      totalAmount: 100,
    };
    const savedOrder = { id: 1, ...createDto, status: 'PENDING' };

    orderRepository.create.mockReturnValue({ ...createDto, status: 'PENDING' });
    orderRepository.save.mockResolvedValue(savedOrder);

    await request(app.getHttpServer())
      .post('/orders')
      .send(createDto)
      .expect(201)
      .expect(savedOrder);
  });

  it('/orders (GET)', async () => {
    const orders = [{ id: 1, orderId: 'order-123', productId: 'prod-123', quantity: 2, totalAmount: 100, status: 'PENDING' }];
    orderRepository.find.mockResolvedValue(orders);

    await request(app.getHttpServer())
      .get('/orders')
      .expect(200)
      .expect(orders);
  });

  it('/orders/:id (GET)', async () => {
    const order = { id: 1, orderId: 'order-123', productId: 'prod-123', quantity: 2, totalAmount: 100, status: 'PENDING' };
    orderRepository.findOneBy.mockResolvedValue(order);

    await request(app.getHttpServer())
      .get('/orders/1')
      .expect(200)
      .expect(order);
  });
});
