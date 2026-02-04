import { Test, TestingModule } from '@nestjs/testing';
import { HomesService } from './homes.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('HomesService', () => {
  let service: HomesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    home: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<HomesService>(HomesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new home', async () => {
      const createHomeDto = { name: 'Test Home' };
      const expectedHome = { id: 1, ...createHomeDto };

      mockPrismaService.home.create.mockResolvedValue(expectedHome);

      const result = await service.create(createHomeDto);

      expect(result).toEqual(expectedHome);
      expect(prisma.home.create).toHaveBeenCalledWith({
        data: createHomeDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of homes', async () => {
      const expectedHomes = [
        { id: 1, name: 'Home 1' },
        { id: 2, name: 'Home 2' },
      ];

      mockPrismaService.home.findMany.mockResolvedValue(expectedHomes);

      const result = await service.findAll();

      expect(result).toEqual(expectedHomes);
      expect(prisma.home.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'asc' },
      });
    });

    it('should return an empty array when no homes exist', async () => {
      mockPrismaService.home.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a home by id', async () => {
      const expectedHome = { id: 1, name: 'Test Home' };

      mockPrismaService.home.findUnique.mockResolvedValue(expectedHome);

      const result = await service.findOne(1);

      expect(result).toEqual(expectedHome);
      expect(prisma.home.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when home not found', async () => {
      mockPrismaService.home.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        "Maison avec l'ID 999 introuvable",
      );
    });
  });

  describe('update', () => {
    it('should update a home', async () => {
      const updateHomeDto = { name: 'Updated Home' };
      const expectedHome = { id: 1, ...updateHomeDto };

      mockPrismaService.home.update.mockResolvedValue(expectedHome);

      const result = await service.update(1, updateHomeDto);

      expect(result).toEqual(expectedHome);
      expect(prisma.home.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateHomeDto,
      });
    });

    it('should throw NotFoundException when home not found', async () => {
      const updateHomeDto = { name: 'Updated Home' };
      mockPrismaService.home.update.mockRejectedValue({ code: 'P2025' });

      await expect(service.update(999, updateHomeDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a home', async () => {
      mockPrismaService.home.delete.mockResolvedValue({ id: 1, name: 'Test Home' });

      const result = await service.remove(1);

      expect(result).toEqual({
        message: "Maison avec l'ID 1 supprimée avec succès",
      });
      expect(prisma.home.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when home not found', async () => {
      mockPrismaService.home.delete.mockRejectedValue({ code: 'P2025' });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getHomeUsers', () => {
    it('should return users with permissions for a home', async () => {
      const expectedResult = {
        id: 1,
        name: 'Test Home',
        permissions: [
          {
            id: 1,
            type: 'admin',
            user: {
              id: 1,
              firstname: 'John',
              lastname: 'Doe',
              mail: 'john@example.com',
              picture: null,
            },
          },
        ],
      };

      mockPrismaService.home.findUnique.mockResolvedValue(expectedResult);

      const result = await service.getHomeUsers(1);

      expect(result).toEqual([
        {
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          mail: 'john@example.com',
          picture: null,
          permissionType: 'admin',
          permissionId: 1,
        },
      ]);
    });

    it('should throw NotFoundException when home not found', async () => {
      mockPrismaService.home.findUnique.mockResolvedValue(null);

      await expect(service.getHomeUsers(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getHomeCategories', () => {
    it('should return categories for a home', async () => {
      const expectedResult = {
        id: 1,
        name: 'Test Home',
        categories: [
          { id: 1, name: 'Category 1', homeId: 1 },
        ],
      };

      mockPrismaService.home.findUnique.mockResolvedValue(expectedResult);

      const result = await service.getHomeCategories(1);

      expect(result).toEqual(expectedResult.categories);
    });

    it('should throw NotFoundException when home not found', async () => {
      mockPrismaService.home.findUnique.mockResolvedValue(null);

      await expect(service.getHomeCategories(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getHomeProducts', () => {
    it('should return products for a home', async () => {
      const expectedResult = {
        id: 1,
        name: 'Test Home',
        products: [
          {
            id: 1,
            name: 'Product 1',
            homeId: 1,
            category: { id: 1, name: 'Category 1' },
          },
        ],
      };

      mockPrismaService.home.findUnique.mockResolvedValue(expectedResult);

      const result = await service.getHomeProducts(1);

      expect(result).toEqual(expectedResult.products);
    });

    it('should throw NotFoundException when home not found', async () => {
      mockPrismaService.home.findUnique.mockResolvedValue(null);

      await expect(service.getHomeProducts(999)).rejects.toThrow(NotFoundException);
    });
  });
});
