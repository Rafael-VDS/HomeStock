import { Test, TestingModule } from '@nestjs/testing';
import { ProductBatchesService } from './product-batches.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProductBatchesService', () => {
  let service: ProductBatchesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    productBatch: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
    home: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductBatchesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductBatchesService>(ProductBatchesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a batch successfully', async () => {
      const createDto = {
        productId: 1,
        homeId: 1,
        expirationDate: '2026-12-31',
      };

      const mockProduct = { id: 1, name: 'Test Product' };
      const mockHome = { id: 1, name: 'Test Home' };
      const mockBatch = {
        id: 1,
        ...createDto,
        expirationDate: new Date('2026-12-31'),
        product: { id: 1, name: 'Test Product', picture: 'test.jpg' },
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.home.findUnique.mockResolvedValue(mockHome);
      mockPrismaService.productBatch.create.mockResolvedValue(mockBatch);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.productId).toBe(1);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      const createDto = {
        productId: 999,
        homeId: 1,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if home does not exist', async () => {
      const createDto = {
        productId: 1,
        homeId: 999,
      };

      const mockProduct = { id: 1, name: 'Test Product' };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.home.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createMany', () => {
    it('should create multiple batches', async () => {
      const mockProduct = { id: 1, name: 'Test Product' };
      const mockBatch = {
        id: 1,
        productId: 1,
        homeId: 1,
        expirationDate: new Date('2026-12-31'),
        product: { id: 1, name: 'Test Product', picture: 'test.jpg' },
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.productBatch.create.mockResolvedValue(mockBatch);

      const result = await service.createMany(1, 1, 3, '2026-12-31');

      expect(result).toHaveLength(3);
      expect(prisma.productBatch.create).toHaveBeenCalledTimes(3);
    });

    it('should throw BadRequestException for invalid quantity', async () => {
      const mockProduct = { id: 1, name: 'Test Product' };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      await expect(service.createMany(1, 1, 0)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a batch if found', async () => {
      const mockBatch = {
        id: 1,
        productId: 1,
        homeId: 1,
        expirationDate: new Date('2026-12-31'),
        product: { id: 1, name: 'Test Product', picture: 'test.jpg' },
      };

      mockPrismaService.productBatch.findUnique.mockResolvedValue(mockBatch);

      const result = await service.findOne(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if batch not found', async () => {
      mockPrismaService.productBatch.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('consume', () => {
    it('should consume batches using FEFO', async () => {
      const mockBatches = [
        { id: 1, productId: 1, homeId: 1, expirationDate: new Date('2026-01-01') },
        { id: 2, productId: 1, homeId: 1, expirationDate: new Date('2026-02-01') },
      ];

      mockPrismaService.productBatch.findMany.mockResolvedValue(mockBatches);
      mockPrismaService.productBatch.deleteMany.mockResolvedValue({ count: 2 });

      await service.consume(1, 1, 2);

      expect(prisma.productBatch.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2] } },
      });
    });

    it('should throw BadRequestException if insufficient stock', async () => {
      const mockBatches = [
        { id: 1, productId: 1, homeId: 1, expirationDate: new Date('2026-01-01') },
      ];

      mockPrismaService.productBatch.findMany.mockResolvedValue(mockBatches);

      await expect(service.consume(1, 1, 3)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid quantity', async () => {
      await expect(service.consume(1, 1, 0)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findExpired', () => {
    it('should return expired batches', async () => {
      const mockBatches = [
        {
          id: 1,
          productId: 1,
          homeId: 1,
          expirationDate: new Date('2020-01-01'),
          product: { id: 1, name: 'Test Product', picture: 'test.jpg' },
        },
      ];

      mockPrismaService.productBatch.findMany.mockResolvedValue(mockBatches);

      const result = await service.findExpired(1);

      expect(result).toBeDefined();
      expect(result[0].isExpired).toBe(true);
    });
  });

  describe('findExpiringSoon', () => {
    it('should return batches expiring soon', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const mockBatches = [
        {
          id: 1,
          productId: 1,
          homeId: 1,
          expirationDate: tomorrow,
          product: { id: 1, name: 'Test Product', picture: 'test.jpg' },
        },
      ];

      mockPrismaService.productBatch.findMany.mockResolvedValue(mockBatches);

      const result = await service.findExpiringSoon(1);

      expect(result).toBeDefined();
      expect(result[0].expiringSoon).toBe(true);
    });
  });
});
