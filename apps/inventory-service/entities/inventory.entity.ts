import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
@Entity()
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  productId: string;

  @Column('int')
  stock: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })  
  price: number;
}