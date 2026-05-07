import { NestFactory } from '@nestjs/core';
import { InventoryServiceModule } from './inventory-service.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(InventoryServiceModule); 
  
  app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: process.env.INVENTORY_QUEUE || 'INVENTORY_SERVICE_QUEUE',
          queueOptions: {
            durable: false,
          },
      },
    });

  await app.startAllMicroservices();
  await app.listen(3002);

}
bootstrap();
