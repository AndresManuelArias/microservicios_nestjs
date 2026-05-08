import { Test, TestingModule } from '@nestjs/testing';
import { InventoryServiceController } from './inventory-service.controller';
import { InventoryServiceService } from './inventory-service.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '../entities/inventory.entity';
import { CreateOrderDto, GenerateOrderDto } from '@app/common';
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

describe('Inventory integration', () => {
  let controller: InventoryServiceController;
  let inventoryRepo: MockRepository;
  let paymentsClient: { emit: jest.Mock };

  beforeEach(async () => {
    inventoryRepo = mockRepository();
    paymentsClient = { emit: jest.fn() };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [InventoryServiceController],
      providers: [
        InventoryServiceService,
        { provide: getRepositoryToken(Inventory), useValue: inventoryRepo },
        { provide: 'PAYMENTS_SERVICE', useValue: paymentsClient },
      ],
    }).compile();

    controller = moduleFixture.get<InventoryServiceController>(InventoryServiceController);
  });

  it('reserves stock for order_created event through controller and service', async () => {
    const order: CreateOrderDto = { orderId: 'order-1', productId: 'prod-1', quantity: 2, totalAmount: 100 };
    const item = { id: 1, productId: 'prod-1', stock: 5, price: 50 };
    inventoryRepo.findOne.mockResolvedValue(item);
    inventoryRepo.save.mockResolvedValue({ ...item, stock: 3 });

    await controller.handleOrderCreated(order);

    expect(paymentsClient.emit).toHaveBeenCalledWith('inventory_reserved', {
      ...order,
      priceUnit: item.price,
      status: 'STOCK_RESERVED',
    });
  });

  it('creates inventory through REST and returns the created item', async () => {
    const body: CreateInventoryDto = { productId: 'prod-2', stock: 10, price: 20 };
    inventoryRepo.create.mockReturnValue(body);
    inventoryRepo.save.mockResolvedValue({ id: 1, ...body });

    const result = await controller.createRest(body);

    expect(result).toEqual({ id: 1, ...body });
  });
});
