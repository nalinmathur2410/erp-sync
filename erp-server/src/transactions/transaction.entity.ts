import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryColumn()
  id: string;

  @Column()
  productId: string;

  @Column('int')
  quantity: number;

  @Column({ type: 'timestamptz' })
  date: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
