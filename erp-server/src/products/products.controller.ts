import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { SyncResponse } from '../common/dto/sync.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  getAll(): Promise<Product[]> {
    return this.service.findAll();
  }

  @Post()
  add(@Body() product: Product): Promise<Product> {
    return this.service.upsert(product);
  }

  @Post('sync')
  async sync(@Body() body: Product[]): Promise<SyncResponse<Product>> {
    return { synced: await this.service.sync(body) };
  }
}
