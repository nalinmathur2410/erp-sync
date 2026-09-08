import { Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { TransactionForm } from './components/transaction-form/transaction-form';
import { ProductForm } from './components/product-form/product-form';

export const routes: Routes = [
    { path: '', redirectTo: '/products', pathMatch: 'full' },
    { path: 'products', component: ProductForm },
    { path: 'transactions', component: TransactionForm },
    { path: '**', redirectTo: '/products' },
];;

export const APP_CONFIG = {
    apiBase: environment.apiUrl
} as const;