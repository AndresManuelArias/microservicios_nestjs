import { Test, TestingModule } from '@nestjs/testing';
import { InventoryServiceController } from './inventory-service.controller';
import { InventoryServiceService } from './inventory-service.service';

describe('InventoryServiceController', () => {
  let inventoryServiceController: InventoryServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [InventoryServiceController],
      providers: [InventoryServiceService],
    }).compile();

    inventoryServiceController = app.get<InventoryServiceController>(InventoryServiceController);
  });


});
