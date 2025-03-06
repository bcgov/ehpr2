import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromisePoolError } from '@supercharge/promise-pool';
import { AppLogger } from '../common/logger.service';
import { MassEmailRecordEntity } from './entity/mass-email-record.entity';
import { GenericError, PaginationDTO, Recipient } from '@ehpr/common';
import { UserEntity } from 'src/user/entity/user.entity';
import dayjs from 'dayjs';
import { createObjectCsvStringifier } from 'csv-writer';

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
    user: UserEntity,
    subject: string,
    emailIds: Recipient[],
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
      user,
      subject,
      recipients: emailIds,
      errors: mappedErrors,
      messageIds,
    };

    return record;
  }

  async getMassEmailHistory({ skip = 0, limit = 10 }: PaginationDTO) {
    const [data, total] = await this.massEmailRecordRepository.findAndCount({
      relations: ['user', 'user.ha'],
      skip,
      take: limit,
      order: {
        createdDate: 'DESC',
      },
    });

    return { data, total };
  }

  async downloadMassEmailHistory() {
    const records = await this.massEmailRecordRepository.find({
      relations: ['user', 'user.ha'],
      order: {
        createdDate: 'DESC',
      },
    });

    const history = records.map(r => ({
      id: r.id,
      date: dayjs(r.createdDate).format('YYYY-MM-DD HH:mm:ss'),
      authority: r.user.ha?.name,
      sender: r.user.email,
      subject: r.subject,
      recipients: JSON.stringify(r.recipients),
      errors: JSON.stringify(r.errors),
    }));

    const header = [
      { id: 'id', title: 'ID' },
      { id: 'date', title: 'Send Date' },
      { id: 'authority', title: 'Authority' },
      { id: 'sender', title: 'Sender' },
      { id: 'subject', title: 'Subject' },
      { id: 'recipients', title: 'Recipients' },
      { id: 'errors', title: 'Errors' },
    ];

    const stringifier = createObjectCsvStringifier({ header });

    return stringifier.getHeaderString() + stringifier.stringifyRecords(history);
  }
}
