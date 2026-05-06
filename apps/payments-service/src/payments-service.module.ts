import { Module } from '@nestjs/common';
import { PaymentsServiceService } from './payments-service.service';
import { RmqModule } from '../../../libs/common/src/rmq/rmq.module';

@Module({
  imports: [RmqModule.register({ name: 'ORDERS_SERVICE' })],
  providers: [PaymentsServiceService],
})
export class PaymentsServiceModule {}
