import { IsString, IsNumber, IsPositive } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  productId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  totalAmount: number;
}
