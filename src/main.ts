/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    // instaed of using ValidationPipe in each controller, we can use it globally
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Apply Middlewares
  app.use(helmet());

  // to connect to the frontend app
  app.enableCors({
    origin: 'http://localhost:3001', // replace with your frontend URL
  });

  const swagger = new DocumentBuilder().setVersion('1.0').build();

  const documentation = SwaggerModule.createDocument(app, swagger);
  // http://localhost:3000/swagger
  SwaggerModule.setup('swagger', app, documentation);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
