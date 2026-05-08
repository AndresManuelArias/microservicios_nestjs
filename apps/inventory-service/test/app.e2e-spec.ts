import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { InventoryServiceController } from '../src/inventory-service.controller';
import { InventoryServiceService } from '../src/inventory-service.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '../entities/inventory.entity';
import { CreateInventoryDto } from '../dto/create-inventory.dto';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const mockRepository = (): MockRepository => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  findOneBy: jest.fn(),
});

describe('InventoryServiceController (e2e)', () => {
  let app: INestApplication;
  let inventoryRepo: MockRepository;

  beforeAll(async () => {
    inventoryRepo = mockRepository();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [InventoryServiceController],
      providers: [
        InventoryServiceService,
        { provide: getRepositoryToken(Inventory), useValue: inventoryRepo },
        { provide: 'PAYMENTS_SERVICE', useValue: { emit: jest.fn() } },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/inventory (POST)', async () => {
    const body: CreateInventoryDto = { productId: 'prod-1', stock: 10, price: 20 };
    inventoryRepo.create?.mockReturnValue(body);
    inventoryRepo.save?.mockResolvedValue({ id: 1, ...body });

    await request(app.getHttpServer())
      .post('/inventory')
      .send(body)
      .expect(201)
      .expect({ id: 1, ...body });
  });

  it('/inventory (GET)', async () => {
    const items = [{ id: 1, productId: 'prod-1', stock: 10, price: 20 }];
    inventoryRepo.find?.mockResolvedValue(items);

    await request(app.getHttpServer())
      .get('/inventory')
      .expect(200)
      .expect(items);
  });

  it('/inventory (PUT)', async () => {
    const body: UpdateInventoryDto = { productId: 'prod-1', price: 25 };

    await request(app.getHttpServer())
      .put('/inventory')
      .send(body)
      .expect(200);
  });

  it('/inventory/:id (GET)', async () => {
    const item = { id: 1, productId: 'prod-1', stock: 10, price: 20 };
    inventoryRepo.findOneBy?.mockResolvedValue(item);

    await request(app.getHttpServer())
      .get('/inventory/1')
      .expect(200)
      .expect(item);
  });
});
