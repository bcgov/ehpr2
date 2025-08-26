import { Inject, Injectable, Logger } from '@nestjs/common';
import { ServiceException } from '@smithy/smithy-client';
import { SendEmailCommandInput, SendEmailCommandOutput, SESv2 } from '@aws-sdk/client-sesv2';
import * as path from 'path';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { AppLogger } from '../common/logger.service';

import { Mailable } from './mailables/mail-base.mailable';
import { MailOptions } from './types/mail-options';

@Injectable()
export class MailService {
  private readonly ses: SESv2 | null;

  constructor(@Inject(Logger) private readonly logger: AppLogger) {
    const templatePath = path.resolve(`${__dirname}/templates/partials/layout.hbs`);
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    handlebars.registerPartial('layout', templateContent);

    if (process.env.RUNTIME_ENV === 'local') {
      // Local SES setup
      this.ses = new SESv2({
        endpoint: 'http://localhost:8005',
        region: 'aws-ses-v2-local',

        // NOSONAR
        credentials: { accessKeyId: 'ANY_STRING', secretAccessKey: 'ANY_STRING' },
      });
    } else if (process.env.AWS_S3_REGION) {
      this.ses = new SESv2({
        region: process.env.AWS_S3_REGION,
      });
    } else {
      this.ses = null;
    }
  }

  /**
   * Sends an email
   *
   * @param mailable - Email to be sent
   * @returns A promise for the result of sending the email
   */

  public async sendMailable(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mailable: Mailable<any>,
  ): Promise<SendEmailCommandOutput | ServiceException | undefined> {
    const mailOptions: Partial<MailOptions> = {
      from: process.env.MAIL_FROM,
      to: [mailable.recipient.email],
      subject: mailable.subject,
    };

    const templatePath = path.resolve(`${__dirname}/templates/${mailable.template}.hbs`);

    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent, { strict: true });
    const body = template(mailable.context);

    return this.sendMailWithSES({ ...mailOptions, body } as MailOptions);
  }

  public async sendMailWithSES(mailOptions: MailOptions) {
    if (!this.ses) return;
    const params: SendEmailCommandInput = {
      Destination: {
        ToAddresses: [...mailOptions.to],
      },
      Content: {
        Simple: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: mailOptions.body,
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: mailOptions.subject,
          },
        },
      },
      FromEmailAddress: process.env.MAIL_FROM ?? 'EHPRDoNotReply@dev.ehpr.freshworks.club',
    };
    return this.ses.sendEmail(params);
  }
}
