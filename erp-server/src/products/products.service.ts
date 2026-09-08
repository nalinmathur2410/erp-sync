import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  findAll(): Promise<Product[]> {
    return this.repo.find({ order: { updatedAt: 'DESC' } });
  }

  upsert(product: Product): Promise<Product> {
    return this.repo.save(product);
  }

  async sync(localChanges: Product[]): Promise<Product[]> {
    for (const product of localChanges) {
      await this.repo.save(product);
    }

    return this.repo.find({ order: { updatedAt: 'DESC' } });
  }
}
