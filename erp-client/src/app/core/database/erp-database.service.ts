import { Injectable } from '@angular/core';
import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { PendingProduct, PendingTransaction, Product, Transaction } from '../../models/erp.models';

interface ErpDatabaseSchema extends DBSchema {
  products: {
    key: string;
    value: Product;
    indexes: { updatedAt: string };
  };
  pending_products: {
    key: number;
    value: PendingProduct;
    indexes: { syncStatus: string };
  };
  transactions: {
    key: string;
    value: Transaction;
    indexes: { updatedAt: string };
  };
  pending_transactions: {
    key: number;
    value: PendingTransaction;
    indexes: { syncStatus: string };
  };
  meta: {
    key: string;
    value: { k: string; v: unknown };
  };
}

@Injectable({ providedIn: 'root' })
export class ErpDatabaseService {
  private readonly dbPromise: Promise<IDBPDatabase<ErpDatabaseSchema>>;

  constructor() {
    this.dbPromise = openDB<ErpDatabaseSchema>('erp-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('products')) {
          const store = db.createObjectStore('products', { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt');
        }

        if (!db.objectStoreNames.contains('pending_products')) {
          const store = db.createObjectStore('pending_products', {
            keyPath: 'localId',
            autoIncrement: true,
          });
          store.createIndex('syncStatus', 'syncStatus');
        }

        if (!db.objectStoreNames.contains('transactions')) {
          const store = db.createObjectStore('transactions', { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt');
        }

        if (!db.objectStoreNames.contains('pending_transactions')) {
          const store = db.createObjectStore('pending_transactions', {
            keyPath: 'localId',
            autoIncrement: true,
          });
          store.createIndex('syncStatus', 'syncStatus');
        }

        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'k' });
        }
      },
    });
  }

  async getProducts(): Promise<Product[]> {
    const db = await this.dbPromise;
    return db.getAllFromIndex('products', 'updatedAt').then((items) =>
      items.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    );
  }

  async putProducts(products: Product[]): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('products', 'readwrite');
    for (const product of products) await tx.store.put(product);
    await tx.done;
  }

  async putProduct(product: Product): Promise<void> {
    const db = await this.dbPromise;
    await db.put('products', product);
  }

  async addPendingProduct(product: PendingProduct): Promise<void> {
    const db = await this.dbPromise;
    await db.add('pending_products', product);
  }

  async getPendingProducts(): Promise<PendingProduct[]> {
    const db = await this.dbPromise;
    return db.getAll('pending_products');
  }

  async deletePendingProduct(localId: number): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('pending_products', localId);
  }

  async getTransactions(): Promise<Transaction[]> {
    const db = await this.dbPromise;
    return db.getAllFromIndex('transactions', 'updatedAt').then((items) =>
      items.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    );
  }

  async putTransactions(transactions: Transaction[]): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('transactions', 'readwrite');
    for (const transaction of transactions) await tx.store.put(transaction);
    await tx.done;
  }

  async putTransaction(transaction: Transaction): Promise<void> {
    const db = await this.dbPromise;
    await db.put('transactions', transaction);
  }

  async addPendingTransaction(transaction: PendingTransaction): Promise<void> {
    const db = await this.dbPromise;
    await db.add('pending_transactions', transaction);
  }

  async getPendingTransactions(): Promise<PendingTransaction[]> {
    const db = await this.dbPromise;
    return db.getAll('pending_transactions');
  }

  async deletePendingTransaction(localId: number): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('pending_transactions', localId);
  }
}
