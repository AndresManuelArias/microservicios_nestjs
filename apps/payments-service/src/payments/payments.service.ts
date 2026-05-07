import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject('ORDERS_SERVICE') private readonly ordersClient: ClientProxy,
  ) {}

  async processPayment(data: any) {
    const { orderId, totalAmount } = data;
    
    console.log(`[PAYMENTS] Procesando pago de $${totalAmount} para orden ${orderId}...`);


    const isSuccess = true; 

    if (isSuccess) {
      this.ordersClient.emit('payment_processed', { orderId, status: 'SUCCESS' });
    } else {
      this.ordersClient.emit('payment_failed', { orderId, status: 'FAILED' });
    }
  }
  create(createPaymentDto: CreatePaymentDto) {
    return 'This action adds a new payment';
  }

  findAll() {
    return `This action returns all payments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
