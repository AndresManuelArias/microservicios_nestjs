import { Controller,Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';

import { InventoryServiceService } from './inventory-service.service';
import { CreateInventoryDto } from '../dto/create-inventory.dto';


@Controller('inventory')
export class InventoryServiceController {
  constructor(private readonly inventoryServiceService: InventoryServiceService) {}
  @EventPattern('order_created')
  async handleOrderCreated(@Payload() data: any) {
    console.log(`[INVENTORY] Received order_created event:`, data);
    await this.inventoryServiceService.reserveStock(data);
  }
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo item en el inventario' })
  @ApiResponse({ 
    status: 201, 
    description: 'El item ha sido creado exitosamente.' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos.' 
  })
  async createRest(@Body() data: CreateInventoryDto) {
    return await this.inventoryServiceService.create(data);
  }
}
