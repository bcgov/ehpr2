import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import PromisePool from '@supercharge/promise-pool';
import { RateLimiter } from 'limiter';
import {
  EmailTemplateDTO,
  RegistrantFilterDTO,
  RegistrantRO,
  UnsubscribeReasonDTO,
} from '@ehpr/common';
import { ProcessTemplate, SubmissionMap } from './types/template';
import { SubmissionService } from 'src/submission/submission.service';
import { formatRegistrants } from 'src/submission/submission.util';
import { MailService } from 'src/mail/mail.service';
import { MailOptions } from '../mail/types/mail-options';
import { MassEmailRecordService } from 'src/mass-email-record/mass-email-record.service';
import { AppLogger } from 'src/common/logger.service';
import { SubmissionEntity } from 'src/submission/entity/submission.entity';
import { getBodyWithFooter, updateSubmissionLink } from 'src/mail/mail.util';
import { UserEntity } from 'src/user/entity/user.entity';

@Injectable()
export class RegistrantService {
  constructor(
    @Inject(SubmissionService)
    private readonly submissionService: SubmissionService,
    @Inject(MailService)
    private readonly mailService: MailService,
    @Inject(MassEmailRecordService)
    private readonly massEmailRecordService: MassEmailRecordService,
    @Inject(Logger) private readonly logger: AppLogger,
    @InjectRepository(SubmissionEntity)
    private readonly submissionRepository: Repository<SubmissionEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async unsubscribeRegistrant(id: string, payload: UnsubscribeReasonDTO) {
    const submission = await this.submissionService.findSubmissionById(id);

    if (!submission) {
      throw new NotFoundException(`No submission record for ${id}`);
    }

    // check if user is already withdrawn
    if (submission.withdrawn) {
      throw new ConflictException('You are already unsubscribed from further contact');
    }

    submission.withdrawn = true;
    submission.withdrawnReason = payload.otherReason || payload.reason;

    await this.submissionRepository.update(submission.id, submission);
  }

  async getRegistrants(
    filter: RegistrantFilterDTO,
    haId?: number,
    userEmail?: string,
  ): Promise<[data: RegistrantRO[], count: number]> {
    const [data, count] = await this.submissionService.getSubmissionsFilterQuery(
      filter,
      haId,
      userEmail,
    );

    const registrants = formatRegistrants(data);
    return [registrants, count];
  }

  async sendMassEmail(payload: EmailTemplateDTO, user: UserEntity) {
    // rate limit requests to handle AWS SES req/ second limits (currently 40/s)
    // 35 available tokens for each window of 1 second
    const limiter = new RateLimiter({ tokensPerInterval: 35, interval: 1000 });
    // TODO: need to figure out a typing for this
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorsArray: any[] = [];
    const messageIds: Record<string, string> = {};

    try {
      const submissionsMap = await this.mapSubmissionIdToConfirmationId(payload);
      // setup promise pool
      await PromisePool.withConcurrency(10)
        .for(payload.data)
        .handleError(async (error, recipient) => {
          // have to handle errors manually with this handler
          // to be able to access recipient id
          // does not actually throw errors
          errorsArray.push({ error, recipientId: recipient.id });
        })
        .process(async item => {
          const domain = process.env.DOMAIN;
          const token = this.jwtService.sign({ email: item.email, id: item.id });
          const data = submissionsMap.get(item.id);
          let body = payload.body;

          if (data?.confirmationId && domain) {
            body = this.processTemplateBody({
              templateBody: payload.body,
              email: item.email,
              domain,
              submissionData: data,
            });
          }

          body = getBodyWithFooter(body, payload.isTest ? '' : token, domain);
          // don't show unsubscribe link for test emails
          const mailOptions: MailOptions = {
            body,
            from: process.env.MAIL_FROM ?? 'EHPRDoNotReply@dev.ehpr.freshworks.club',
            subject: payload.subject,
            to: [item.email],
          };
          await limiter.removeTokens(1);

          const result = await this.mailService.sendMailWithSES(mailOptions);
          messageIds[item.id] = result?.MessageId ?? '';
        });
      // check for errors from test email
      if (payload.isTest && errorsArray.length > 0) {
        throw new InternalServerErrorException('There was an issue trying to send the test email');
      }
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(e || 'There was an issue trying to send emails');
    }

    // don't make record for test emails
    if (!payload.isTest) {
      // format data for record entry
      const record = this.massEmailRecordService.mapRecordObject(
        user,
        payload.subject,
        payload.data,
        errorsArray,
        messageIds,
      );

      await this.massEmailRecordService.createMassEmailRecord(record);
    }
  }

  // Replaces coded words based on the word name
  private processTemplateBody({
    templateBody,
    email,
    domain,
    submissionData: { confirmationId, firstName, lastName, fullName },
  }: ProcessTemplate) {
    type ReplacementKey = 'update_link' | 'first_name' | 'last_name' | 'full_name';

    const subUpdateUrl = domain
      ? `https://${domain}/update-submission?email=${email}&code=${confirmationId}`
      : `https://ehpr.gov.bc.ca/update-submission?email=${email}&code=${confirmationId}`;

    const replacements: Record<ReplacementKey, string> = {
      update_link: updateSubmissionLink(subUpdateUrl, 'Update your submission'),
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
    };

    // Replacing each coded word with selected string
    const processedBody = templateBody.replace(/\$\{([^}{]+)\}/g, (match, group) => {
      const key = group.toLowerCase() as ReplacementKey;
      if (key in replacements) {
        return replacements[key];
      }

      return match; // Return the replacement or the original match if not located
    });

    return processedBody;
  }

  // Used to make lookup faster in PromisePool loop
  private async mapSubmissionIdToConfirmationId(payload: EmailTemplateDTO) {
    const ids = payload.data.map(submission => submission.id);
    const { submissions, missingIds } =
      await this.submissionService.getSubmissionsPersonalInfo(ids);

    if (missingIds?.length) {
      this.logger.warn(`Unable to find the following submissions ${missingIds.join(', ')}`);
    }

    const submissionsMap = new Map<string, SubmissionMap>();
    // Maps each submission id to its confirmation id
    submissions.reduce((map: Map<string, SubmissionMap>, submission) => {
      map.set(submission.id, {
        confirmationId: submission.confirmationId,
        firstName: submission.firstName,
        lastName: submission.lastName,
        fullName: `${submission.firstName} ${submission.lastName}`,
      });
      return map;
    }, submissionsMap);

    return submissionsMap;
  }
}
