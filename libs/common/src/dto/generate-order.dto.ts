import { IsString, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateOrderDto {

  @ApiProperty({
    description: 'The unique identifier of the order of the client',
    example: 'order-123',
  })

  @IsString()
  orderId: string;
  @ApiProperty({
    description: 'The unique identifier of the product',
    example: 'prod-123',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'The quantity of the product to order',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: 'The total amount for the order',
    example: 100.50,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  totalAmount: number;

  @IsNumber()
  @IsPositive()
  priceUnit:number
}