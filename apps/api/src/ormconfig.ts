import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { DatabaseNamingStrategy } from './database/database.naming-strategy';
import { join } from 'path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

dotenv.config();
// Check typeORM documentation for more information.

export const config: PostgresConnectionOptions = {
  host: process.env.POSTGRES_HOST,
  type: 'postgres',
  port: +(process.env.POSTGRES_PORT || 5432),
  connectTimeoutMS: 5000,
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities: [join(__dirname, '**/*.entity.{ts,js}')],
  migrations: [join(__dirname, './migration/*.{ts,js}')],
  synchronize: false,
  migrationsRun: true,
  namingStrategy: new DatabaseNamingStrategy(),
  logging: true,
};

export default new DataSource(config);
