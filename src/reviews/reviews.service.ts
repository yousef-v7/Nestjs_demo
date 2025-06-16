/* eslint-disable prettier/prettier */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { UserType } from '../utils/enum';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Create new review
   * @param productId id of the product
   * @param userId id of the user that created this review
   * @param dto data for creating new review
   * @returns the created review from the database
   */
  public async createReview(
    productId: number,
    userId: number,
    dto: CreateReviewDto,
  ) {
    const product = await this.productsService.getProductById(productId);
    const user = await this.usersService.getCurrentUser(userId);
    if (!product) throw new NotFoundException('Product not found');
    if (!user) throw new NotFoundException('User not found');

    const newReview = this.reviewsRepository.create({
      ...dto,
      user,
      product,
    });

    const result = await this.reviewsRepository.save(newReview);

    return {
      id: result.id,
      comment: result.comment,
      rating: result.rating,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      product: {
        id: product.id,
        title: product.title,
      },
    };
  }

  /**
   * Get all review
   * @returns reviews from the database
   */

  public async getAllReviews() {
    const reviews = await this.reviewsRepository.find({
      order: {
        createdAt: 'DESC',
      },
      relations: ['pr..oduct']
    });

    if (!reviews || reviews.length === 0) {
      throw new NotFoundException('No reviews found');
    }
    return reviews.map((review) => ({
      id: review.id,
      comment: review.comment,
      rating: review.rating,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      product: review.product
        ? {
            id: review.product.id,
            title: review.product.title,
          }
        : null,
      user: review.user
        ? {
            id: review.user.id,
            userName: review.user.userName,
          }
        : null,
    }));
  }

  /**
   * Get review by id
   * @param id id of the review
   * @returns review from the database
   */

  public async getReviewById(id: number) {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['product']
    });
    if (!review) throw new NotFoundException('Review not found');
    return {
      id: review.id,
      comment: review.comment,
      rating: review.rating,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      product: review.product
        ? {
            id: review.product.id,
            title: review.product.title,
          }
        : null,
      user: review.user
        ? {
            id: review.user.id,
            userName: review.user.userName,
          }
        : null,
    };
  }

  /**
   * update review by id
   * @param id id of the review
   * @returns update review from the database
   */

  public async updateReviewById(
    id: number,
    dto: UpdateReviewDto,
    userId: number,
    userType: UserType,
  ) {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['product']
    });

    if (!review) throw new NotFoundException('Review not found');

    const isOwner = review.user.id === userId;
    const isAdmin = userType === UserType.ADMIN;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Access denied');
    }

    const updatedReview = Object.assign(review, dto);
    const result = await this.reviewsRepository.save(updatedReview);

    return {
      id: result.id,
      comment: result.comment,
      rating: result.rating,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      product: result.product
        ? {
            id: result.product.id,
            title: result.product.title,
          }
        : null,
      user: result.user
        ? {
            id: result.user.id,
            userName: result.user.userName,
          }
        : null,
    };
  }

  /**
   * Delete review by id
   * @param id id of the review
   * @returns deleted review from the database
   */
  public async deleteReviewById(
    id: number,
    userId: number,
    userType: UserType,
  ) {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['product']
    });

    if (!review) throw new NotFoundException('Review not found');

    // Check if the user is allowed to delete this review
    const isOwner = review.user.id === userId;
    const isAdmin = userType === UserType.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'Access denied. You cannot delete this review.',
      );
    }

    await this.reviewsRepository.delete(id);

    return { message: 'Review deleted successfully' };
  }
}
