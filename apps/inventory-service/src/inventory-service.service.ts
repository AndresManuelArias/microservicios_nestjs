import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Injectable()
export class InventoryServiceService {
  constructor(@Inject('PAYMENTS_SERVICE') private client: ClientProxy) {}

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
}
