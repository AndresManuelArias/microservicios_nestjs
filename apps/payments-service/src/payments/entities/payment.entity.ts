import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity() // <--- ¡ESTO ES VITAL! Sin esto, no hay metadata.
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number;

  @Column('decimal')
  amount: number;

  @Column()
  status: string;
}