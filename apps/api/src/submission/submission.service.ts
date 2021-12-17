import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SubmissionEntity } from './entity/submission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SubmissionDTO, PersonalInformationDTO } from '@ehpr/common';
import { booleanToYesNo } from 'src/common/helper/csv/casting';
import { SubmissionExportColumns } from 'src/common/helper/csv/submissionExport';
import { MailService } from 'src/mail/mail.service';
import { ConfirmationMailable } from 'src/mail/mailables/confirmation.mailable';
import { Recipient } from 'src/mail/types/recipient';
import { GenericException } from 'src/common/generic-exception';
import { MailError } from 'src/mail/mail.error';

@Injectable()
export class SubmissionService {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    @InjectRepository(SubmissionEntity)
    private readonly submissionRepository: Repository<SubmissionEntity>,
    @Inject(MailService)
    private readonly mailService: MailService,
  ) {}
  async saveSubmission(dto: SubmissionDTO, confirmationId: string): Promise<SubmissionEntity> {
    const newSubmission = this.submissionRepository.create({
      ...dto,
      confirmationId,
    } as Partial<SubmissionEntity>);

    const savedSubmission = await this.submissionRepository.save(newSubmission);
    this.logger.log(
      `Saved submission with id ${savedSubmission.id} and sending email confirmation`,
    );

    return this.sendMail(savedSubmission);
  }

  private async sendMail(submission: SubmissionEntity) {
    const { payload } = submission;

    const { email } = payload.contactInformation;
    const mailable = new ConfirmationMailable({ email } as Recipient, {
      firstName: (payload.personalInformation as PersonalInformationDTO).firstName,
      confirmationId: submission.confirmationId,
    });

    try {
      const { txId } = await this.mailService.sendMailable(mailable);
      submission.chesId = txId;
      submission = await this.submissionRepository.save(submission);
      this.logger.log(`Confirmation email sent for submission: ${submission.id}`);
    } catch (e) {
      this.logger.warn(e);
    }

    return submission;
  }

  async getSubmissions(): Promise<SubmissionEntity[]> {
    return await this.submissionRepository.find();
  }
  async getSubmissionById(id: string): Promise<SubmissionEntity> {
    return await this.submissionRepository.findOneOrFail({
      confirmationId: id,
    });
  }

  async getAllSubmissions(): Promise<SubmissionEntity[]> {
    return await this.submissionRepository.find({});
  }

  async flattenAndTransformSubmissionData(
    submissions: SubmissionEntity[],
  ): Promise<SubmissionExportColumns[]> {
    return submissions.map(({ payload }) => {
      return {
        deployAnywhere: booleanToYesNo(payload.availabilityInformation.deployAnywhere),
        deploymentDuration: payload.availabilityInformation.deploymentDuration.toString(),
        deploymentLocations: payload.availabilityInformation.deploymentLocations.join(', '),
        isImmunized: booleanToYesNo(payload.availabilityInformation.isImmunized),
        C19ClinicSupport: booleanToYesNo(
          payload.availabilityInformation.placementPrefs.C19ClinicSupport,
        ),
        C19CommunityCare: booleanToYesNo(
          payload.availabilityInformation.placementPrefs.C19CommunityCare,
        ),
        C19LowRisk: booleanToYesNo(payload.availabilityInformation.placementPrefs.C19LowRisk),
        C19PatientCare: booleanToYesNo(
          payload.availabilityInformation.placementPrefs.C19PatientCare,
        ),
        WildFireOrOther: booleanToYesNo(
          payload.availabilityInformation.placementPrefs.WildFireOrOther,
        ),
        email: payload.contactInformation.email,
        primaryPhone: payload.contactInformation.primaryPhone,
        primaryPhoneExt: payload.contactInformation.primaryPhoneExt,
        secondaryPhone: payload.contactInformation.secondaryPhone,
        secondaryPhoneExt: payload.contactInformation.secondaryPhoneExt,
        firstName: payload.personalInformation.firstName,
        lastName: payload.personalInformation.lastName,
        postalCode: payload.personalInformation.postalCode,
        currentEmployment: payload.skillInformation.currentEmployment,
        employmentCircumstance: payload.skillInformation.employmentCircumstance,
        registrationNumber: payload.skillInformation.registrationNumber.toString(),
        registrationStatus: payload.skillInformation.registrationStatus,
        stream: payload.skillInformation.stream,
        additionalComments: payload.skillInformation.additionalComments,
      };
    });
  }
}