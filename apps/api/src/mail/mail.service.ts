import { Inject, Injectable, Logger } from '@nestjs/common';
import { SendEmailRequest } from 'aws-sdk/clients/ses';
import * as path from 'path';
import axios from 'axios';
import * as fs from 'fs';
import { stringify } from 'qs';
import * as handlebars from 'handlebars';
import aws from 'aws-sdk';
import { AppLogger } from '../common/logger.service';

import { Mailable } from './mailables/mail-base.mailable';
import { MailOptions } from './types/mail-options';
import { ChesResponse } from './types/ches-response';

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
   * @param mailOptions - Email to be sent
   * @returns A promise for the result of sending the email
   */
  public async sendMailWithChes(mailOptions: MailOptions): Promise<ChesResponse | void> {
    const chesHost = process.env.CHES_SERVICE_HOST;
    if (!chesHost) return;

    const emailBody = {
      from: 'EHPRDoNotReply@gov.bc.ca',
      to: mailOptions.to,
      subject: mailOptions.subject,
      bodyType: 'html',
      body: mailOptions.body,
    };
    const token = await this.getChesToken();

    const { data } = await axios.post<ChesResponse>(
      `${process.env.CHES_SERVICE_HOST}/api/v1/email`,
      emailBody,
      {
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        timeout: 20000,
      },
    );
    return data;
  }

  /**
   * Auxiliary function to get access token from CHES
   *
   */
  private async getChesToken() {
    const token = await axios.post(
      process.env.CHES_AUTH_URL as string,
      stringify({ grant_type: 'client_credentials' }),
      {
        auth: {
          username: process.env.CHES_CLIENT_ID as string,
          password: process.env.CHES_CLIENT_SECRET as string,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 5000,
      },
    );
    return token.data.access_token;
  }

  /**
   * Sends an email
   *
   * @param mailable - Email to be sent
   * @returns A promise for the result of sending the email
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async sendMailable(mailable: Mailable<any>): Promise<ChesResponse | void> {
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
    if (!result || result.$response.error) {
      return this.sendMailWithChes({ ...mailOptions, body } as MailOptions);
    }
    return { txId: result.MessageId } as ChesResponse;
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
