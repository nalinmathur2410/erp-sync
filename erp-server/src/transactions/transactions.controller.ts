import { Body, Controller, Get, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction } from './transaction.entity';
import { SyncResponse } from '../common/dto/sync.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Get()
  getAll(): Promise<Transaction[]> {
    return this.service.findAll();
  }

  @Post()
  add(@Body() transaction: Transaction): Promise<Transaction> {
    return this.service.upsert(transaction);
  }

  @Post('sync')
  async sync(@Body() body: Transaction[]): Promise<SyncResponse<Transaction>> {
    return { synced: await this.service.sync(body) };
  }
}
