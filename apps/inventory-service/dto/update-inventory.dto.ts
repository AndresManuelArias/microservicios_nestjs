import { PartialType } from '@nestjs/mapped-types';
import { CreateInventoryDto } from './create-inventory.dto';
import { IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class UpdateInventoryDto extends PartialType(CreateInventoryDto) {
  @ApiProperty({ 
    example: 'prod-123777', 
    description: 'El identificador único del producto' 
  })
  @IsString()
  productId: string;
   
  @ApiProperty({ 
      example: 10.99, 
      description: 'Precio unitario del producto',
      minimum: 0 
    })
    @IsNumber()
    @Min(0)
    price: number;
}
