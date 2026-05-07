import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'; // <--- Importación corregida

import { Payment } from './entities/payment.entity';
import { GenerateOrderDto } from '@app/common';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) 
    private readonly paymentRepo: Repository<Payment>,
    @Inject('ORDERS_SERVICE') 
    private readonly ordersClient: ClientProxy,
  ) {}

  async processPayment(data: GenerateOrderDto) {

    const orderId = Number(data.orderId);
    const totalAmount = data.totalAmount;
    const priceUnit = data.priceUnit;
    const quantity = data.quantity;

    const existingPayment = await this.paymentRepo.findOneBy({ orderId });
    if (existingPayment) {
      console.log(`[PAYMENTS] Pago ya procesado para la orden ${orderId}. Ignorando.`);
      return;
    }

    console.log(`[PAYMENTS] Procesando cobro de $${totalAmount} para orden ${orderId}...`);
    
    let paymentSuccessful = true; 
    if( totalAmount < priceUnit*quantity){
       paymentSuccessful = false; 
    }

    if (paymentSuccessful) {

      await this.paymentRepo.save({ 
        orderId, 
        amount: totalAmount, 
        status: 'SUCCESS' 
      });
      
      this.ordersClient.emit('payment_processed', { orderId });
    } else {

      this.ordersClient.emit('payment_failed', { orderId, reason: 'Fondos insuficientes' });
    }
  }

  async failedOrder(orderId: number) {
    this.ordersClient.emit('inventory_failed', { orderId, reason: 'Inventario insuficientes' });
  }


}
