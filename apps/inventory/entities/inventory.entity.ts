@Entity()
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: string;

  @Column('int')
  stock: number;
}