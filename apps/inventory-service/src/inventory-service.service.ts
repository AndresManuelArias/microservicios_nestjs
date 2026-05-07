import { Injectable, Logger, Inject, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from '../entities/inventory.entity';
import { Repository } from 'typeorm';
import { CreateInventoryDto } from '../dto/create-inventory.dto';
import { CreateOrderDto } from '@app/common';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';

@Injectable()
export class InventoryServiceService {
    private readonly logger = new Logger(InventoryServiceService.name);
  
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @Inject('PAYMENTS_SERVICE') private client: ClientProxy) {}



  async reserveStock(orderData: CreateOrderDto) {
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
    let priceUnit = item.price;

    this.logger.log(`Stock reservado con éxito para la orden ${orderId}`);

    this.client.emit('inventory_reserved', {
      ...orderData,
      priceUnit,
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
  async releaseStock(orderData: CreateOrderDto) {
    const { productId, quantity, orderId } = orderData;

    this.logger.log(`Intentando liberar ${quantity} unidades para el producto ${productId} debido a cancelación de orden ${orderId}`);

    const item = await this.inventoryRepository.findOne({ where: { productId } });

    if (!item) {
      this.logger.error(`Producto ${productId} no encontrado para liberar stock`);
      return;
    }
    item.stock += quantity;
    await this.inventoryRepository.save(item);

    this.logger.log(`Stock liberado con éxito para la orden ${orderId}`);
  }

  findAll() {
    this.logger.log('Obteniendo todos los items del inventario');
    return this.inventoryRepository.find();
  }
  async updateUnitPrice(inventory: UpdateInventoryDto) {
    this.logger.log(`Actualizando precio unitario para el producto ${inventory.productId} a ${inventory.price}`);
    let priceUnit = inventory.price;
    await this.inventoryRepository.update({ productId: inventory.productId }, { price: priceUnit });
    this.logger.log(`Precio unitario actualizado con éxito para el producto ${inventory.productId} a ${priceUnit}`);
  }
  async findOne(id: number) {
    this.logger.log(`Obteniendo item del inventario con id ${id}`);
    return await this.inventoryRepository.findOneBy({ id });    
  }
}
