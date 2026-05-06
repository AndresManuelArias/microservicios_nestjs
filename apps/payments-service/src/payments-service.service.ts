import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Injectable()
export class PaymentsServiceService {
  constructor(@Inject('PAYMENTS_SERVICE') private client: ClientProxy) {}

  @EventPattern('inventory_reserved')
  async handleInventoryReserved(data: { orderId: number; productId: string; quantity: number; totalAmount: number }) {
    // Simulate payment processing - always success
    console.log(`Processing payment for order ${data.orderId}, amount ${data.totalAmount}`);

    // Publish payment_processed event
    this.client.emit('payment_processed', {
      orderId: data.orderId,
    });
  }
}
