import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Brackets, Repository, DataSource, In } from 'typeorm';
import { SubmissionEntity } from './entity/submission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  SubmissionDTO,
  PersonalInformationDTO,
  UpdateSubmissionDTO,
  SubmissionRO,
  RegistrantFilterDTO,
  CondensedRegionLocations,
  isMoh,
} from '@ehpr/common';
import { MailService } from 'src/mail/mail.service';
import { ConfirmationMailable } from 'src/mail/mailables/confirmation.mailable';
import { Recipient } from 'src/mail/types/recipient';
import { generateConfirmationId } from './id-generator';
import { AppLogger } from 'src/common/logger.service';
import { UpdateConfirmationMailable } from 'src/mail/mailables/update-confirmation.mailable';
import { HealthAuthoritiesEntity } from 'src/user/entity/ha.entity';
import {
  GetSubmissionsPersonalInfoResponse,
  SubmissionPersonalInfo,
} from './types/submissions-personal';

@Injectable()
export class SubmissionService {
  constructor(
    private dataSource: DataSource,
    @Inject(Logger) private readonly logger: AppLogger,
    @InjectRepository(SubmissionEntity)
    private readonly submissionRepository: Repository<SubmissionEntity>,
    @InjectRepository(HealthAuthoritiesEntity)
    private readonly healthAuthoritiesRepository: Repository<HealthAuthoritiesEntity>,
    @Inject(MailService)
    private readonly mailService: MailService,
  ) {}
  async saveSubmission(dto: SubmissionDTO): Promise<SubmissionEntity> {
    const confirmationId = generateConfirmationId();
    const newSubmission = this.submissionRepository.create({
      ...dto,
      confirmationId,
    } as Partial<SubmissionEntity>);
    const savedSubmission = await this.submissionRepository.save(newSubmission);
    this.logger.log(`Saved submission: ${savedSubmission.id}`, SubmissionService.name);

    return this.sendSubmissionConfirmation(savedSubmission);
  }

  async findSubmissionById(id: string) {
    return this.submissionRepository.findOneBy({ id });
  }

  async getSubmissionsPersonalInfo(ids: string[]): Promise<GetSubmissionsPersonalInfoResponse> {
    const submissionRepo = this.dataSource.getRepository(SubmissionEntity);

    const submissions: SubmissionPersonalInfo[] = await submissionRepo
      .createQueryBuilder('submission')
      .select([
        'submission.id AS "id"',
        'submission.confirmationId AS "confirmationId"',
        "submission.payload -> 'personalInformation' ->> 'firstName' AS \"firstName\"",
        "submission.payload -> 'personalInformation' ->> 'lastName' AS \"lastName\"",
      ])
      .where({ id: In(ids) })
      .getRawMany();

    const foundIds = submissions.map(entity => entity.id);
    // For troubleshooting purposes, this should always be empty
    const missingIds = ids.filter(id => !foundIds.includes(id));

    if (!submissions?.length) {
      throw new NotFoundException('No submission records were found for ids');
    }

    return { submissions, missingIds };
  }

  private async sendSubmissionConfirmation(submission: SubmissionEntity) {
    const { payload } = submission;
    const { email } = payload.contactInformation;

    const mailable = new ConfirmationMailable({ email } as Recipient, {
      firstName: (payload.personalInformation as PersonalInformationDTO).firstName,
      confirmationId: this.convertIdToDashedId(submission.confirmationId),
    });

    this.logger.log(
      `Sending confirmation email for submission: ${submission.id}`,
      SubmissionService.name,
    );
    const mailResponse = await this.mailService.sendMailable(mailable);
    submission.chesId = mailResponse?.txId;
    submission = await this.submissionRepository.save(submission);
    this.logger.log(
      `Confirmation email sent for submission: ${submission.id}`,
      SubmissionService.name,
    );

    return submission;
  }

  private convertIdToDashedId(id: string): string {
    return (
      id.substring(0, 3) +
      '-' +
      id.substring(3, 6) +
      '-' +
      id.substring(6, 9) +
      '-' +
      id.substring(9)
    );
  }

  // query for submissions extract
  async getSubmissions(haId?: number, userEmail?: string) {
    const queryBuilder = await this.getHaFilterQuery(haId, userEmail);
    return queryBuilder.getMany();
  }

  // query for registrants table
  async getSubmissionsFilterQuery(filter: RegistrantFilterDTO, haId?: number, userEmail?: string) {
    const { firstName, lastName, email, skip, limit, anyRegion } = filter;

    const queryBuilder = await this.getHaFilterQuery(haId, userEmail, true, anyRegion);

    // Registrants table should default to exclude withdrawn
    queryBuilder.andWhere('submission.withdrawn = :withdrawn', { withdrawn: false });

    if (firstName) {
      queryBuilder.andWhere(
        "submission.payload->'personalInformation'->>'firstName' ILIKE :firstName",
        {
          firstName: `%${firstName}%`,
        },
      );
    }

    if (lastName) {
      queryBuilder.andWhere(
        "submission.payload->'personalInformation'->>'lastName' ILIKE :lastName",
        {
          lastName: `%${lastName}%`,
        },
      );
    }

    if (email) {
      queryBuilder.andWhere("submission.payload->'contactInformation'->>'email' ILIKE :email", {
        email: `%${email}%`,
      });
    }

    return queryBuilder.skip(skip).take(limit).getManyAndCount();
  }

  async updateSubmission(
    confirmationId: string,
    payload: UpdateSubmissionDTO,
  ): Promise<SubmissionRO> {
    confirmationId = confirmationId.replace(/-/gm, '').toUpperCase();
    const record = await this.submissionRepository.findOneBy({ confirmationId });
    if (!record) {
      throw new NotFoundException(`No submission record for ${confirmationId}`);
    }

    const update: Partial<SubmissionEntity> = {
      payload: { ...record.payload, ...payload },
      withdrawn: !payload.status.interested,
    };

    await this.submissionRepository.update(record.id, update);
    if (process.env.ENABLE_UPDATE_CONFIRMATION === 'true') {
      const updateConformationMailable = new UpdateConfirmationMailable(
        { email: payload.contactInformation.email } as Recipient,
        {
          firstName: (payload.personalInformation as PersonalInformationDTO).firstName,
          confirmationId: this.convertIdToDashedId(confirmationId),
        },
      );
      await this.mailService.sendMailable(updateConformationMailable);
    }

    return { id: record.id, confirmationId };
  }

  // creates HA filter query for registrants table and submission extract
  async getHaFilterQuery(haId?: number, userEmail?: string, isTable?: boolean, anyRegion = false) {
    const queryBuilder = this.dataSource
      .getRepository(SubmissionEntity)
      .createQueryBuilder('submission');

    const ha = await this.healthAuthoritiesRepository.findOne({ where: { id: haId } });
    // exclude any filtering for MoH users
    if (!isMoh(userEmail)) {
      // submission values are saved using the condensed HA name
      const haLocations = CondensedRegionLocations[
        ha?.name as keyof typeof CondensedRegionLocations
      ]
        .map(name => `'${name}'`)
        .join(', ');

      // created nested where clauses for filtering by HA locations and registrants who will deploy anywhere
      queryBuilder.andWhere(
        // check if a row exists that matches filter
        // extract jsonb fields into usable data
        // check if extracted text matches any location values within users HA
        new Brackets(qb => {
          qb.where(
            `EXISTS (
                SELECT 1
                FROM jsonb_array_elements_text("submission"."payload"->'preferencesInformation'->'deploymentLocations') AS dep
                WHERE dep::text = ANY(ARRAY[${haLocations}])
            )`,
          );

          // check if querying for registrants table then check if any region filter was selected
          if (isTable) {
            if (anyRegion) {
              qb.orWhere(
                "submission.payload->'preferencesInformation'->>'deployAnywhere' = 'true'",
              );
            }
          } else {
            // for submission extract we send ANY regions back by default
            qb.orWhere("submission.payload->'preferencesInformation'->>'deployAnywhere' = 'true'");
          }
        }),
      );
      // retrieve only registrants whom are not withdrawn
      queryBuilder.andWhere("submission.withdrawn = 'false'");
    }

    return queryBuilder;
  }
}
