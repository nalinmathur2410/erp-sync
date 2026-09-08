import { Injectable } from '@angular/core';
import { fromEvent, merge, Subscription } from 'rxjs';
import { ProductService } from './product.service';
import { TransactionService } from './transaction.service';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private onlineState = navigator.onLine;
  private syncing = false;
  private readonly subscription: Subscription;

  constructor(
    private readonly productService: ProductService,
    private readonly transactionService: TransactionService,
  ) {
    this.subscription = merge(fromEvent(window, 'online'), fromEvent(window, 'offline')).subscribe(
      (event) => {
        this.onlineState = event.type === 'online';
        if (this.onlineState) void this.syncAllPending();
      },
    );

    if (this.onlineState) void this.syncAllPending();
  }

  get online(): boolean {
    return this.onlineState;
  }

  async syncNow(): Promise<void> {
    if (!this.onlineState) return;
    await this.syncAllPending();
  }

  private async syncAllPending(): Promise<void> {
    if (this.syncing || !this.onlineState) return;
    this.syncing = true;

    try {
      await this.productService.syncPending();
      await this.transactionService.syncPending();
    } finally {
      this.syncing = false;
    }
  }

  destroy(): void {
    this.subscription.unsubscribe();
  }
}
