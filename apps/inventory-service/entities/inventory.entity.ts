import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
@Entity()
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: string;

  @Column('int')
  stock: number;
}