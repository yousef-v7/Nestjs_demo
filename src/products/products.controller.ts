/* eslint-disable prettier/prettier */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ProductsService } from './products.service';
import { AuthRoleGuard } from '../users/guards/auth-roles.guard';
import { Roles } from '../users/decorators/user-role.decorator';
import { UserType } from '../utils/enum';
import { JwtPayloadType } from '../utils/types';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('/api/products')
export class ProductsController {
  // Dependency Injection -> constructor injection
  constructor(private readonly productsService: ProductsService) {}

  // POST: ~/api/products
  @Post()
  @UseGuards(AuthRoleGuard)
  @Roles(UserType.ADMIN)
  public createNewProduct(
    @Body() body: CreateProductDto,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    return this.productsService.createProduct(body, payload.id);
  }

  // Get: ~/api/products
  @Get()

  //this for Swagger documentation
  @ApiOperation({
    summary: 'Get all products',
  })
  @ApiQuery({
    name: 'title',
    required: false,
    description: 'Filter products by title',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Filter products by minimum price',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Filter products by maximum price',
  })
  public getAllProducts(
    @Query('title') title: string,
    @Query('minPrice') minPrice: string,
    @Query('maxPrice') maxPrice: string,
  ) {
    return this.productsService.getAllProducts(title, minPrice, maxPrice);
  }

  // Get: ~/api/products/:id
  @Get(':id')
  @SkipThrottle() // for skipping limited number of requests
  public getProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getProductById(id);
  }

  // Put : ~/api/products/:id
  @Put(':id')
  @UseGuards(AuthRoleGuard)
  @Roles(UserType.ADMIN)
  public updateProductById(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ) {
    return this.productsService.updateProductById(id, body);
  }

  // Delete: ~/api/products/:id
  @Delete(':id')
  @UseGuards(AuthRoleGuard)
  @Roles(UserType.ADMIN)
  public deleteProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.deleteProductById(id);
  }
}
