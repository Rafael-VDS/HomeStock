import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySubcategory: jest.fn(),
    findProductsToBuy: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createDto = {
        homeId: 1,
        name: 'Test Product',
        picture: 'test.jpg',
        subcategoryId: 1,
      };

      const expectedResult = {
        id: 1,
        homeId: 1,
        subcategoryId: 1,
        name: 'Test Product',
        picture: 'test.jpg',
        mass: null,
        liquid: null,
        stockCount: 0,
        needsToBuy: true,
        subcategory: {
          id: 1,
          name: 'Test Subcategory',
          categoryId: 1,
          categoryName: 'Test Category',
        },
      };

      mockProductsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const expectedResult = [
        {
          id: 1,
          homeId: 1,
          subcategoryId: 1,
          name: 'Product 1',
          picture: 'test1.jpg',
          mass: null,
          liquid: null,
          stockCount: 0,
          needsToBuy: true,
          subcategory: {
            id: 1,
            name: 'Test Subcategory',
            categoryId: 1,
            categoryName: 'Test Category',
          },
        },
      ];

      mockProductsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should filter by homeId when provided', async () => {
      const homeId = '1';
      mockProductsService.findAll.mockResolvedValue([]);

      await controller.findAll(homeId);

      expect(service.findAll).toHaveBeenCalledWith(1);
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const expectedResult = {
        id: 1,
        homeId: 1,
        subcategoryId: 1,
        name: 'Product 1',
        picture: 'test1.jpg',
        mass: null,
        liquid: null,
        stockCount: 0,
        needsToBuy: true,
        subcategory: {
          id: 1,
          name: 'Test Subcategory',
          categoryId: 1,
          categoryName: 'Test Category',
        },
      };

      mockProductsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(1);

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateDto = { name: 'Updated Product' };
      const expectedResult = {
        id: 1,
        homeId: 1,
        subcategoryId: 1,
        name: 'Updated Product',
        picture: 'test.jpg',
        mass: null,
        liquid: null,
        stockCount: 0,
        needsToBuy: true,
        subcategory: {
          id: 1,
          name: 'Test Subcategory',
          categoryId: 1,
          categoryName: 'Test Category',
        },
      };

      mockProductsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(1, updateDto);

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      mockProductsService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('findProductsToBuy', () => {
    it('should return products that need to be bought', async () => {
      const expectedResult = [
        {
          id: 1,
          homeId: 1,
          subcategoryId: 1,
          name: 'Product 1',
          picture: 'test1.jpg',
          mass: null,
          liquid: null,
          stockCount: 1,
          needsToBuy: true,
          subcategory: {
            id: 1,
            name: 'Test Subcategory',
            categoryId: 1,
            categoryName: 'Test Category',
          },
        },
      ];

      mockProductsService.findProductsToBuy.mockResolvedValue(expectedResult);

      const result = await controller.findProductsToBuy(1);

      expect(result).toEqual(expectedResult);
      expect(service.findProductsToBuy).toHaveBeenCalledWith(1);
    });
  });

  describe('findBySubcategory', () => {
    it('should return products by subcategory', async () => {
      const expectedResult = [
        {
          id: 1,
          homeId: 1,
          subcategoryId: 1,
          name: 'Product 1',
          picture: 'test1.jpg',
          mass: null,
          liquid: null,
          stockCount: 0,
          needsToBuy: true,
          subcategory: {
            id: 1,
            name: 'Test Subcategory',
            categoryId: 1,
            categoryName: 'Test Category',
          },
        },
      ];

      mockProductsService.findBySubcategory.mockResolvedValue(expectedResult);

      const result = await controller.findBySubcategory(1);

      expect(result).toEqual(expectedResult);
      expect(service.findBySubcategory).toHaveBeenCalledWith(1);
    });
  });
});
