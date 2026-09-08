# Offline synchronization

## Client data stores

| Store | Purpose |
| --- | --- |
| `products` | Local product data used by the application |
| `pending_products` | Product writes waiting for synchronization |
| `transactions` | Local transaction data |
| `pending_transactions` | Transaction writes waiting for synchronization |
| `meta` | Future sync metadata |

The application uses a single IndexedDB database: `erp-db`.

## Flow

```text
User action
    |
    v
Angular service
    |
    +---- online ----> REST API ----> PostgreSQL
    |
    +---- offline ---> IndexedDB + pending queue
                              |
                       browser online event
                              |
                              v
                         SyncService
                              |
                         REST API
                              |
                         PostgreSQL
```

## Design rules

- Client-generated UUIDs allow an operation to be identified before the server is available.
- Pending operations remain in IndexedDB if synchronization fails.
- API responses are persisted back into the local stores.
- Business data and synchronization state are separated into normal and pending stores.
- The service worker is responsible for application/resource caching; IndexedDB is responsible for ERP business data and pending writes.

## Next hardening step

The current implementation establishes the clean baseline. Before production, add explicit idempotency keys, conflict-resolution rules, retry/backoff, sync checkpoints, authentication, request validation, and database migrations.
