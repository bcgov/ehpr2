import { Inject, Injectable, Logger } from '@nestjs/common';
import { SendEmailRequest } from 'aws-sdk/clients/ses';
import * as path from 'path';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import aws from 'aws-sdk';
import { AppLogger } from '../common/logger.service';

import { Mailable } from './mailables/mail-base.mailable';
import { MailOptions } from './types/mail-options';
import { PromiseResult } from 'aws-sdk/lib/request';

@Injectable()
export class MailService {
  ses = process.env.AWS_S3_REGION ? new aws.SES({ region: process.env.AWS_S3_REGION }) : null;

  constructor(@Inject(Logger) private readonly logger: AppLogger) {
    const templatePath = path.resolve(`${__dirname}/templates/partials/layout.hbs`);
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    handlebars.registerPartial('layout', templateContent);
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
  ): Promise<PromiseResult<aws.SES.SendEmailResponse, aws.AWSError> | undefined> {
    const mailOptions: Partial<MailOptions> = {
      from: process.env.MAIL_FROM,
      to: [mailable.recipient.email],
      subject: mailable.subject,
    };

    const templatePath = path.resolve(`${__dirname}/templates/${mailable.template}.hbs`);

    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent, { strict: true });
    const body = template(mailable.context);

    const result = await this.sendMailWithSES({ ...mailOptions, body } as MailOptions);

    return result;
  }

  public async sendMailWithSES(mailOptions: MailOptions) {
    if (!this.ses) return;
    const params: SendEmailRequest = {
      Destination: {
        ToAddresses: [...mailOptions.to],
      },
      Message: {
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
      Source: process.env.MAIL_FROM ?? 'EHPRDoNotReply@dev.ehpr.freshworks.club',
    };
    return await this.ses.sendEmail(params).promise();
  }
}
