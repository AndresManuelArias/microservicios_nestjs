import { Controller, Get, Post, Body, Patch, Param, Delete, Logger } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Order } from './entities/order.entity';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrderStatus } from './entities/order.entity';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order', description: 'Creates a new order and initiates the saga process (inventory validation and payment processing)' })
  @ApiResponse({ status: 201, description: 'Order created successfully', type: Order })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders', description: 'Retrieves a list of all orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully', type: [Order] })
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID', description: 'Retrieves a specific order by its ID' })
  @ApiParam({ name: 'id', description: 'Order ID', type: Number })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully', type: Order })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order', description: 'Updates an existing order' })
  @ApiParam({ name: 'id', description: 'Order ID', type: Number })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order', description: 'Deletes an order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID', type: Number })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
  @EventPattern('payment_processed')
  async handlePaymentProcessed(@Payload() data: { orderId: number }) {
    console.log(`[ORDERS] Recibida confirmación de pago para orden: ${data.orderId}`);

    await this.ordersService.updateStatus(data.orderId,OrderStatus.CONFIRMED);
  }


  @EventPattern('payment_failed')
  async handlePaymentFailed(@Payload() data: { orderId: number, reason: string }) {
    console.log(`[ORDERS] Pago fallido para orden ${data.orderId}: ${data.reason}`);
    await this.ordersService.updateStatus(data.orderId, OrderStatus.CANCELLED);
  }

  @EventPattern('inventory_failed')
  async handleInventoryFailed(@Payload() data: { orderId: number, reason: string }) {
    this.logger.log(`[ORDERS] Cancelando orden ${data.orderId} debido a: ${data.reason}`);
    await this.ordersService.updateStatus(data.orderId, OrderStatus.CANCELLED);
  }
  
}
