import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryServiceService } from './inventory-service.service';
import { Inventory } from '../entities/inventory.entity';
import { CreateInventoryDto } from '../dto/create-inventory.dto';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';
import { CreateOrderDto, GenerateOrderDto } from '@app/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const mockRepository = (): MockRepository => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  findOneBy: jest.fn(),
});

describe('InventoryServiceService', () => {
  let service: InventoryServiceService;
  let inventoryRepo: MockRepository;
  let paymentsClient: { emit: jest.Mock };

  beforeEach(async () => {
    inventoryRepo = mockRepository();
    paymentsClient = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryServiceService,
        { provide: getRepositoryToken(Inventory), useValue: inventoryRepo },
        { provide: 'PAYMENTS_SERVICE', useValue: paymentsClient },
      ],
    }).compile();

    service = module.get<InventoryServiceService>(InventoryServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('emits inventory_reserved when stock is sufficient', async () => {
    const order: CreateOrderDto = { orderId: 'order-1', productId: 'prod-1', quantity: 2, totalAmount: 100 };
    const item = { id: 1, productId: 'prod-1', stock: 5, price: 50 };
    inventoryRepo.findOne.mockResolvedValue(item);
    inventoryRepo.save.mockResolvedValue({ ...item, stock: 3 });

    await service.reserveStock(order);

    expect(inventoryRepo.save).toHaveBeenCalledWith({ ...item, stock: 3 });
    expect(paymentsClient.emit).toHaveBeenCalledWith('inventory_reserved', {
      ...order,
      priceUnit: item.price,
      status: 'STOCK_RESERVED',
    });
  });

  it('emits inventory_failed when stock is insufficient', async () => {
    const order: CreateOrderDto = { orderId: 'order-2', productId: 'prod-2', quantity: 10, totalAmount: 100 };
    inventoryRepo.findOne.mockResolvedValue({ id: 1, productId: 'prod-2', stock: 5, price: 10 });

    await service.reserveStock(order);

    expect(paymentsClient.emit).toHaveBeenCalledWith('inventory_failed', {
      orderId: 'order-2',
      reason: 'Inssuficient stock',
    });
  });

  it('releases stock when item exists', async () => {
    const order: CreateOrderDto = { orderId: 'order-3', productId: 'prod-3', quantity: 1, totalAmount: 10 };
    const item = { id: 1, productId: 'prod-3', stock: 5, price: 20 };
    inventoryRepo.findOne.mockResolvedValue(item);
    inventoryRepo.save.mockResolvedValue({ ...item, stock: 6 });

    await service.releaseStock(order);

    expect(inventoryRepo.save).toHaveBeenCalledWith({ ...item, stock: 6 });
  });

  it('creates inventory item successfully', async () => {
    const body: CreateInventoryDto = { productId: 'prod-4', stock: 20, price: 10 };
    inventoryRepo.create.mockReturnValue(body);
    inventoryRepo.save.mockResolvedValue({ id: 1, ...body });

    const result = await service.create(body);

    expect(inventoryRepo.create).toHaveBeenCalledWith(body);
    expect(inventoryRepo.save).toHaveBeenCalledWith(body);
    expect(result).toEqual({ id: 1, ...body });
  });

  it('updates unit price successfully', async () => {
    const payload: UpdateInventoryDto = { productId: 'prod-5', price: 15 };

    await service.updateUnitPrice(payload);

    expect(inventoryRepo.update).toHaveBeenCalledWith({ productId: payload.productId }, { price: payload.price });
  });

  it('finds all inventory items', async () => {
    const items = [{ id: 1, productId: 'prod-1', stock: 10, price: 20 }];
    inventoryRepo.find.mockResolvedValue(items);

    expect(await service.findAll()).toBe(items);
  });

  it('finds one inventory item by id', async () => {
    const item = { id: 1, productId: 'prod-1', stock: 10, price: 20 };
    inventoryRepo.findOneBy.mockResolvedValue(item);

    expect(await service.findOne(1)).toBe(item);
  });
});
