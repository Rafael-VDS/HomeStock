import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    home: {
      findUnique: jest.fn(),
    },
    permission: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createPermissionDto = {
      userId: 1,
      homeId: 1,
      type: 'admin',
    };

    it('should create a new permission', async () => {
      const mockUser = { id: 1, firstname: 'John', lastname: 'Doe', mail: 'john@example.com', password: 'hash', picture: null };
      const mockHome = { id: 1, name: 'Test Home' };
      const expectedPermission = { id: 1, ...createPermissionDto };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.home.findUnique.mockResolvedValue(mockHome);
      mockPrismaService.permission.findFirst.mockResolvedValue(null);
      mockPrismaService.permission.create.mockResolvedValue(expectedPermission);

      const result = await service.create(createPermissionDto);

      expect(result).toEqual(expectedPermission);
      expect(prisma.permission.create).toHaveBeenCalledWith({
        data: createPermissionDto,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.create(createPermissionDto)).rejects.toThrow(NotFoundException);
      await expect(service.create(createPermissionDto)).rejects.toThrow(
        "Utilisateur avec l'ID 1 introuvable",
      );
    });

    it('should throw NotFoundException when home not found', async () => {
      const mockUser = { id: 1, firstname: 'John', lastname: 'Doe', mail: 'john@example.com', password: 'hash', picture: null };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.home.findUnique.mockResolvedValue(null);

      await expect(service.create(createPermissionDto)).rejects.toThrow(NotFoundException);
      await expect(service.create(createPermissionDto)).rejects.toThrow(
        "Maison avec l'ID 1 introuvable",
      );
    });

    it('should throw ConflictException when permission already exists', async () => {
      const mockUser = { id: 1, firstname: 'John', lastname: 'Doe', mail: 'john@example.com', password: 'hash', picture: null };
      const mockHome = { id: 1, name: 'Test Home' };
      const existingPermission = { id: 1, userId: 1, homeId: 1, type: 'member' };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.home.findUnique.mockResolvedValue(mockHome);
      mockPrismaService.permission.findFirst.mockResolvedValue(existingPermission);

      await expect(service.create(createPermissionDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByHome', () => {
    it('should return permissions for a home', async () => {
      const mockHome = { id: 1, name: 'Test Home' };
      const expectedPermissions = [
        {
          id: 1,
          userId: 1,
          homeId: 1,
          type: 'admin',
          user: { id: 1, firstname: 'John', lastname: 'Doe', mail: 'john@example.com', picture: null },
        },
      ];

      mockPrismaService.home.findUnique.mockResolvedValue(mockHome);
      mockPrismaService.permission.findMany.mockResolvedValue(expectedPermissions);

      const result = await service.findByHome(1);

      expect(result).toEqual(expectedPermissions);
      expect(prisma.permission.findMany).toHaveBeenCalledWith({
        where: { homeId: 1 },
        include: {
          user: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              mail: true,
              picture: true,
            },
          },
        },
        orderBy: { id: 'asc' },
      });
    });

    it('should throw NotFoundException when home not found', async () => {
      mockPrismaService.home.findUnique.mockResolvedValue(null);

      await expect(service.findByHome(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    it('should return permissions for a user', async () => {
      const mockUser = { id: 1, firstname: 'John', lastname: 'Doe', mail: 'john@example.com', password: 'hash', picture: null };
      const expectedPermissions = [
        {
          id: 1,
          userId: 1,
          homeId: 1,
          type: 'admin',
          home: { id: 1, name: 'Test Home' },
        },
      ];

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.permission.findMany.mockResolvedValue(expectedPermissions);

      const result = await service.findByUser(1);

      expect(result).toEqual(expectedPermissions);
      expect(prisma.permission.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: {
          home: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { id: 'asc' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findByUser(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a permission by id', async () => {
      const expectedPermission = {
        id: 1,
        userId: 1,
        homeId: 1,
        type: 'admin',
        user: { id: 1, firstname: 'John', lastname: 'Doe', mail: 'john@example.com', picture: null },
        home: { id: 1, name: 'Test Home' },
      };

      mockPrismaService.permission.findUnique.mockResolvedValue(expectedPermission);

      const result = await service.findOne(1);

      expect(result).toEqual(expectedPermission);
    });

    it('should throw NotFoundException when permission not found', async () => {
      mockPrismaService.permission.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a permission', async () => {
      const updatePermissionDto = { type: 'member' };
      const expectedPermission = {
        id: 1,
        userId: 1,
        homeId: 1,
        type: 'member',
        user: { id: 1, firstname: 'John', lastname: 'Doe', mail: 'john@example.com', picture: null },
        home: { id: 1, name: 'Test Home' },
      };

      mockPrismaService.permission.update.mockResolvedValue(expectedPermission);

      const result = await service.update(1, updatePermissionDto);

      expect(result).toEqual(expectedPermission);
    });

    it('should throw NotFoundException when permission not found', async () => {
      const updatePermissionDto = { type: 'member' };
      mockPrismaService.permission.update.mockRejectedValue({ code: 'P2025' });

      await expect(service.update(999, updatePermissionDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a permission', async () => {
      mockPrismaService.permission.delete.mockResolvedValue({ id: 1, userId: 1, homeId: 1, type: 'admin' });

      const result = await service.remove(1);

      expect(result).toEqual({
        message: "Permission avec l'ID 1 supprimée avec succès",
      });
    });

    it('should throw NotFoundException when permission not found', async () => {
      mockPrismaService.permission.delete.mockRejectedValue({ code: 'P2025' });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
