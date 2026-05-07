import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EventPattern } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from '../entities/inventory.entity';
import { Repository } from 'typeorm';




@Injectable()
export class InventoryServiceService {
    private readonly logger = new Logger(InventoryServiceService.name);
  
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @Inject('PAYMENTS_SERVICE') private client: ClientProxy) {}

  @EventPattern('order_created')
  async handleOrderCreated(data: { orderId: number; productId: string; quantity: number; totalAmount: number }) {
    // Mock stock validation - assume always available
    console.log(`[INVENTORY] Validating stock for order ${data.orderId}, product ${data.productId}, quantity ${data.quantity}`);

    // Publish inventory_reserved event
    console.log(`[INVENTORY] Publishing inventory_reserved event for order ${data.orderId}`);
    this.client.emit('inventory_reserved', {
      orderId: data.orderId,
      productId: data.productId,
      quantity: data.quantity,
      totalAmount: data.totalAmount,
    });
  }

    async reserveStock(orderData: any) {
    const { productId, quantity, orderId } = orderData;

    this.logger.log(`Intentando reservar ${quantity} unidades para el producto ${productId}`);

    // 1. Buscar el producto
    const item = await this.inventoryRepository.findOne({ where: { productId } });

    // 2. Validar existencia y cantidad
    if (!item || item.stock < quantity) {
      this.logger.error(`Stock insuficiente para el producto ${productId}`);
      
      // Emitimos evento de fallo para que el Order Service cancele la orden
      this.client.emit('inventory_failed', {
        orderId,
        reason: 'Inssuficient stock',
      });
      return;
    }
    item.stock -= quantity;
    await this.inventoryRepository.save(item);

    this.logger.log(`Stock reservado con éxito para la orden ${orderId}`);

    this.client.emit('inventory_reserved', {
      ...orderData,
      status: 'STOCK_RESERVED',
    });
  }
}
