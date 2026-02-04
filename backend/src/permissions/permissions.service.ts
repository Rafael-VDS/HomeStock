import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionEntity } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<PermissionEntity> {
    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: createPermissionDto.userId },
    });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${createPermissionDto.userId} introuvable`);
    }

    // Vérifier si la maison existe
    const home = await this.prisma.home.findUnique({
      where: { id: createPermissionDto.homeId },
    });
    if (!home) {
      throw new NotFoundException(`Maison avec l'ID ${createPermissionDto.homeId} introuvable`);
    }

    // Vérifier si la permission existe déjà
    const existingPermission = await this.prisma.permission.findFirst({
      where: {
        userId: createPermissionDto.userId,
        homeId: createPermissionDto.homeId,
      },
    });

    if (existingPermission) {
      throw new ConflictException(
        `L'utilisateur ${createPermissionDto.userId} a déjà une permission pour la maison ${createPermissionDto.homeId}`,
      );
    }

    const permission = await this.prisma.permission.create({
      data: createPermissionDto,
    });

    return new PermissionEntity(permission);
  }

  async findByHome(homeId: number): Promise<PermissionEntity[]> {
    // Vérifier si la maison existe
    const home = await this.prisma.home.findUnique({
      where: { id: homeId },
    });
    if (!home) {
      throw new NotFoundException(`Maison avec l'ID ${homeId} introuvable`);
    }

    const permissions = await this.prisma.permission.findMany({
      where: { homeId },
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

    return permissions.map((permission) => new PermissionEntity(permission));
  }

  async findByUser(userId: number): Promise<PermissionEntity[]> {
    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} introuvable`);
    }

    const permissions = await this.prisma.permission.findMany({
      where: { userId },
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

    return permissions.map((permission) => new PermissionEntity(permission));
  }

  async findOne(id: number): Promise<PermissionEntity> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
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
        home: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!permission) {
      throw new NotFoundException(`Permission avec l'ID ${id} introuvable`);
    }

    return new PermissionEntity(permission);
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<PermissionEntity> {
    try {
      const permission = await this.prisma.permission.update({
        where: { id },
        data: updatePermissionDto,
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
          home: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return new PermissionEntity(permission);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Permission avec l'ID ${id} introuvable`);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      await this.prisma.permission.delete({
        where: { id },
      });
      return { message: `Permission avec l'ID ${id} supprimée avec succès` };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Permission avec l'ID ${id} introuvable`);
      }
      throw error;
    }
  }
}
