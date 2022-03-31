import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@vendia/serverless-express';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
  Callback,
  Handler,
} from 'aws-lambda';
import { createNestApp } from './app.config';
import { AppModule } from './app.module';
import { ExportService } from './export/export.service';

let cachedServer: Handler;

async function bootstrap() {
  if (!cachedServer) {
    const { app: nestApp, expressApp } = await createNestApp();
    await nestApp.init();
    cachedServer = serverlessExpress({ app: expressApp });
  }
  return cachedServer;
}

export const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback,
): Promise<APIGatewayProxyResult> => {
  const cachedServer = await bootstrap();
  return cachedServer(event, context, callback);
};

export const taskHandler: Handler = async (): Promise<any> => {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const exportService = appContext.get(ExportService);
  return await exportService.exportSubmissions();
};
