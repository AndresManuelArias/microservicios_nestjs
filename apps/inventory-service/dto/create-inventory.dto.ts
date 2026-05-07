import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateInventoryDto {
  @ApiProperty({ 
    example: 'prod-123777', 
    description: 'El identificador único del producto' 
  })
  @IsString()
  productId: string;

  @ApiProperty({ 
    example: 100, 
    description: 'Cantidad de existencias disponibles',
    minimum: 0 
  })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ 
    example: 10.99, 
    description: 'Precio unitario del producto',
    minimum: 0 
  })
  @IsNumber()
  @Min(0)
  price: number;
}