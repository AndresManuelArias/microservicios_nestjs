import { Injectable, Inject, Logger } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @Inject('PAYMENTS_SERVICE') private readonly paymentsClient: ClientProxy,
  ) {}

  async reserveStock(orderData: any) {
    const { productId, quantity, orderId } = orderData;

    this.logger.log(`Intentando reservar ${quantity} unidades para el producto ${productId}`);

    // 1. Buscar el producto
    const item = await this.inventoryRepository.findOne({ where: { productId } });

    // 2. Validar existencia y cantidad
    if (!item || item.stock < quantity) {
      this.logger.error(`Stock insuficiente para el producto ${productId}`);
      
      // Emitimos evento de fallo para que el Order Service cancele la orden
      this.paymentsClient.emit('inventory_failed', {
        orderId,
        reason: 'Inssuficient stock',
      });
      return;
    }
    item.stock -= quantity;
    await this.inventoryRepository.save(item);

    this.logger.log(`Stock reservado con éxito para la orden ${orderId}`);

    this.paymentsClient.emit('inventory_reserved', {
      ...orderData,
      status: 'STOCK_RESERVED',
    });
  }

  create(createInventoryDto: CreateInventoryDto) {
    return 'This action adds a new inventory';
  }

  findAll() {
    return `This action returns all inventory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} inventory`;
  }

  update(id: number, updateInventoryDto: UpdateInventoryDto) {
    return `This action updates a #${id} inventory`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventory`;
  }
}
