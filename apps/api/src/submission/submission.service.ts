import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Brackets, Repository, DataSource, In, SelectQueryBuilder } from 'typeorm';
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
  ExtractApplicantsFilterDTO,
  SpecialtyDTO,
  PreferencesInformationDTO,
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

    if (!submissions) {
      return { submissions: [], missingIds: [] };
    }
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

    // This prevents submission e2e test from failing due to aws credentials
    if (process.env.NODE_ENV !== 'test') {
      await this.mailService.sendMailable(mailable);
    }

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
  async getSubmissions(
    haId?: number,
    userEmail?: string,
    filter?: ExtractApplicantsFilterDTO,
  ): Promise<SubmissionEntity[]> {
    const queryBuilder = await this.getHaFilterQuery(haId, userEmail, false, false, filter);

    if (filter?.currentEmployment) {
      queryBuilder.andWhere(
        `submission.payload->'credentialInformation'->>'currentEmployment' = ANY(ARRAY[:...currentEmployment])`,
        {
          currentEmployment: filter.currentEmployment,
        },
      );
    }
    if (filter?.registeredOnly) {
      queryBuilder.andWhere(
        "submission.payload->'credentialInformation'->>'registrationStatus' = 'registered'",
      );
    }
    const result: SubmissionEntity[] = await queryBuilder.getMany();
    if (filter?.specialties) {
      let filteredResult: SubmissionEntity[] = [];
      // Find submissions that have specialties that match the filter
      filteredResult = result.filter(submission => {
        return this.findMatchingSpecialty(submission, filter);
      });
      return filteredResult;
    }
    return result;
  }
  // Returns true if a matching specialty is found.
  findMatchingSpecialty(submission: SubmissionEntity, filter: ExtractApplicantsFilterDTO): boolean {
    let matchFound = false;
    filter.specialties?.map((specialty: string) => {
      submission?.payload?.credentialInformation?.specialties.forEach(
        (submission_specialty: SpecialtyDTO) => {
          if (matchFound) {
            return;
          }
          // If a specialty match is found, see if a subspecialty check is also required.
          if (specialty === submission_specialty.id) {
            // A match is found if either there are no subspecialties in the filter
            // or
            // if there are subspecialties in the filter, and a matching subspecialty is found.
            if (
              !filter.subspecialties ||
              (filter?.subspecialties &&
                this.findMatchingSubSpecialty(submission_specialty, filter))
            ) {
              matchFound = true;
            }
          }
        },
      );
    });
    return matchFound;
  }
  // Returns true if a matching suspecialty is found within the specialty
  findMatchingSubSpecialty(specialty: SpecialtyDTO, filter: ExtractApplicantsFilterDTO): boolean {
    return !!filter.subspecialties?.find((subspecialty: string) => {
      return specialty.subspecialties?.find(submission_subspecialty => {
        return subspecialty === submission_subspecialty.id;
      });
    });
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
    // Need to cast update preferences information DTO as partial in order to skip fields not in form
    const preferences: Partial<PreferencesInformationDTO> = {
      ...payload.preferencesInformation,
    };
    const update: Partial<SubmissionEntity> = {
      payload: {
        ...record.payload,
        ...payload,
        preferencesInformation: { ...record.payload.preferencesInformation, ...preferences },
      },
      withdrawn: !payload.status.interested,
    };

    await this.submissionRepository.update(record.id, update);
    if (process.env.ENABLE_UPDATE_CONFIRMATION === 'true') {
      const updateConformationMailable = new UpdateConfirmationMailable(
        { email: payload?.contactInformation?.email } as Recipient,
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
  async getHaFilterQuery(
    haId?: number,
    userEmail?: string,
    isTable?: boolean,
    anyRegion = false,
    filter?: ExtractApplicantsFilterDTO,
  ) {
    const queryBuilder = this.dataSource
      .getRepository(SubmissionEntity)
      .createQueryBuilder('submission');

    await this.filterLocations(queryBuilder, haId, userEmail, isTable, anyRegion, filter);
    if (filter) {
      await this.filterStream(queryBuilder, filter);
    }

    // retrieve only registrants whom are not withdrawn
    queryBuilder.andWhere("submission.withdrawn = 'false'");
    return queryBuilder;
  }

  async filterLocations(
    queryBuilder: SelectQueryBuilder<SubmissionEntity>,
    haId?: number,
    userEmail?: string,
    isTable?: boolean,
    anyRegion = false,
    filter?: ExtractApplicantsFilterDTO,
  ) {
    if (filter?.anywhereOnly) {
      queryBuilder.andWhere(
        `"submission"."payload"::json -> 'preferencesInformation' ->> 'deployAnywhere' = 'true'`,
      );
      return;
    }

    let haLocations = filter?.locations;

    if (isMoh(userEmail)) {
      if (filter?.authorities) {
        const HealthAuthorities: HealthAuthoritiesEntity[] =
          await this.healthAuthoritiesRepository.find({
            where: { name: In(filter.authorities) },
          });
        // get a list of all the locations for selected Health Authorities
        haLocations = HealthAuthorities.map((healthAuthority: HealthAuthoritiesEntity) => {
          return CondensedRegionLocations[
            healthAuthority.name as keyof typeof CondensedRegionLocations
          ].filter(loc => !haLocations?.length || haLocations.includes(loc));
        }).flat();
      }
    } else {
      const healthAuthority = await this.healthAuthoritiesRepository.findOne({
        where: { id: haId },
      });
      // Get all locations for the Health Authority user
      haLocations = CondensedRegionLocations[
        healthAuthority?.name as keyof typeof CondensedRegionLocations
      ].filter(loc => !haLocations?.length || haLocations.includes(loc));
    }

    // Select only users who can be deployed anywhere or HA Users without an HA.
    if (haLocations) {
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
                  WHERE dep::text = ANY(ARRAY[:...haLocations])
              )`,
            { haLocations },
          );
          // check if querying for registrants table then check if any region filter was selected
          if (!isTable || (isTable && anyRegion)) {
            qb.orWhere("submission.payload->'preferencesInformation'->>'deployAnywhere' = 'true'");
          }
        }),
      );
    }
  }

  async filterStream(
    queryBuilder: SelectQueryBuilder<SubmissionEntity>,
    filter: ExtractApplicantsFilterDTO,
  ) {
    if (filter?.stream) {
      queryBuilder.andWhere(
        `(submission.payload -> 'credentialInformation' ->> 'stream')::text = ANY(ARRAY[:...stream])`,
        { stream: filter.stream },
      );
    }
  }

  async truncateTable() {
    await this.submissionRepository.query(`TRUNCATE TABLE "submission" RESTART IDENTITY CASCADE;`);
  }
}
