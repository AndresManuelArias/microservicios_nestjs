import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { RmqModule } from '../../../libs/common/src/rmq/rmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    RmqModule.register({ name: 'INVENTORY_SERVICE' }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
