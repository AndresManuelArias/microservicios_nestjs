import { NestFactory } from '@nestjs/core';
import { InventoryServiceModule } from './inventory-service.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(InventoryServiceModule); 
  
  const config = new DocumentBuilder()
    .setTitle('Inventory Service API')
    .setDescription('API for managing inventory in the distributed orders system')
    .setVersion('1.0')
    .addTag('inventory', 'Inventory management endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

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
