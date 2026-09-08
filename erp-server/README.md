# ERP Server

NestJS backend for the ERP offline-sync application.

## Stack

- NestJS 11
- TypeScript
- TypeORM
- PostgreSQL
- Webpack

## Setup

```bash
npm install
cp .env.example .env
npm run start:dev
```

## Production

```bash
npm run build
npm run start:prod
```

Webpack generates `dist/main.js` while keeping Node dependencies external.

## Testing

```bash
npm run test
npm run test:cov
npm run test:e2e
```

Keep secrets and local configuration in `.env` and never commit that file.
