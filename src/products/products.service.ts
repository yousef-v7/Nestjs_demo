/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Between, Like, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProductsService {
  //Dependency Injection
  constructor(
    @InjectRepository(Product)
    // you should add these to test providers[]
    private readonly productsRepository: Repository<Product>,
    private readonly UsersService: UsersService,
  ) {}

  /**
   * Create new product
   * @param dto data for creating new product
   * @param userId id of the logged in user (Admin)
   * @returns the created product from the database
   */
  public async createProduct(dto: CreateProductDto, userId?: number) {
    if (!userId) throw new BadRequestException('User ID is required');
    const user = await this.UsersService.getCurrentUser(userId);
    const newProduct = this.productsRepository.create({
      ...dto,
      title: dto.title.toLowerCase(),
      user: user,
    });
    const savedProduct = await this.productsRepository.save(newProduct);
    return savedProduct;
  }

  /**
   * Get all products
   * @returns collection of products
   */
  public getAllProducts(title?: string, minPrice?: string, maxPrice?: string) {
    const filters = {
      ...(title ? { title: Like(`%${title.toLowerCase()}%`) } : {}),
      ...(minPrice && maxPrice
        ? { price: Between(parseInt(minPrice), parseInt(maxPrice)) }
        : {}),
    };
    return this.productsRepository.find({ where: filters });
  }

  /**
   *
   * Get product by id
   * @param id product id
   *
   */
  public async getProductById(id: number) {
    const product = await this.productsRepository.findOne({
      where: { id },
    });
    if (!product) throw new NotFoundException();
    return product;
  }

  /**
   *
   * Update product by id
   */
  public async updateProductById(
    id: number,
    updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productsRepository.findOneBy({ id: +id });
    if (!product) throw new NotFoundException('Product not found');

    const updatedProduct = Object.assign(product, updateProductDto);
    return await this.productsRepository.save(updatedProduct);
  }

  /**
   *
   * Delete product by id
   */
  public async deleteProductById(id: number) {
    const product = await this.productsRepository.findOneBy({ id: +id });

    if (!product) throw new NotFoundException('Product not found');

    return this.productsRepository.delete(product.id);
  }
}
