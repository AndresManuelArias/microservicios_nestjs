import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class Order {
  @ApiProperty({
    description: 'The unique identifier of the order',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'The unique identifier of the product',
    example: 'prod-123',
  })
  @Column({ unique: true })
  @Column()
  productId: string;

  @ApiProperty({
    description: 'The quantity of the product ordered',
    example: 2,
  })
  @Column()
  quantity: number;

  @ApiProperty({
    description: 'The total amount of the order',
    example: 100.50,
  })
  @Column()
  totalAmount: number;

  @ApiProperty({
    description: 'The current status of the order',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;
}
