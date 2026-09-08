import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ErpDatabaseService } from '../core/database/erp-database.service';
import { PendingTransaction, SyncResponse, Transaction } from '../models/erp.models';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly url = `${environment.apiUrl}/transactions`;

  constructor(
    private readonly http: HttpClient,
    private readonly db: ErpDatabaseService,
  ) { }

  async getTransactions(): Promise<Transaction[]> {
    const localTransactions = await this.db.getTransactions();
    if (localTransactions.length || !navigator.onLine) return localTransactions;

    try {
      const transactions = await firstValueFrom(this.http.get<Transaction[]>(this.url));
      await this.db.putTransactions(transactions);
      return transactions;
    } catch (error) {
      console.error('Failed to fetch transactions', error);
      return localTransactions;
    }
  }

  async addTransaction(input: Omit<Transaction, 'id' | 'updatedAt'>): Promise<void> {
    const transaction: Transaction = {
      ...input,
      id: crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
    };

    if (!navigator.onLine) {
      await this.queue(transaction);
      return;
    }

    try {
      const saved = await firstValueFrom(
        this.http.post<Transaction>(this.url, transaction),
      );
      await this.db.putTransaction(saved);
    } catch (error) {
      console.warn('Transaction API unavailable; queued locally', error);
      await this.queue(transaction);
    }
  }

  async syncPending(): Promise<void> {
    if (!navigator.onLine) return;

    const pending = await this.db.getPendingTransactions();
    if (!pending.length) return;

    try {
      const response = await firstValueFrom(
        this.http.post<SyncResponse<Transaction>>(`${this.url}/sync`, pending),
      );

      await this.db.putTransactions(response.synced);
      for (const item of pending) {
        if (item.localId !== undefined) await this.db.deletePendingTransaction(item.localId);
      }
    } catch (error) {
      console.error('Transaction sync failed; items remain queued', error);
    }
  }

  private async queue(transaction: Transaction): Promise<void> {
    const pending: PendingTransaction = { ...transaction, syncStatus: 'PENDING' };
    await this.db.addPendingTransaction(pending);
    await this.db.putTransaction(transaction);
  }
}
