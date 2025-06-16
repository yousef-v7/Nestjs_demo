/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Product } from '../src/products/product.entity';
import { CreateProductDto } from '../src/products/dtos/create-product.dto';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let productsToSave: CreateProductDto[];

  beforeEach(async () => {
    productsToSave = [
      { title: 'book', description: 'about this book', price: 10 },
      { title: 'pen', description: 'about this pen', price: 5 },
      { title: 'pencil', description: 'about this pencil', price: 2 },
    ];

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init(); 

    dataSource = app.get(DataSource);
  });

  afterEach(async () => {
    await dataSource.createQueryBuilder().delete().from(Product).execute();
    await app.close();
  });

  // GET: ~/api/products
  describe('GET /api/products', () => {
    it('should return all products from the database', async () => {
      await dataSource
        .createQueryBuilder()
        .insert()
        .into(Product)
        .values(productsToSave) 
        .execute();

      const response = await request(app.getHttpServer()).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
    });
  });
});
