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
import { SubmissionService } from 'src/submission/submission.service';
import { formatRegistrants } from 'src/submission/submission.util';
import { MailService } from 'src/mail/mail.service';
import { MailOptions } from '../mail/types/mail-options';
import { MassEmailRecordService } from 'src/mass-email-record/mass-email-record.service';
import { AppLogger } from 'src/common/logger.service';
import { SubmissionEntity } from 'src/submission/entity/submission.entity';

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

  async sendMassEmail(payload: EmailTemplateDTO) {
    // rate limit requests to handle AWS SES req/ second limits (currently 40/s)
    // 35 available tokens for each window of 1 second
    const limiter = new RateLimiter({ tokensPerInterval: 35, interval: 1000 });
    // TODO: need to figure out a typing for this
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorsArray: any[] = [];

    try {
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

          const url = domain
            ? `https://${domain}/unsubscribe?token=${token}`
            : `http://localhost:3000/unsubscribe?token=${token}`;

          const fullHtmlBody = `<div>${payload.body}<br/><footer style="text-align: center;"><a href='${url}'>Unsubscribe</a></footer></div>`;

          // don't show unsubscribe link for test emails
          const mailOptions: MailOptions = {
            body: !payload.userId ? payload.body : fullHtmlBody,
            from: process.env.MAIL_FROM ?? 'EHPRDoNotReply@dev.ehpr.freshworks.club',
            subject: payload.subject,
            to: [item.email],
          };
          // remove a token for each processed request
          await limiter.removeTokens(1);

          await this.mailService.sendMailWithSES(mailOptions);
        });
      // check for errors from test email
      if (!payload.userId && errorsArray.length > 0) {
        throw new InternalServerErrorException('There was an issue trying to send the test email');
      }
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(e || 'There was an issue trying to send emails');
    }

    // don't make record for test emails
    // no user id for test email
    // create a record entry regardless if errored out
    if (payload.userId) {
      const emailIds = payload.data.map(({ id }) => id);
      // format data for record entry
      const record = this.massEmailRecordService.mapRecordObject(
        payload.userId,
        emailIds,
        errorsArray,
      );

      await this.massEmailRecordService.createMassEmailRecord(record);
    }
  }
}
