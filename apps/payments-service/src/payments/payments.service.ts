import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'; // <--- Importación corregida
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) 
    private readonly paymentRepo: Repository<Payment>,
    @Inject('ORDERS_SERVICE') 
    private readonly ordersClient: ClientProxy,
  ) {}

  async processPayment(data: any) {

    const orderId = Number(data.orderId);
    const totalAmount = data.totalAmount;


    const existingPayment = await this.paymentRepo.findOneBy({ orderId });
    if (existingPayment) {
      console.log(`[PAYMENTS] Pago ya procesado para la orden ${orderId}. Ignorando.`);
      return;
    }

    console.log(`[PAYMENTS] Procesando cobro de $${totalAmount} para orden ${orderId}...`);
    
    const paymentSuccessful = true; 

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
      this.ordersClient.emit('inventory_failed', { orderId, reason: 'Fondos insuficientes' });
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
