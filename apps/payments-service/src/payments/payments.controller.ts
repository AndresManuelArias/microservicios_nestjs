import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller()
export class PaymentsController {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @EventPattern('inventory_reserved')
  async handleInventoryReserved(@Payload() data: any) {
    console.log('[PAYMENTS] Procesando pago para la orden:', data.orderId);
    return await this.paymentsService.processPayment(data);
  }
 


  @EventPattern('inventory_failed')
  async handleInventoryFailed(@Payload() data: { orderId: number, reason: string }) {
    this.logger.log(`[ORDERS] Cancelando orden ${data.orderId} debido a: ${data.reason}`);
    await this.paymentsService.failedOrder(data.orderId);
  }
}
