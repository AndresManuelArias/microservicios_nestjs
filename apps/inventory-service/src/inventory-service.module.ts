import { Module } from '@nestjs/common';
import { InventoryServiceService } from './inventory-service.service';
import { RmqModule } from '../../../libs/common/src/rmq/rmq.module';

@Module({
  imports: [RmqModule.register({ name: 'PAYMENTS_SERVICE' })],
  providers: [InventoryServiceService],
})
export class InventoryServiceModule {}
