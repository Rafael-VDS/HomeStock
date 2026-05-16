import { Test, TestingModule } from '@nestjs/testing';
import { ProductBatchesController } from './product-batches.controller';
import { ProductBatchesService } from './product-batches.service';

describe('ProductBatchesController', () => {
  let controller: ProductBatchesController;
  let service: ProductBatchesService;

  const mockProductBatchesService = {
    create: jest.fn(),
    createMany: jest.fn(),
    consume: jest.fn(),
    findAll: jest.fn(),
    findByProduct: jest.fn(),
    findExpired: jest.fn(),
    findExpiringSoon: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductBatchesController],
      providers: [
        {
          provide: ProductBatchesService,
          useValue: mockProductBatchesService,
        },
      ],
    }).compile();

    controller = module.get<ProductBatchesController>(
      ProductBatchesController,
    );
    service = module.get<ProductBatchesService>(ProductBatchesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a batch', async () => {
      const createDto = {
        productId: 1,
        homeId: 1,
        expirationDate: '2026-12-31',
      };

      const expectedResult = {
        id: 1,
        ...createDto,
        product: { id: 1, name: 'Test Product', picture: 'test.jpg' },
        daysUntilExpiration: 300,
        isExpired: false,
        expiringSoon: false,
      };

      mockProductBatchesService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('createMany', () => {
    it('should create multiple batches', async () => {
      const data = {
        productId: 1,
        homeId: 1,
        quantity: 3,
        expirationDate: '2026-12-31',
      };

      const expectedResult = [
        {
          id: 1,
          productId: 1,
          homeId: 1,
          expirationDate: '2026-12-31',
          product: { id: 1, name: 'Test Product', picture: 'test.jpg' },
          daysUntilExpiration: 300,
          isExpired: false,
          expiringSoon: false,
        },
      ];

      mockProductBatchesService.createMany.mockResolvedValue(expectedResult);

      const result = await controller.createMany(data);

      expect(result).toEqual(expectedResult);
      expect(service.createMany).toHaveBeenCalledWith(
        data.productId,
        data.homeId,
        data.quantity,
        data.expirationDate,
      );
    });
  });

  describe('consume', () => {
    it('should consume batches', async () => {
      const data = { productId: 1, homeId: 1, quantity: 2 };

      mockProductBatchesService.consume.mockResolvedValue(undefined);

      await controller.consume(data);

      expect(service.consume).toHaveBeenCalledWith(
        data.productId,
        data.homeId,
        data.quantity,
      );
    });
  });

  describe('findAll', () => {
    it('should return all batches', async () => {
      const expectedResult = [
        {
          id: 1,
          productId: 1,
          homeId: 1,
          expirationDate: '2026-12-31',
          product: { id: 1, name: 'Test Product', picture: 'test.jpg' },
          daysUntilExpiration: 300,
          isExpired: false,
          expiringSoon: false,
        },
      ];

      mockProductBatchesService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should filter by homeId when provided', async () => {
      const homeId = '1';
      mockProductBatchesService.findAll.mockResolvedValue([]);

      await controller.findAll(homeId);

      expect(service.findAll).toHaveBeenCalledWith(1);
    });
  });

  describe('findByProduct', () => {
    it('should return batches by product', async () => {
      const expectedResult = [
        {
          id: 1,
          productId: 1,
          homeId: 1,
          expirationDate: '2026-12-31',
          product: { id: 1, name: 'Test Product', picture: 'test.jpg' },
          daysUntilExpiration: 300,
          isExpired: false,
          expiringSoon: false,
        },
      ];

      mockProductBatchesService.findByProduct.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.findByProduct(1);

      expect(result).toEqual(expectedResult);
      expect(service.findByProduct).toHaveBeenCalledWith(1);
    });
  });

  describe('findExpired', () => {
    it('should return expired batches', async () => {
      const expectedResult = [
        {
          id: 1,
          productId: 1,
          homeId: 1,
          expirationDate: '2020-01-01',
          product: { id: 1, name: 'Test Product', picture: 'test.jpg' },
          daysUntilExpiration: -1000,
          isExpired: true,
          expiringSoon: false,
        },
      ];

      mockProductBatchesService.findExpired.mockResolvedValue(expectedResult);

      const result = await controller.findExpired(1);

      expect(result).toEqual(expectedResult);
      expect(service.findExpired).toHaveBeenCalledWith(1);
    });
  });

  describe('findExpiringSoon', () => {
    it('should return batches expiring soon', async () => {
      const expectedResult = [
        {
          id: 1,
          productId: 1,
          homeId: 1,
          expirationDate: '2026-02-10',
          product: { id: 1, name: 'Test Product', picture: 'test.jpg' },
          daysUntilExpiration: 5,
          isExpired: false,
          expiringSoon: true,
        },
      ];

      mockProductBatchesService.findExpiringSoon.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.findExpiringSoon(1);

      expect(result).toEqual(expectedResult);
      expect(service.findExpiringSoon).toHaveBeenCalledWith(1);
    });
  });

  describe('findOne', () => {
    it('should return a single batch', async () => {
      const expectedResult = {
        id: 1,
        productId: 1,
        homeId: 1,
        expirationDate: '2026-12-31',
        product: { id: 1, name: 'Test Product', picture: 'test.jpg' },
        daysUntilExpiration: 300,
        isExpired: false,
        expiringSoon: false,
      };

      mockProductBatchesService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(1);

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a batch', async () => {
      const updateDto = { expirationDate: '2027-01-01' };
      const expectedResult = {
        id: 1,
        productId: 1,
        homeId: 1,
        expirationDate: '2027-01-01',
        product: { id: 1, name: 'Test Product', picture: 'test.jpg' },
        daysUntilExpiration: 365,
        isExpired: false,
        expiringSoon: false,
      };

      mockProductBatchesService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(1, updateDto);

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a batch', async () => {
      mockProductBatchesService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
