import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Injectable()
export class InventoryServiceService {
  constructor(@Inject('INVENTORY_SERVICE') private client: ClientProxy) {}

  @EventPattern('order_created')
  async handleOrderCreated(data: { orderId: number; productId: string; quantity: number; totalAmount: number }) {
    // Mock stock validation - assume always available
    console.log(`Validating stock for order ${data.orderId}, product ${data.productId}, quantity ${data.quantity}`);

    // Publish inventory_reserved event
    this.client.emit('inventory_reserved', {
      orderId: data.orderId,
      productId: data.productId,
      quantity: data.quantity,
      totalAmount: data.totalAmount,
    });
  }
}
