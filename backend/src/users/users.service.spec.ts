import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    permission: {
      findMany: jest.fn(),
    },
  };

  const mockUser = {
    id: 1,
    firstname: 'John',
    lastname: 'Doe',
    mail: 'john.doe@example.com',
    picture: 'https://example.com/avatar.jpg',
    password: 'hashedPassword123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto = {
        firstname: 'John',
        lastname: 'Doe',
        mail: 'john.doe@example.com',
        password: 'password123',
        picture: 'https://example.com/avatar.jpg',
      };

      const { password, ...userWithoutPassword } = mockUser;

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      mockPrismaService.user.create.mockResolvedValue(userWithoutPassword);

      const result = await service.create(createUserDto);

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { mail: createUserDto.mail },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          password: 'hashedPassword123',
        },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          mail: true,
          picture: true,
        },
      });
      expect(result).toEqual(userWithoutPassword);
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto = {
        firstname: 'John',
        lastname: 'Doe',
        mail: 'john.doe@example.com',
        password: 'password123',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Un utilisateur avec cet email existe déjà',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        {
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          mail: 'john.doe@example.com',
          picture: null,
        },
        {
          id: 2,
          firstname: 'Jane',
          lastname: 'Smith',
          mail: 'jane.smith@example.com',
          picture: 'https://example.com/jane.jpg',
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          firstname: true,
          lastname: true,
          mail: true,
          picture: true,
        },
      });
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const { password, ...userWithoutPassword } = mockUser;

      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPassword);

      const result = await service.findOne(1);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          mail: true,
          picture: true,
        },
      });
      expect(result).toEqual(userWithoutPassword);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Utilisateur #999 introuvable',
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const { password, ...userWithoutPassword } = mockUser;

      mockPrismaService.user.findFirst.mockResolvedValue(userWithoutPassword);

      const result = await service.findByEmail('john.doe@example.com');

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { mail: 'john.doe@example.com' },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          mail: true,
          picture: true,
        },
      });
      expect(result).toEqual(userWithoutPassword);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.findByEmail('notfound@example.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const updateUserDto = {
        firstname: 'Johnny',
        picture: 'https://example.com/new-avatar.jpg',
      };

      const { password, ...userWithoutPassword } = mockUser;
      const updatedUser = { ...userWithoutPassword, ...updateUserDto };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPassword);
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateUserDto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateUserDto,
        select: {
          id: true,
          firstname: true,
          lastname: true,
          mail: true,
          picture: true,
        },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should hash password when updating password', async () => {
      const updateUserDto = {
        password: 'newPassword123',
      };

      const { password, ...userWithoutPassword } = mockUser;

      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPassword);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      mockPrismaService.user.update.mockResolvedValue(userWithoutPassword);

      await service.update(1, updateUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: 'newHashedPassword' },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          mail: true,
          picture: true,
        },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      const updateUserDto = {
        mail: 'existing@example.com',
      };

      const { password, ...userWithoutPassword } = mockUser;

      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPassword);
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 2,
        mail: 'existing@example.com',
      });

      await expect(service.update(1, updateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { firstname: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      const { password, ...userWithoutPassword } = mockUser;

      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPassword);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove(1);

      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual({
        message: 'Utilisateur #1 supprimé avec succès',
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserPermissions', () => {
    it('should return user permissions with homes', async () => {
      const { password, ...userWithoutPassword } = mockUser;
      const permissions = [
        {
          id: 1,
          userId: 1,
          homeId: 1,
          type: 'admin',
          home: {
            id: 1,
            name: 'Maison Familiale',
          },
        },
        {
          id: 2,
          userId: 1,
          homeId: 2,
          type: 'member',
          home: {
            id: 2,
            name: 'Appartement',
          },
        },
      ];

      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPassword);
      mockPrismaService.permission.findMany.mockResolvedValue(permissions);

      const result = await service.getUserPermissions(1);

      expect(mockPrismaService.permission.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: {
          home: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      expect(result).toEqual(permissions);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserPermissions(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
