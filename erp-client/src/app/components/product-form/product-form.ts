import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/erp.models';
import { ProductService } from '../../services/product.service';
import { SyncService } from '../../services/sync.service';

@Component({
  selector: 'app-product-form',
  imports: [FormsModule],
  templateUrl: './product-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './product-form.scss',
})
export class ProductForm implements OnInit {
  products: Product[] = [];
  newProduct = { name: '', price: 0 };
  loading = true;

  constructor(
    private readonly productService: ProductService,
    public readonly syncService: SyncService,
  ) {}

  ngOnInit(): void {
    void this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    this.products = await this.productService.getProducts();
    this.loading = false;
  }

  async addProduct(): Promise<void> {
    await this.productService.addProduct(this.newProduct);
    this.newProduct = { name: '', price: 0 };
    await this.loadProducts();
  }
}
