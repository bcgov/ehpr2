import { booleanToYesNo, getSubSpecialtyById, splitLhasByHa } from '@ehpr/common';
import { INestApplicationContext } from '@nestjs/common';
import aws from 'aws-sdk';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import * as csvWriter from 'csv-writer';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import nodemailer from 'nodemailer';
import { AppLogger } from '../common/logger.service';
import { SubmissionEntity } from '../submission/entity/submission.entity';
import { SubmissionService } from '../submission/submission.service';

dayjs.extend(weekOfYear);

export const formExportColumnHeaders = [
  { id: 'id', title: 'ID' },

  // Primary Information
  { id: 'firstName', title: 'First Name' },
  { id: 'lastName', title: 'Last Name' },
  { id: 'postalCode', title: 'Postal Code' },

  // Contact Information
  { id: 'primaryPhone', title: 'Primary Phone' },
  { id: 'primaryPhoneExt', title: 'Primary Phone Ext' },
  { id: 'secondaryPhone', title: 'Secondary Phone' },
  { id: 'secondaryPhoneExt', title: 'Secondary Phone Ext' },
  { id: 'email', title: 'Email' },

  // Credential Information
  { id: 'stream', title: 'Stream' },
  { id: 'specialty', title: 'Specialty' },
  { id: 'subspecialties', title: 'Subspecialties' },
  { id: 'allSpecialties', title: 'All Specialties' },
  { id: 'registrationStatus', title: 'Registration Status' },
  { id: 'registrationNumber', title: 'Registration Number' },
  { id: 'currentEmployment', title: 'Current Employment' },
  { id: 'healthAuthorities', title: 'Employment Health Authorities' },
  { id: 'employmentCircumstance', title: 'Employment Circumstance' },
  { id: 'nonClinicalJobTitle', title: 'Non-Clinical Job Title' },

  // Preferences
  { id: 'deployAnywhere', title: 'Deploy Anywhere' },
  { id: 'VancouverCoastal', title: 'Vancouver/Coastal' },
  { id: 'FraserRegion', title: 'Fraser Region' },
  { id: 'VancouverIslandRegion', title: 'Vancouver Island Region' },
  { id: 'InteriorRegion', title: 'Interior Region' },
  { id: 'NorthernRegion', title: 'Northern Region' },
  { id: 'FirstNationsRegion', title: 'First Nations Health Authority' },
  { id: 'placementOptions', title: 'Placement Options' },
  { id: 'hasImmunizationTraining', title: 'Has Immunization Training' },
  { id: 'deploymentDuration', title: 'Deployment Duration' },
  { id: 'hasPreviousDeployment', title: 'Previous Deployment' },
  { id: 'lastDeploymentDate', title: 'Previous Deployment Date' },
  { id: 'lastDeployedHa', title: 'Previous Deployment Health Authority' },

  // Update
  { id: 'withdrawn', title: 'Withdrawn' },
  { id: 'deployed', title: 'Deployed' },
  { id: 'deploymentStart', title: 'Deployment Start' },
  { id: 'deploymentEnd', title: 'Deployment End' },

  { id: 'hasExperienceWithIndigenousCommunity', title: 'Experience With Indigenous Community' },
  { id: 'hasExperienceWithRemoteRuralCommunity', title: 'Experience With Rural Community' },
  {
    id: 'completedSanyasIndigenousCulturalSafetyTraining',
    title: "Completed San'yas Indigenous Cultural Safety Training",
  },
];

export const flattenAndTransformFormData = (submissions: SubmissionEntity[]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flatNormalizedSubmissions: any[] = [];
  submissions.forEach(({ id, payload, withdrawn }) => {
    const {
      personalInformation,
      contactInformation,
      credentialInformation,
      preferencesInformation,
      status,
    } = payload;

    const deploymentLocations = preferencesInformation?.deploymentLocations;
    const healthAuthorities = splitLhasByHa(deploymentLocations);
    const payloadData = {
      id,

      firstName: personalInformation.firstName,
      lastName: personalInformation.lastName,
      postalCode: personalInformation.postalCode,

      primaryPhone: contactInformation.primaryPhone,
      primaryPhoneExt: contactInformation.primaryPhoneExt,
      secondaryPhone: contactInformation.secondaryPhone,
      secondaryPhoneExt: contactInformation.secondaryPhoneExt,
      email: contactInformation.email,

      stream: credentialInformation?.stream,
      registrationStatus: credentialInformation?.registrationStatus,
      registrationNumber: credentialInformation?.registrationNumber,
      currentEmployment: credentialInformation?.currentEmployment,
      specialty: '',
      subspecialties: '',
      healthAuthorities: credentialInformation?.healthAuthorities,
      employmentCircumstance: credentialInformation?.employmentCircumstance,
      nonClinicalJobTitle: credentialInformation?.nonClinicalJobTitle,

      deployAnywhere: booleanToYesNo(preferencesInformation?.deployAnywhere),
      VancouverCoastal: healthAuthorities.VancouverCoastal?.lhas.join(', '),
      FraserRegion: healthAuthorities.FraserRegion?.lhas.join(', '),
      VancouverIslandRegion: healthAuthorities.VancouverIslandRegion.lhas.join(', '),
      InteriorRegion: healthAuthorities.InteriorRegion?.lhas.join(', '),
      NorthernRegion: healthAuthorities.NorthernRegion?.lhas.join(', '),
      FirstNationsRegion: healthAuthorities.FirstNationsHealthAuthority?.lhas.join(', '),
      deploymentLocations: preferencesInformation?.deploymentLocations,
      placementOptions: preferencesInformation?.placementOptions,
      hasImmunizationTraining: booleanToYesNo(preferencesInformation?.hasImmunizationTraining),
      deploymentDuration: preferencesInformation?.deploymentDuration,
      hasPreviousDeployment: preferencesInformation?.hasPreviousDeployment,
      lastDeploymentDate: preferencesInformation?.lastDeploymentDate,
      lastDeployedHa: preferencesInformation?.lastDeployedHa,
      withdrawn: booleanToYesNo(withdrawn),
      deployed: booleanToYesNo(status?.deployed ?? false),
      deploymentStart: status?.startDate,
      deploymentEnd: status?.endDate,
      hasExperienceWithIndigenousCommunity:
        preferencesInformation?.hasExperienceWithIndigenousCommunity,
      hasExperienceWithRemoteRuralCommunity:
        preferencesInformation?.hasExperienceWithRemoteRuralCommunity,
      completedSanyasIndigenousCulturalSafetyTraining:
        preferencesInformation?.completedSanyasIndigenousCulturalSafetyTraining,
    };

    if (!credentialInformation?.specialties.length) {
      flatNormalizedSubmissions.push({ ...payloadData });
    } else {
      credentialInformation?.specialties.forEach(specialty => {
        flatNormalizedSubmissions.push({
          ...payloadData,
          specialty: specialty.id,
          subspecialties: specialty.subspecialties
            ?.map(subspecialty => getSubSpecialtyById(subspecialty.id).name)
            .join(','),
        });
      });
    }
  });

  return flatNormalizedSubmissions;
};

let sesClient = new SESv2Client({ region: process.env.AWS_S3_REGION });

if (process.env.RUNTIME_ENV === 'local') {
  // Local SES setup
  sesClient = new SESv2Client({
    endpoint: 'http://localhost:8005',
    region: 'aws-ses-v2-local',
    credentials: { accessKeyId: 'ANY_STRING', secretAccessKey: 'ANY_STRING' }, // NOSONAR
  });
}

const transport = nodemailer.createTransport({
  SES: { sesClient, SendEmailCommand },
}); // NOSONAR

const mailOptions = {
  from: process.env.MAIL_FROM ?? 'EHPRDoNotReply@gov.bc.ca',
  to: '',
  subject: `[EHPR] ${dayjs().year()} Week ${dayjs().week()} data-extract`,
  text: `All submissions were extracted at ${dayjs().format('MMM D, YYYY h:mm A')}.`,
};

const sendEmail = async (to: string, filename: string, content: string) => {
  await transport.sendMail({
    ...mailOptions,
    to,
    attachments: [{ filename, content }],
  });
};

export const sendDataExtract = async (app: INestApplicationContext, context: string) => {
  const service = app.get(SubmissionService);
  const logger = app.get(AppLogger);

  logger.log('Submission extraction triggered', context);

  try {
    const submissions = await service.getSubmissions();

    const flatSubmissions = flattenAndTransformFormData(submissions);
    const stringifier = csvWriter.createObjectCsvStringifier({
      header: formExportColumnHeaders,
    });
    const content = stringifier.getHeaderString() + stringifier.stringifyRecords(flatSubmissions);
    const filename = `ehpr-submissions-${dayjs().format('YYYY-MM-DD')}.csv`;

    const recipients = process.env.MAIL_RECIPIENTS?.split(',') ?? [];

    await Promise.all(recipients.map(recipient => sendEmail(recipient, filename, content)));

    logger.log(
      `${filename} of ${submissions.length} submission data sent to ${recipients.length} recipients`,
      context,
    );
  } catch (e) {
    if (e instanceof Error) {
      logger.log(e.stack, context);
    }
  }
};
