import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { DatabaseNamingStrategy } from './database/database.naming-strategy';

dotenv.config();
// Check typeORM documentation for more information.

export const config: PostgresConnectionOptions = {
  host: process.env.POSTGRES_HOST,
  type: 'postgres',
  port: +(process.env.PORTGRES_PORT || 5432),
  connectTimeoutMS: 5000,
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities: ['src/**/*.entity.js'],
  migrations: ['src/migration/*.js'],
  synchronize: false,
  migrationsRun: true,
  namingStrategy: new DatabaseNamingStrategy(),
  logging: true,
};

export default new DataSource(config);
