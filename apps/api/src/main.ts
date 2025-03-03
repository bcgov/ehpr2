import { ValidationPipe } from '@nestjs/common';
import { createNestApp } from './app.config';

async function bootstrap() {
  const { app } = await createNestApp();
  app.enableCors(
    process.env.RUN_TIME === 'local'
      ? {
          origin: '*', // or an array of origins
          methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
          allowedHeaders: 'Content-Type, Authorization',
          credentials: true,
        }
      : {},
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.init();
  await app.listen(process.env.APP_PORT || 4000);
}
bootstrap();
