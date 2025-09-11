import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { LoggerOptions } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import { config } from '../ormconfig';
import { SubmissionEntity } from '../submission/entity/submission.entity';
import { UserEntity } from '../user/entity/user.entity';
import { MassEmailRecordEntity } from '../mass-email-record/entity/mass-email-record.entity';
import { HealthAuthoritiesEntity } from '../user/entity/ha.entity';

const getEnvironmentSpecificConfig = (env?: string) => {
  switch (env) {
    case 'production':
      return {
        entities: [join(__dirname, '../**/*.entity.js')],
        migrations: [join(__dirname, '../migration/*.js')],
        logging: ['migration'] as LoggerOptions,
      };
    case 'test':
      return {
        port: parseInt(process.env.TEST_POSTGRES_PORT || '5432'),
        host: process.env.TEST_POSTGRES_HOST,
        username: process.env.TEST_POSTGRES_USERNAME,
        password: process.env.TEST_POSTGRES_PASSWORD,
        database: process.env.TEST_POSTGRES_DATABASE,
        entities: [SubmissionEntity, UserEntity, MassEmailRecordEntity, HealthAuthoritiesEntity],
        migrations: [join(__dirname, '../migration/*.{ts,js}')],
        logging: ['error', 'warn', 'migration'] as LoggerOptions,
      };
    case 'script':
      // when running function for lambda locally using ts-node
      return {
        entities: ['src/**/*.entity.ts'],
        migrations: ['src/migration/*.ts'],
        logging: ['error', 'warn', 'migration'] as LoggerOptions,
      };
    default:
      return {
        entities: [join(__dirname, '../**/*.entity.js')],
        migrations: [join(__dirname, '../migration/*.js')],
        logging: ['error', 'warn', 'migration'] as LoggerOptions,
      };
  }
};

const nodeEnv = process.env.NODE_ENV;
const environmentSpecificConfig = getEnvironmentSpecificConfig(nodeEnv);

const appOrmConfig: PostgresConnectionOptions = {
  ...config,
  ...environmentSpecificConfig,
  migrationsRun: true,
  synchronize: false,
};
@Module({
  imports: [TypeOrmModule.forRoot(appOrmConfig)],
  providers: [Logger],
})
export class DatabaseModule {}
