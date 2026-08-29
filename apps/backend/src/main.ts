import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. CORS Configuration
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 2. Global Validation Pipe (Validates DTO payloads against class-validator constraints)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 3. Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // 4. OpenAPI / Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('BitsB2B Marketplace API')
    .setDescription(
      'Production NestJS REST API for Ethiopian B2B Marketplace with Telebirr/CBE Birr Escrow & Bulk Volume Tier Pricing',
    )
    .setVersion('3.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 BitsB2B Backend API running on http://localhost:${port}`);
  logger.log(`📚 Swagger API Docs available on http://localhost:${port}/api/docs`);
  logger.log(`🐘 PostgreSQL database: "${process.env.DB_NAME || 'bitsb2b'}" connected on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
}

bootstrap();
