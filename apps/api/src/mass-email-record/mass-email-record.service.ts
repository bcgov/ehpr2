import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromisePoolError } from '@supercharge/promise-pool';
import { AppLogger } from '../common/logger.service';
import { MassEmailRecordEntity } from './entity/mass-email-record.entity';
import { GenericError } from 'src/common/generic-exception';

@Injectable()
export class MassEmailRecordService {
  constructor(
    @InjectRepository(MassEmailRecordEntity)
    private readonly massEmailRecordRepository: Repository<MassEmailRecordEntity>,
    @Inject(Logger)
    private readonly logger: AppLogger,
  ) {}

  async createMassEmailRecord(record: Partial<MassEmailRecordEntity>) {
    const recordEntity = this.massEmailRecordRepository.create(record);
    const result = await this.massEmailRecordRepository.save(recordEntity);
    this.logger.log(`mass email record created: ${result.id}`);
  }

  /**
   * maps data to a record entry for saving
   *
   * @param userId: requesting users id
   * @param emailIds: list of registrant ids for corresponding emails
   * @param errors: error object returned from PromisePool library
   * @returns the created record
   */
  mapRecordObject(
    userId: string,
    subject: string,
    emailIds: string[],
    errors: PromisePoolError<{ status: string; name: string; message: string; userId: string }>[],
    messageIds: Record<string, string>,
  ): Partial<MassEmailRecordEntity> {
    let mappedErrors: GenericError[] = [];
    // general exceptions and AWS errors have different formats
    // check for general exceptions then look for AWS errors
    if (errors) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mappedErrors = errors.map(({ error, recipientId }: any) => {
        const httpStatus = error?.status ?? undefined;
        const errorType = error?.response?.error ?? error?.code;
        const errorMessage = error?.response?.message ?? error?.message;
        return {
          httpStatus,
          errorType,
          errorMessage,
          recipientId,
        };
      });
    }

    const record: Partial<MassEmailRecordEntity> = {
      userId,
      subject,
      recipients: emailIds,
      errors: mappedErrors,
      messageIds,
    };

    return record;
  }
}
