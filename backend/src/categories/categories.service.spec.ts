import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    home: {
      findUnique: jest.fn(),
    },
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    subcategory: {
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
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==================== CATEGORIES TESTS ====================

  describe('createCategory', () => {
    const createCategoryDto = {
      homeId: 1,
      name: 'Fruits et Légumes',
      picture: 'https://example.com/fruits.jpg',
    };

    it('should create a new category', async () => {
      const mockHome = { id: 1, name: 'Test Home' };
      const expectedCategory = { id: 1, ...createCategoryDto };

      mockPrismaService.home.findUnique.mockResolvedValue(mockHome);
      mockPrismaService.category.create.mockResolvedValue(expectedCategory);

      const result = await service.createCategory(createCategoryDto);

      expect(result).toEqual(expectedCategory);
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: createCategoryDto,
      });
    });

    it('should throw NotFoundException when home not found', async () => {
      mockPrismaService.home.findUnique.mockResolvedValue(null);

      await expect(service.createCategory(createCategoryDto)).rejects.toThrow(NotFoundException);
      await expect(service.createCategory(createCategoryDto)).rejects.toThrow(
        "Maison avec l'ID 1 introuvable",
      );
    });
  });

  describe('findCategoriesByHome', () => {
    it('should return categories for a home with subcategories', async () => {
      const mockHome = { id: 1, name: 'Test Home' };
      const expectedCategories = [
        {
          id: 1,
          homeId: 1,
          name: 'Fruits',
          picture: 'https://example.com/fruits.jpg',
          subcategories: [
            { id: 1, categoryId: 1, name: 'Pommes' },
          ],
        },
      ];

      mockPrismaService.home.findUnique.mockResolvedValue(mockHome);
      mockPrismaService.category.findMany.mockResolvedValue(expectedCategories);

      const result = await service.findCategoriesByHome(1);

      expect(result).toEqual(expectedCategories);
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: { homeId: 1 },
        include: {
          subcategories: true,
        },
        orderBy: { id: 'asc' },
      });
    });

    it('should throw NotFoundException when home not found', async () => {
      mockPrismaService.home.findUnique.mockResolvedValue(null);

      await expect(service.findCategoriesByHome(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneCategory', () => {
    it('should return a category by id with subcategories', async () => {
      const expectedCategory = {
        id: 1,
        homeId: 1,
        name: 'Fruits',
        picture: 'https://example.com/fruits.jpg',
        subcategories: [
          { id: 1, categoryId: 1, name: 'Pommes' },
        ],
      };

      mockPrismaService.category.findUnique.mockResolvedValue(expectedCategory);

      const result = await service.findOneCategory(1);

      expect(result).toEqual(expectedCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.findOneCategory(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCategory', () => {
    it('should update a category', async () => {
      const updateCategoryDto = { 
        name: 'Légumes',
        picture: 'https://example.com/vegetables.jpg',
      };
      const expectedCategory = {
        id: 1,
        homeId: 1,
        ...updateCategoryDto,
        subcategories: [],
      };

      mockPrismaService.category.update.mockResolvedValue(expectedCategory);

      const result = await service.updateCategory(1, updateCategoryDto);

      expect(result).toEqual(expectedCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      const updateCategoryDto = { name: 'Légumes' };
      mockPrismaService.category.update.mockRejectedValue({ code: 'P2025' });

      await expect(service.updateCategory(999, updateCategoryDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeCategory', () => {
    it('should delete a category', async () => {
      mockPrismaService.category.delete.mockResolvedValue({
        id: 1,
        homeId: 1,
        name: 'Fruits',
        picture: 'https://example.com/fruits.jpg',
      });

      const result = await service.removeCategory(1);

      expect(result).toEqual({
        message: "Catégorie avec l'ID 1 supprimée avec succès",
      });
    });

    it('should throw NotFoundException when category not found', async () => {
      mockPrismaService.category.delete.mockRejectedValue({ code: 'P2025' });

      await expect(service.removeCategory(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== SUBCATEGORIES TESTS ====================

  describe('createSubcategory', () => {
    const createSubcategoryDto = {
      categoryId: 1,
      name: 'Pommes',
    };

    it('should create a new subcategory', async () => {
      const mockCategory = {
        id: 1,
        homeId: 1,
        name: 'Fruits',
        picture: 'https://example.com/fruits.jpg',
      };
      const expectedSubcategory = { id: 1, ...createSubcategoryDto };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.subcategory.create.mockResolvedValue(expectedSubcategory);

      const result = await service.createSubcategory(createSubcategoryDto);

      expect(result).toEqual(expectedSubcategory);
      expect(prisma.subcategory.create).toHaveBeenCalledWith({
        data: createSubcategoryDto,
      });
    });

    it('should throw NotFoundException when category not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.createSubcategory(createSubcategoryDto)).rejects.toThrow(NotFoundException);
      await expect(service.createSubcategory(createSubcategoryDto)).rejects.toThrow(
        "Catégorie avec l'ID 1 introuvable",
      );
    });
  });

  describe('findSubcategoriesByCategory', () => {
    it('should return subcategories for a category', async () => {
      const mockCategory = {
        id: 1,
        homeId: 1,
        name: 'Fruits',
        picture: 'https://example.com/fruits.jpg',
      };
      const expectedSubcategories = [
        { id: 1, categoryId: 1, name: 'Pommes' },
        { id: 2, categoryId: 1, name: 'Bananes' },
      ];

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.subcategory.findMany.mockResolvedValue(expectedSubcategories);

      const result = await service.findSubcategoriesByCategory(1);

      expect(result).toEqual(expectedSubcategories);
      expect(prisma.subcategory.findMany).toHaveBeenCalledWith({
        where: { categoryId: 1 },
        orderBy: { id: 'asc' },
      });
    });

    it('should throw NotFoundException when category not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.findSubcategoriesByCategory(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneSubcategory', () => {
    it('should return a subcategory by id with category', async () => {
      const expectedSubcategory = {
        id: 1,
        categoryId: 1,
        name: 'Pommes',
        category: {
          id: 1,
          homeId: 1,
          name: 'Fruits',
          picture: 'https://example.com/fruits.jpg',
        },
      };

      mockPrismaService.subcategory.findUnique.mockResolvedValue(expectedSubcategory);

      const result = await service.findOneSubcategory(1);

      expect(result).toEqual(expectedSubcategory);
    });

    it('should throw NotFoundException when subcategory not found', async () => {
      mockPrismaService.subcategory.findUnique.mockResolvedValue(null);

      await expect(service.findOneSubcategory(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSubcategory', () => {
    it('should update a subcategory', async () => {
      const updateSubcategoryDto = { name: 'Pommes Vertes' };
      const expectedSubcategory = {
        id: 1,
        categoryId: 1,
        name: 'Pommes Vertes',
      };

      mockPrismaService.subcategory.update.mockResolvedValue(expectedSubcategory);

      const result = await service.updateSubcategory(1, updateSubcategoryDto);

      expect(result).toEqual(expectedSubcategory);
    });

    it('should throw NotFoundException when subcategory not found', async () => {
      const updateSubcategoryDto = { name: 'Test' };
      mockPrismaService.subcategory.update.mockRejectedValue({ code: 'P2025' });

      await expect(service.updateSubcategory(999, updateSubcategoryDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeSubcategory', () => {
    it('should delete a subcategory', async () => {
      mockPrismaService.subcategory.delete.mockResolvedValue({
        id: 1,
        categoryId: 1,
        name: 'Pommes',
      });

      const result = await service.removeSubcategory(1);

      expect(result).toEqual({
        message: "Sous-catégorie avec l'ID 1 supprimée avec succès",
      });
    });

    it('should throw NotFoundException when subcategory not found', async () => {
      mockPrismaService.subcategory.delete.mockRejectedValue({ code: 'P2025' });

      await expect(service.removeSubcategory(999)).rejects.toThrow(NotFoundException);
    });
  });
});
