import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from 'src/mail/mail.module';
import { SubmissionEntity } from 'src/submission/entity/submission.entity';
import { ExportService } from './export.service';

@Module({
  imports: [TypeOrmModule.forFeature([SubmissionEntity]), MailModule],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
