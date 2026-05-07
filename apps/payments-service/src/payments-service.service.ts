import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Injectable()
export class PaymentsServiceService {
  constructor(@Inject('ORDERS_SERVICE') private client: ClientProxy) {}

  @EventPattern('inventory_reserved')
  async handleInventoryReserved(data: { orderId: number; productId: string; quantity: number; totalAmount: number }) {

    console.log(`[PAYMENTS] Processing payment for order ${data.orderId}, amount ${data.totalAmount}`);


    console.log(`[PAYMENTS] Publishing payment_processed event for order ${data.orderId}`);
    this.client.emit('payment_processed', {
      orderId: data.orderId,
    });
  }
}
