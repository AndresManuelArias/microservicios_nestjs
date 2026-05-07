import { Injectable, Logger, Inject, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from '../entities/inventory.entity';
import { Repository } from 'typeorm';
import { CreateInventoryDto } from '../dto/create-inventory.dto';

@Injectable()
export class InventoryServiceService {
    private readonly logger = new Logger(InventoryServiceService.name);
  
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @Inject('PAYMENTS_SERVICE') private client: ClientProxy) {}



  async reserveStock(orderData: any) {
    const { productId, quantity, orderId } = orderData;

    this.logger.log(`Intentando reservar ${quantity} unidades para el producto ${productId}`);


    const item = await this.inventoryRepository.findOne({ where: { productId } });


    if (!item || item.stock < quantity) {
      this.logger.error(`Stock insuficiente para el producto ${productId}`);
      

      this.client.emit('inventory_failed', {
        orderId,
        reason: 'Inssuficient stock',
      });
      return;
    }
    item.stock -= quantity;
    await this.inventoryRepository.save(item);

    this.logger.log(`Stock reservado con éxito para la orden ${orderId}`);

    this.client.emit('inventory_reserved', {
      ...orderData,
      status: 'STOCK_RESERVED',
    });
  }

  async create(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    try{

      const newItem = this.inventoryRepository.create(createInventoryDto);
      return await this.inventoryRepository.save(newItem);
  

    } catch (error:any) {

      if (error.code === '23505') {
        throw new ConflictException(
          `La orden con el producto ${createInventoryDto.productId} ya existe.`
        );
      }
      throw new InternalServerErrorException('Error al crear la orden en la base de datos');
    }
  }
}
