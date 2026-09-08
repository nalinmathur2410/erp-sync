import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ErpDatabaseService } from '../core/database/erp-database.service';
import { PendingProduct, Product, SyncResponse } from '../models/erp.models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly url = `${environment.apiUrl}/products`;

  constructor(
    private readonly http: HttpClient,
    private readonly db: ErpDatabaseService,
  ) {}

  async getProducts(): Promise<Product[]> {
    const localProducts = await this.db.getProducts();
    if (localProducts.length || !navigator.onLine) return localProducts;

    try {
      const products = await firstValueFrom(this.http.get<Product[]>(this.url));
      await this.db.putProducts(products);
      return products;
    } catch (error) {
      console.error('Failed to fetch products', error);
      return localProducts;
    }
  }

  async addProduct(input: Omit<Product, 'id' | 'updatedAt'>): Promise<void> {
    const product: Product = {
      ...input,
      id: crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
    };

    if (!navigator.onLine) {
      await this.queue(product);
      return;
    }

    try {
      const saved = await firstValueFrom(this.http.post<Product>(this.url, product));
      await this.db.putProduct(saved);
    } catch (error) {
      console.warn('Product API unavailable; queued locally', error);
      await this.queue(product);
    }
  }

  async syncPending(): Promise<void> {
    if (!navigator.onLine) return;

    const pending = await this.db.getPendingProducts();
    if (!pending.length) return;

    try {
      const response = await firstValueFrom(
        this.http.post<SyncResponse<Product>>(`${this.url}/sync`, pending),
      );

      await this.db.putProducts(response.synced);
      for (const item of pending) {
        if (item.localId !== undefined) await this.db.deletePendingProduct(item.localId);
      }
    } catch (error) {
      console.error('Product sync failed; items remain queued', error);
    }
  }

  private async queue(product: Product): Promise<void> {
    const pending: PendingProduct = { ...product, syncStatus: 'PENDING' };
    await this.db.addPendingProduct(pending);
    await this.db.putProduct(product);
  }
}
