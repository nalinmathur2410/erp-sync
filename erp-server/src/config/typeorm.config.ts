import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.getOrThrow<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.getOrThrow<string>('DB_USER'),
  password: configService.getOrThrow<string>('DB_PASS'),
  database: configService.getOrThrow<string>('DB_NAME'),
  autoLoadEntities: true,
  synchronize: configService.get('DB_SYNC') === 'true',
  logging: configService.get('DB_LOGGING') === 'true',
});
