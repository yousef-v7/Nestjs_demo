/* eslint-disable prettier/prettier */
import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UploadsModule } from './uploads/uploads.module';
import { MailModule } from './mail/mail.module';
import { LoggerMiddleware } from './utils/middlewares/logger.middleware';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { dataSourceOptions } from '../db/data-source';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV !== 'production'
          ? `.env.${process.env.NODE_ENV}`
          : `.env`,
    }),
    // for limiting the number of requests
    ThrottlerModule.forRoot([
      {
        ttl: 10000, // 10 seconds
        limit: 3, // 3 requests every 10 seconds for a client
      },
    ]),
    TypeOrmModule.forRoot(dataSourceOptions),
    ProductsModule,
    UsersModule,
    ReviewsModule,
    UploadsModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [
    {
      // ?when u send req to user u 'll not get password field in response
      // ?because we are using ClassSerializer Interceptor
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    // for limiting the number of requests
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [],
})

// for global middlewares
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({
      path: 'api/products',
      method: RequestMethod.GET,
    });
  }
}

// local data

// {
//       inject: [ConfigService],
//       useFactory: (config: ConfigService) => ({
//         type: 'postgres',
//         host: 'localhost',
//         port: config.get<number>('DB_PORT'),
//         username: config.get<string>('DB_USERNAME'),
//         password: config.get<string>('DB_PASSWORD'),
//         database: config.get<string>('DB_DATABASE'),
//         synchronize: process.env.NODE_ENV !== 'production', // ⚠️ Use only in development
//         entities: [Product, Review, User],
//       }),
//     }
