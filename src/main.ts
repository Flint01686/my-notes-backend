import { NestFactory } from '@nestjs/core';
import { config } from 'aws-sdk';
import { AppModule } from './app.module';

const AWS_ACCESS_KEY_ID = 'AKIA3OW5KACYPENYPY4R';
const AWS_SECRET_ACCESS_KEY = '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';

async function bootstrap() {
  config.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1',
  });

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT || 1337);
}

bootstrap();
