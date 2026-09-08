# ERP Offline Sync

Offline-first ERP application built with Angular PWA, IndexedDB, NestJS, TypeORM, and PostgreSQL.

The application is designed to remain usable when the network is unavailable. Business data is stored locally, write operations are queued when the API cannot be reached, and queued changes are synchronized when connectivity is restored.

## Architecture

```text
Angular PWA
    |
    +-- ProductService / TransactionService
    |       |
    |       +-- Online -> NestJS API
    |       |
    |       +-- Offline/API failure -> IndexedDB pending queue
    |
    +-- SyncService -> retries pending operations when online
    |
    +-- Service Worker -> application/resource caching
    |
    v
NestJS API
    |
    v
TypeORM
    |
    v
PostgreSQL
```

## Project structure

```text
erp-sync/
├── erp-client/              # Angular PWA
│   └── src/app/
│       ├── components/      # Product and transaction forms
│       ├── core/database/   # IndexedDB database service
│       ├── models/          # Shared frontend data models
│       └── services/        # API, local storage, and synchronization logic
├── erp-server/              # NestJS API
│   └── src/
│       ├── common/          # Shared DTOs
│       ├── config/          # Application configuration
│       ├── products/        # Product module
│       ├── transactions/    # Transaction module
│       └── utils/            # Shared utilities
└── docs/                    # Architecture documentation
```

## Offline synchronization

The frontend uses a single IndexedDB database named `erp-db` with these stores:

- `products` — locally available products
- `pending_products` — product writes waiting for synchronization
- `transactions` — locally available transactions
- `pending_transactions` — transaction writes waiting for synchronization
- `meta` — synchronization metadata

The synchronization flow is:

1. A user creates a product or transaction.
2. If the API is available, the request is sent to NestJS.
3. If the browser is offline or the request fails, the record is stored locally and added to the corresponding pending queue.
4. `SyncService` listens for connectivity changes and starts synchronization when the browser comes online.
5. Products are synchronized before transactions.
6. Successfully synchronized records are removed from the pending queue.

Records use UUIDs and ISO timestamps so the same identifier can be used across the client and server.

## Backend

### Requirements

- Node.js 22 or a compatible current LTS release
- PostgreSQL
- npm

### Configuration

Create the environment file:

```bash
cd erp-server
cp .env.example .env
```

Configure the PostgreSQL connection and application settings in `.env`.

Never commit `.env` or database credentials.

### Install and run

```bash
cd erp-server
npm install
npm run start:dev
```

### Production build

The backend uses Webpack to bundle the application code. Node dependencies remain external so the deployment remains straightforward and compatible with the NestJS/TypeORM runtime.

```bash
npm run build
npm run start:prod
```

The production entry point is:

```text
dist/main.js
```

### Backend scripts

| Command | Purpose |
|---|---|
| `npm run start` | Build with Webpack and start NestJS |
| `npm run start:dev` | Run NestJS in watch mode |
| `npm run build` | Create the Webpack production bundle |
| `npm run start:prod` | Run the generated bundle |
| `npm run lint` | Run ESLint and apply fixes |
| `npm run format` | Format TypeScript files |
| `npm run test` | Run unit tests |
| `npm run test:cov` | Run tests with coverage |

## Frontend

### Install and run

```bash
cd erp-client
npm install
npm start
```

The development application is available at:

```text
http://localhost:4200
```

The frontend API URL is configured through the Angular environment files.

### Production build

```bash
npm run build
```

The application includes Angular PWA support and a custom service worker for runtime caching and offline request handling.

## API

The backend exposes product and transaction synchronization endpoints.

The synchronization response uses a consistent shape:

```json
{
  "synced": []
}
```

Transactions accept ISO date strings. The backend normalizes supported date input before persisting it to PostgreSQL.

## Database

TypeORM is configured for PostgreSQL. Entities currently include:

- `Product`
- `Transaction`

For development, database schema synchronization can be enabled through the TypeORM configuration. For production, use explicit migrations rather than relying on automatic schema synchronization.

## Service worker and IndexedDB

These mechanisms serve different purposes:

- Angular PWA/service worker: application shell and resource caching.
- IndexedDB: business data and pending write queues.
- `SyncService`: application-level synchronization with the API.

The IndexedDB layer is intentionally kept separate from the service worker so business synchronization can be controlled by the Angular application.

## Development workflow

Run the backend and frontend separately:

```bash
# Terminal 1
cd erp-server
npm run start:dev

# Terminal 2
cd erp-client
npm start
```

To test offline behavior in the browser:

1. Start both applications.
2. Create products or transactions while online.
3. Enable browser offline mode.
4. Create additional records.
5. Confirm that records remain available locally.
6. Disable offline mode.
7. Allow `SyncService` to synchronize the pending records.

## Git hygiene

The repository excludes generated and environment-specific files such as:

- `node_modules/`
- Angular cache files
- NestJS build output
- coverage output
- `.env`
- local IDE metadata where appropriate

Commit `.env.example`, not `.env`.

## Current technology stack

### Frontend

- Angular 22
- TypeScript
- Angular Service Worker / PWA
- IndexedDB via `idb`
- RxJS
- Workbox

### Backend

- NestJS 11
- TypeScript
- TypeORM 0.3
- PostgreSQL
- Webpack

## Next steps

Potential production improvements include:

- Idempotency keys for synchronization requests
- Conflict-resolution rules based on `updatedAt`
- Exponential retry with a maximum retry count
- Sync status and error reporting in the UI
- Database migrations
- Authentication and authorization
- API validation with DTOs
- Automated unit, integration, and end-to-end tests
- Containerized deployment
- AWS deployment configuration
