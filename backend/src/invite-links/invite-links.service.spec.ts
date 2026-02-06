import { Test, TestingModule } from '@nestjs/testing';
import { InviteLinksService } from './invite-links.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('InviteLinksService', () => {
  let service: InviteLinksService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InviteLinksService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findUnique: jest.fn(),
            },
            inviteLink: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
            permission: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<InviteLinksService>(InviteLinksService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an invite link with 7 days expiration', async () => {
      const homeId = 1;
      const mockHome = { id: homeId, name: 'Test Home' };
      const mockInviteLink = {
        id: 1,
        homeId,
        link: 'abc123xyz',
        permissionType: 'read-write',
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      jest.spyOn(prisma.home, 'findUnique').mockResolvedValue(mockHome as any);
      jest.spyOn((prisma as any).inviteLink, 'findUnique').mockResolvedValue(null);
      jest.spyOn((prisma as any).inviteLink, 'create').mockResolvedValue(mockInviteLink as any);

      const result = await service.create({ homeId, permissionType: 'read-write' });

      expect(result).toBeDefined();
      expect(result.homeId).toBe(homeId);
      expect(result.link).toBeDefined();
      expect((prisma as any).inviteLink.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if home does not exist', async () => {
      jest.spyOn(prisma.home, 'findUnique').mockResolvedValue(null);

      await expect(service.create({ homeId: 999, permissionType: 'read-write' })).rejects.toThrow(NotFoundException);
    });

    it('should create an invite link with read permission', async () => {
      const homeId = 1;
      const mockHome = { id: homeId, name: 'Test Home' };
      const mockInviteLink = {
        id: 1,
        homeId,
        link: 'abc123xyz',
        permissionType: 'read',
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      jest.spyOn(prisma.home, 'findUnique').mockResolvedValue(mockHome as any);
      jest.spyOn((prisma as any).inviteLink, 'findUnique').mockResolvedValue(null);
      jest.spyOn((prisma as any).inviteLink, 'create').mockResolvedValue(mockInviteLink as any);

      const result = await service.create({ homeId, permissionType: 'read' });

      expect(result).toBeDefined();
      expect(result.permissionType).toBe('read');
    });
  });

  describe('useInviteLink', () => {
    it('should throw NotFoundException if link is invalid', async () => {
      jest.spyOn((prisma as any).inviteLink, 'findUnique').mockResolvedValue(null);

      await expect(
        service.useInviteLink({ link: 'invalid', userId: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if link is expired', async () => {
      const expiredLink = {
        id: 1,
        homeId: 1,
        link: 'expired',
        permissionType: 'read-write',
        expirationDate: new Date(Date.now() - 1000), // Expired
        createdAt: new Date(),
      };

      jest.spyOn((prisma as any).inviteLink, 'findUnique').mockResolvedValue(expiredLink as any);

      await expect(
        service.useInviteLink({ link: 'expired', userId: 1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if user already has permission', async () => {
      const validLink = {
        id: 1,
        homeId: 1,
        link: 'valid',
        permissionType: 'read-write',
        expirationDate: new Date(Date.now() + 1000000),
        createdAt: new Date(),
      };
      const mockUser = { id: 1, firstname: 'John', lastname: 'Doe', mail: 'john@example.com', password: 'hash' };
      const existingPermission = { id: 1, userId: 1, homeId: 1, type: 'read-write' };

      jest.spyOn((prisma as any).inviteLink, 'findUnique').mockResolvedValue(validLink as any);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest.spyOn(prisma.permission, 'findUnique').mockResolvedValue(existingPermission as any);

      await expect(
        service.useInviteLink({ link: 'valid', userId: 1 }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create permission with correct type from invite link', async () => {
      const validLink = {
        id: 1,
        homeId: 1,
        link: 'valid',
        permissionType: 'read',
        expirationDate: new Date(Date.now() + 1000000),
        createdAt: new Date(),
      };
      const mockUser = { id: 1, firstname: 'John', lastname: 'Doe', mail: 'john@example.com', password: 'hash' };
      const mockPermission = {
        id: 1,
        userId: 1,
        homeId: 1,
        type: 'read',
        home: { id: 1, name: 'Test Home' },
        user: { id: 1, firstname: 'John', lastname: 'Doe', mail: 'john@example.com', picture: null },
      };

      jest.spyOn((prisma as any).inviteLink, 'findUnique').mockResolvedValue(validLink as any);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest.spyOn(prisma.permission, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.permission, 'create').mockResolvedValue(mockPermission as any);

      const result = await service.useInviteLink({ link: 'valid', userId: 1 });

      expect(result).toBeDefined();
      expect(result.type).toBe('read');
      expect(prisma.permission.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 1,
            homeId: 1,
            type: 'read',
          }),
        }),
      );
    });
  });
});
