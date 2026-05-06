import { Module } from '@nestjs/common';
import { InventoryServiceController } from './inventory-service.controller';
import { InventoryServiceService } from './inventory-service.service';
import { RmqModule } from '../../../libs/common/src/rmq/rmq.module';

@Module({
  imports: [RmqModule.register({ name: 'INVENTORY_SERVICE' })],
  controllers: [InventoryServiceController],
  providers: [InventoryServiceService],
})
export class InventoryServiceModule {}
