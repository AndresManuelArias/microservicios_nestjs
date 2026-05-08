import { Test, TestingModule } from '@nestjs/testing';
import { InventoryServiceController } from './inventory-service.controller';
import { InventoryServiceService } from './inventory-service.service';
import { CreateOrderDto, GenerateOrderDto } from '@app/common';
import { CreateInventoryDto } from '../dto/create-inventory.dto';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';

type InventoryServiceMock = Partial<Record<keyof InventoryServiceService, jest.Mock>>;

describe('InventoryServiceController', () => {
  let controller: InventoryServiceController;
  let inventoryService: InventoryServiceMock;

  beforeEach(async () => {
    inventoryService = {
      reserveStock: jest.fn(),
      releaseStock: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      updateUnitPrice: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryServiceController],
      providers: [{ provide: InventoryServiceService, useValue: inventoryService }],
    }).compile();

    controller = module.get<InventoryServiceController>(InventoryServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('handles order_created event', async () => {
    const payload: CreateOrderDto = {
      orderId: 'order-123',
      productId: 'prod-123',
      quantity: 2,
      totalAmount: 100,
    };

    await controller.handleOrderCreated(payload);

    expect(inventoryService.reserveStock).toHaveBeenCalledWith(payload);
  });

  it('handles order_cancelled event', async () => {
    const payload: GenerateOrderDto = {
      orderId: 1,
      productId: 'prod-123',
      quantity: 2,
      totalAmount: 100,
      priceUnit: 50,
    };

    await controller.handleOrderCancelled(payload);

    expect(inventoryService.releaseStock).toHaveBeenCalledWith(payload);
  });

  it('creates inventory via REST', async () => {
    const body: CreateInventoryDto = {
      productId: 'prod-123',
      stock: 10,
      price: 50,
    };

    await controller.createRest(body);

    expect(inventoryService.create).toHaveBeenCalledWith(body);
  });

  it('returns inventory list via REST', async () => {
    await controller.findAllRest();

    expect(inventoryService.findAll).toHaveBeenCalled();
  });

  it('updates unit price via REST', async () => {
    const body: UpdateInventoryDto = {
      productId: 'prod-123',
      price: 15,
    };

    await controller.updateUnitPrice(body);

    expect(inventoryService.updateUnitPrice).toHaveBeenCalledWith(body);
  });

  it('returns inventory item by id via REST', async () => {
    await controller.findOne(1);

    expect(inventoryService.findOne).toHaveBeenCalledWith(1);
  });
});
