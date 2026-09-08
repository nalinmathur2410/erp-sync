import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { normalizeDate } from '../utils/date.util';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly repo: Repository<Transaction>,
  ) {}

  findAll(): Promise<Transaction[]> {
    return this.repo.find({ order: { updatedAt: 'DESC' } });
  }

  upsert(transaction: Transaction): Promise<Transaction> {
    return this.repo.save(this.normalize(transaction));
  }

  async sync(localChanges: Transaction[]): Promise<Transaction[]> {
    for (const transaction of localChanges) {
      await this.repo.save(this.normalize(transaction));
    }

    return this.repo.find({ order: { updatedAt: 'DESC' } });
  }

  private normalize(transaction: Transaction): Transaction {
    return {
      ...transaction,
      date: normalizeDate(transaction.date),
    };
  }
}
