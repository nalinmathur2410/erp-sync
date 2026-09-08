import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SyncService } from '../../services/sync.service';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/erp.models';

@Component({
  selector: 'app-transaction-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './transaction-form.scss',
})
export class TransactionForm implements OnInit {
  transactions: Transaction[] = [];
  newTransaction = this.createTransactionDraft();

  constructor(
    private readonly transactionService: TransactionService,
    public readonly syncService: SyncService,
  ) {}

  ngOnInit(): void {
    void this.loadTransactions();
  }

  async loadTransactions(): Promise<void> {
    this.transactions = await this.transactionService.getTransactions();
  }

  async addTransaction(): Promise<void> {
    await this.transactionService.addTransaction(this.newTransaction);
    this.newTransaction = this.createTransactionDraft();
    await this.loadTransactions();
  }

  private createTransactionDraft(): Omit<Transaction, 'id' | 'updatedAt'> {
    return {
      productId: '',
      quantity: 0,
      date: new Date().toISOString(),
    };
  }
}
