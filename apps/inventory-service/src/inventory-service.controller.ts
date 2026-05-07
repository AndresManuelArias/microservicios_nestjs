import { Controller,Post, Body } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';

import { InventoryServiceService } from './inventory-service.service';

@Controller('inventory')
export class InventoryServiceController {
  constructor(private readonly inventoryServiceService: InventoryServiceService) {}
  @EventPattern('order_created')
  async handleOrderCreated(@Payload() data: any) {
    console.log(`[INVENTORY] Received order_created event:`, data);
    await this.inventoryServiceService.reserveStock(data);
  }
  @Post()
  async createRest(@Body() data: any) {
    return await this.inventoryServiceService.create(data);
  }
}
