import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    home: {
      findUnique: jest.fn(),
    },
    subcategory: {
      findUnique: jest.fn(),
    },
    productBatch: {
      count: jest.fn(),
    },
    cartProduct: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const createDto = {
        homeId: 1,
        name: 'Test Product',
        picture: 'test.jpg',
        mass: 500,
        subcategoryId: 1,
      };

      const mockHome = { id: 1, name: 'Test Home' };
      const mockSubcategory = { 
        id: 1, 
        name: 'Test Subcategory',
        categoryId: 1,
        category: { id: 1, name: 'Test Category' }
      };
      const mockProduct = {
        id: 1,
        homeId: 1,
        subcategoryId: 1,
        name: 'Test Product',
        picture: 'test.jpg',
        mass: 500,
        liquid: null,
        subcategory: mockSubcategory,
        productBatches: [],
      };

      mockPrismaService.home.findUnique.mockResolvedValue(mockHome);
      mockPrismaService.subcategory.findUnique.mockResolvedValue(mockSubcategory);
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(prisma.home.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.subcategory.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { category: true },
      });
    });

    it('should throw NotFoundException if home does not exist', async () => {
      const createDto = {
        homeId: 999,
        name: 'Test Product',
        picture: 'test.jpg',
        subcategoryId: 1,
      };

      mockPrismaService.home.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a product if found', async () => {
      const mockProduct = {
        id: 1,
        homeId: 1,
        subcategoryId: 1,
        name: 'Test Product',
        picture: 'test.jpg',
        mass: 500,
        liquid: null,
        subcategory: {
          id: 1,
          name: 'Test Subcategory',
          categoryId: 1,
          category: { id: 1, name: 'Test Category' },
        },
        productBatches: [],
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should throw BadRequestException if product has stock', async () => {
      const mockProduct = {
        id: 1,
        homeId: 1,
        subcategoryId: 1,
        name: 'Test Product',
        picture: 'test.jpg',
        mass: 500,
        liquid: null,
        subcategory: {
          id: 1,
          name: 'Test Subcategory',
          categoryId: 1,
          category: { id: 1, name: 'Test Category' },
        },
        productBatches: [],
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.productBatch.count.mockResolvedValue(3);

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if product is in cart', async () => {
      const mockProduct = {
        id: 1,
        homeId: 1,
        subcategoryId: 1,
        name: 'Test Product',
        picture: 'test.jpg',
        mass: 500,
        liquid: null,
        subcategory: {
          id: 1,
          name: 'Test Subcategory',
          categoryId: 1,
          category: { id: 1, name: 'Test Category' },
        },
        productBatches: [],
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.productBatch.count.mockResolvedValue(0);
      mockPrismaService.cartProduct.count.mockResolvedValue(1);

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });
  });
});
