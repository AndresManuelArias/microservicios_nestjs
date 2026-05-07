import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { PaymentsServiceModule } from './payments-service.module';

async function bootstrap() {
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentsServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'PAYMENTS_SERVICE_QUEUE',
        queueOptions: { durable: false },
      },
    },
  );
  await app.listen();
  console.log('Payments Microservice is listening...');
}
bootstrap();
