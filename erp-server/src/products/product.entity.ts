import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column('decimal')
  price: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
