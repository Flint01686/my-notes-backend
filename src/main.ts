import { NestFactory } from '@nestjs/core';
import { config } from 'aws-sdk';
import { AppModule } from './app.module';

async function bootstrap() {
  config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT || 1337);
}

bootstrap();
