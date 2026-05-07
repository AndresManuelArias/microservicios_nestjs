import { Module } from '@nestjs/common';
import { PaymentsServiceController } from './payments-service.controller';
import { PaymentsServiceService } from './payments-service.service';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [PaymentsModule],
  controllers: [PaymentsServiceController],
  providers: [PaymentsServiceService],
})
export class PaymentsServiceModule {}
