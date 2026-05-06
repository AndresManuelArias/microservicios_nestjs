import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @Inject('INVENTORY_SERVICE') private client: ClientProxy,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const order = this.orderRepository.create({
      ...createOrderDto,
      status: OrderStatus.PENDING,
    });
    const savedOrder = await this.orderRepository.save(order);

    // Publish order_created event
    console.log('Publishing order_created event:', {
      orderId: savedOrder.id,
      productId: savedOrder.productId,
      quantity: savedOrder.quantity,
      totalAmount: savedOrder.totalAmount,
    });
    this.client.emit('order_created', {
      orderId: savedOrder.id,
      productId: savedOrder.productId,
      quantity: savedOrder.quantity,
      totalAmount: savedOrder.totalAmount,
    });

    return savedOrder;
  }

  @EventPattern('payment_processed')
  async handlePaymentProcessed(data: { orderId: number }) {
    await this.updateStatus(data.orderId, OrderStatus.CONFIRMED);
    console.log(`[ORDERS] Order ${data.orderId} confirmed`);
  }

  findAll() {
    return this.orderRepository.find();
  }

  findOne(id: number) {
    return this.orderRepository.findOneBy({ id });
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return this.orderRepository.update(id, updateOrderDto);
  }

  remove(id: number) {
    return this.orderRepository.delete(id);
  }

  async updateStatus(id: number, status: OrderStatus) {
    await this.orderRepository.update(id, { status });
  }
}
