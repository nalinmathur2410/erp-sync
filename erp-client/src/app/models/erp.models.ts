export interface Product {
  id: string;
  name: string;
  price: number;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  productId: string;
  quantity: number;
  date: string;
  updatedAt: string;
}

export interface PendingProduct extends Product {
  localId?: number;
  syncStatus: 'PENDING';
}

export interface PendingTransaction extends Transaction {
  localId?: number;
  syncStatus: 'PENDING';
}

export interface SyncResponse<T> {
  synced: T[];
}
