import { NestFactory } from '@nestjs/core';
import { OrdersServiceModule } from './orders-service.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(OrdersServiceModule);


  const config = new DocumentBuilder()
    .setTitle('Orders Service API')
    .setDescription('API for managing orders in the distributed orders system')
    .setVersion('1.0')
    .addTag('orders', 'Order management endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.port ?? 3001);

  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrdersServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        queue: process.env.ORDERS_QUEUE || 'ORDERS_SERVICE_QUEUE',
        queueOptions: {
          durable: false,
        },
      },
    },
  );
  await microservice.listen();
}
bootstrap();
