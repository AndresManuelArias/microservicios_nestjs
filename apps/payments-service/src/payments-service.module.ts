import { Module } from '@nestjs/common';
import { PaymentsServiceController } from './payments-service.controller';
import { PaymentsServiceService } from './payments-service.service';
import { RmqModule } from '../../../libs/common/src/rmq/rmq.module';

@Module({
  imports: [RmqModule.register({ name: 'PAYMENTS_SERVICE' })],
  controllers: [PaymentsServiceController],
  providers: [PaymentsServiceService],
})
export class PaymentsServiceModule {}
