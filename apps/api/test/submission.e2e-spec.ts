require('../env');
import { UpdateSubmissionDTO } from '@ehpr/common';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from '../src/app.module';

import validSubmissionData from './fixture/validSubmission.json';
import invalidSubmissionDataFirstname from './fixture/invalidSubmission_firstname.json';
import { validationPipeConfig } from 'src/app.config';
import { SubmissionService } from 'src/submission/submission.service';
import { ThrottlerIPGuard } from 'src/submission/throttler-ip.guard';

// Function to clean the submission table before each test
export const cleanSubmissionTable = async (app: INestApplication<any>) => {
  // Use the service to clean the submission table
  const submissionService = app.get(SubmissionService);
  await submissionService.truncateTable();
};

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let confirmationId: string;
  let updateSubmissionData: UpdateSubmissionDTO;

  beforeEach(async () => {
    // Setup application
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ThrottlerIPGuard) // we bypass the rate limiting for testing
      .useValue({ canactive: () => jest.fn().mockReturnValue(true) })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe(validationPipeConfig));
    await app.init();

    // Clean submission table and create a valid submission for tests
    await cleanSubmissionTable(app);

    const res = await request(app.getHttpServer())
      .post(`/submission`)
      .send(validSubmissionData)
      .expect(201);
    confirmationId = res.body.confirmationId;

    const { contactInformation, personalInformation } = validSubmissionData.payload;
    updateSubmissionData = {
      contactInformation,
      personalInformation,
      status: { interested: true, deployed: true },
      preferencesInformation: {
        hasExperienceWithIndigenousCommunity: true,
        hasExperienceWithRemoteRuralCommunity: true,
        completedSanyasIndigenousCulturalSafetyTraining: true,
      },
    };
  });

  afterEach(async () => {
    await app.close();
  });

  it('successfully saves a valid submission', async () => {
    const res = await request(app.getHttpServer())
      .post(`/submission`)
      .send(validSubmissionData)
      .expect(201);
    const { body } = res;
    expect(body.confirmationId).toBeDefined();
    expect(body.id).toBeDefined();
  });

  it('returns a validation error for blank firstName', async () => {
    await request(app.getHttpServer())
      .post(`/submission`)
      .send(invalidSubmissionDataFirstname)
      .expect(400)
      .expect(res => {
        const { body } = res;

        expect(body.error).toBe('Bad Request');

        const errorObject = body.message[0][0][0];

        expect(errorObject.firstName.matches).toBe('First Name is Required');
        expect(errorObject.firstName.isNotEmpty).toBe('First Name is Required');
        expect(errorObject.firstName.isLength).toBe(
          'First Name must be between 1 and 255 characters',
        );
      });
  });

  it('validates the submission update', async () => {
    await request(app.getHttpServer())
      .patch(`/submission/${confirmationId}`)
      .send(updateSubmissionData)
      .expect(400)
      .expect(({ body }) => {
        const error = body.message[0][0];
        const message = error.startDate.isDateString;
        expect(body.error).toBe('Bad Request');
        expect(message).toBe('startDate must be a valid ISO 8601 date string');
      });
  });

  it('updates the submission', async () => {
    updateSubmissionData.status.startDate = '2022-12-31';
    const res = await request(app.getHttpServer())
      .patch(`/submission/${confirmationId}`)
      .send(updateSubmissionData)
      .expect(200);

    expect(res.body.confirmationId).toBe(confirmationId);
  });

  describe('Rate-Limiting Tests', () => {
    beforeEach(async () => {
      await cleanSubmissionTable(app);

      // Create a new app instance with rate-limiting enabled
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.useGlobalPipes(new ValidationPipe(validationPipeConfig));
      await app.init();
    });

    afterEach(async () => {
      await app.close();
    });

    it('enforces rate limit after multiple requests', async () => {
      const requestCount = 2; // Number of requests to make
      const limitRequestCount = 1; // Number of requests that should succeed

      // First limitRequestCount succeed
      for (let i = 0; i < limitRequestCount; i++) {
        await request(app.getHttpServer())
          .post('/submission')
          .send(validSubmissionData)
          .expect(201);
      }

      // Subsequent requests should fail
      for (let i = 0; i < requestCount - limitRequestCount; i++) {
        await request(app.getHttpServer())
          .post('/submission')
          .send(validSubmissionData)
          .expect(429); // Too Many Requests
      }
    });
  });
});
