import { NestFactory } from '@nestjs/core';
import { PaymentsServiceModule } from './payments-service.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentsServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        queue: 'payments_queue',
        queueOptions: {
          durable: false,
        },
      },
    },
  );
  await microservice.listen();
}
bootstrap();
