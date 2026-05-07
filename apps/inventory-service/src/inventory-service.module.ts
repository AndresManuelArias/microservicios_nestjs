import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryServiceService } from './inventory-service.service';
import { RmqModule } from '../../../libs/common/src/rmq/rmq.module';
import { InventoryServiceController } from './inventory-service.controller';
import { Inventory } from '../entities/inventory.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'user',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'orders_db',
      entities: [Inventory],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Inventory]),
    RmqModule.register({ name: 'PAYMENTS_SERVICE' }),
  ],
  providers: [InventoryServiceService],
  controllers: [InventoryServiceController],
})
export class InventoryServiceModule {}
