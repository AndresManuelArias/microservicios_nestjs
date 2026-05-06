import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({})
export class RmqModule {
  static register({ name }: { name: string }): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ClientsModule.register([
          {
            name,
            transport: Transport.RMQ,
            options: {
              urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
              queue: `${name}_QUEUE`,
              queueOptions: {
                durable: false,
              },
            },
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}