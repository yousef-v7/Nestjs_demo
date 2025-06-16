/* eslint-disable prettier/prettier */ import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { ProductsService } from './products.service';
import { UsersService } from '../users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dtos/create-product.dto';
type ProductTestType = { id: number; title: string; price: number };
type Options = {
  where?: { title?: string; minPrice?: number; maxPrice?: number };
};

describe('ProductsService', () => {
  // it's look like dipaendency injection
  // but actually it's not, it's just a test
  let productsService: ProductsService;
  let productsRepository: Repository<Product>;
  const REPOSITORY_TOKEN = getRepositoryToken(Product);
  const createProductDto: CreateProductDto = {
    title: 'book',
    description: 'about this book',
    price: 10,
  };

  let products: ProductTestType[];

  beforeEach(async () => {
    products = [
      { id: 1, title: 'book', price: 10 },
      { id: 2, title: 'pen', price: 5 },
      { id: 3, title: 'pencil', price: 2 },
    ];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: REPOSITORY_TOKEN,

          useValue: {
            create: jest.fn((dto: CreateProductDto) => dto),
            save: jest.fn((dto: CreateProductDto) =>
              Promise.resolve({ ...dto, id: 1 }),
            ),
            find: jest.fn((options?: Options) => {
              if (options && options.where && options.where.title)
                return Promise.resolve([products[0], products[1]]);
              return Promise.resolve(products);
            }),
          },
        },
        {
          provide: UsersService,
          // to mock the repository bcause we don't want to use the real database - 'fn' -> for mock
          useValue: {
            getCurrentUser: jest.fn((userId: number) =>
              Promise.resolve({ id: userId }),
            ),
          },
        },
      ],
    }).compile();

    productsService = module.get<ProductsService>(ProductsService);
    productsRepository = module.get<Repository<Product>>(REPOSITORY_TOKEN);
  });
  //

  it('should product service be define', () => {
    expect(productsService).toBeDefined();
  });

  it('should productsRepository be defined', () => {
    expect(productsRepository).toBeDefined();
  });

  // Create new Product Tests
  describe('createProduct()', () => {
    it("should call 'create' method in product repository", async () => {
      await productsService.createProduct(createProductDto, 1);
      expect(productsRepository.create).toHaveBeenCalled();
      expect(productsRepository.create).toHaveBeenCalledTimes(1);
    });

    it("should call 'save' method in product repository", async () => {
      await productsService.createProduct(createProductDto, 1);
      expect(productsRepository.save).toHaveBeenCalled();
      expect(productsRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should create a new product', async () => {
      const result = await productsService.createProduct(createProductDto, 1);
      expect(result).toBeDefined();
      expect(result.title).toBe('book');
      expect(result.id).toBe(1);
    });
  });

  // Get all products
  describe('getAllProducts()', () => {
    it("should call 'find' method in product repository", async () => {
      await productsService.getAllProducts();
      expect(productsRepository.find).toHaveBeenCalled();
      expect(productsRepository.find).toHaveBeenCalledTimes(1);
    });
  });
});
