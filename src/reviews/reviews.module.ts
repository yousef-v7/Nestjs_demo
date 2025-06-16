/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { Reviewcontroller } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from './review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Review]), ProductsModule, UsersModule, JwtModule],
  controllers: [Reviewcontroller],
  providers: [ReviewsService],
  exports: [],
})
export class ReviewsModule {}
