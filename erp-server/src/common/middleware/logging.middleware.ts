import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = randomUUID();
    const start = Date.now();

    res.setHeader('X-Request-ID', requestId);

    res.on('finish', () => {
      const duration = Date.now() - start;

      this.logger.log(
        `[${requestId}] ${req.method} ${req.originalUrl} ` +
        `${res.statusCode} ${duration}ms`,
      );
    });

    next();
  }
}