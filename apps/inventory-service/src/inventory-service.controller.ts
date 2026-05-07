import { Controller,Post, Body, Get, Logger, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';

import { InventoryServiceService } from './inventory-service.service';
import { CreateInventoryDto } from '../dto/create-inventory.dto';
import { CreateOrderDto,GenerateOrderDto } from '@app/common';
import { Inventory } from '../entities/inventory.entity';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';


@Controller('inventory')
export class InventoryServiceController {
  private readonly logger = new Logger(InventoryServiceController.name);
  
  constructor(private readonly inventoryServiceService: InventoryServiceService) {}
  @EventPattern('order_created')
  async handleOrderCreated(@Payload() data: CreateOrderDto) {
    this.logger.log(`[INVENTORY] Handling order created event for product ${data.productId}`);
    await this.inventoryServiceService.reserveStock(data);
  }
  @EventPattern('order_cancelled')
  async handleOrderCancelled(@Payload() data: GenerateOrderDto) {
    this.logger.log(`[INVENTORY] Received order_cancelled event:`, data);
    this.logger.log(`[INVENTORY] Releasing stock for cancelled order ${data.orderId} and product ${data.productId}`);
    await this.inventoryServiceService.releaseStock(data);
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
    this.logger.log(`[INVENTORY] Creating new inventory item for product ${data.productId}`);
    return await this.inventoryServiceService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los items del inventario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de items del inventario obtenida exitosamente.' 
  })
  async findAllRest() {
    this.logger.log(`[INVENTORY] Fetching all inventory items`);
    return await this.inventoryServiceService.findAll();
  }
  @Put()
  @ApiOperation({ summary: 'Actualizar el precio unitario de un producto en el inventario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Precio unitario actualizado exitosamente.' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos.' 
  })
  async updateUnitPrice(@Body() inventory: UpdateInventoryDto) {
    this.logger.log(`[INVENTORY] Updating unit price for product ${inventory.productId} to ${inventory.price}`);
    return await this.inventoryServiceService.updateUnitPrice(inventory);
  }

}
