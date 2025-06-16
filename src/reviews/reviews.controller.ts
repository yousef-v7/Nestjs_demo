/* eslint-disable prettier/prettier */

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Roles } from '../users/decorators/user-role.decorator';
import { AuthRoleGuard } from '../users/guards/auth-roles.guard';
import { UserType } from '../utils/enum';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { CreateReviewDto } from './dtos/create-review.dto';
import { JwtPayloadType } from '../utils/types';
import { UpdateReviewDto } from './dtos/update-review.dto';

@Controller('api/reviews')
export class Reviewcontroller {
  // Dependency Injection -> constructor injection
  constructor(private readonly reviewsService: ReviewsService) {}

  // POST: ~/api/reviews/:productId
  @Post(':productId')
  @UseGuards(AuthRoleGuard)
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  public createNewReview(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: CreateReviewDto,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    return this.reviewsService.createReview(productId, payload.id, body);
  }

  // Get: ~/api/reviews
  @Get()
  @UseGuards(AuthRoleGuard)
  @Roles(UserType.ADMIN)
  public getAllReviews() {
    return this.reviewsService.getAllReviews();
  }

  // Get: ~/api/reviews/:id
  @Get(':id')
  public getReviewById(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.getReviewById(id);
  }

  // Put: ~/api/reviews/:id
  @Put(':id')
  @UseGuards(AuthRoleGuard)
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  public updateReviewById(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateReviewDto,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    return this.reviewsService.updateReviewById(
      id,
      body,
      payload.id,
      payload.userType as UserType,
    );
  }

  // Delete: ~/api/reviews/:id
  @Delete(':id')
  @UseGuards(AuthRoleGuard)
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  public deleteReviewById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    return this.reviewsService.deleteReviewById(
      id,
      payload.id,
      payload.userType as UserType,
    );
  }
}
