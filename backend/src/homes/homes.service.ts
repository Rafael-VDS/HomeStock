import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { HomeEntity } from './entities/home.entity';

@Injectable()
export class HomesService {
  constructor(private prisma: PrismaService) {}

  async create(createHomeDto: CreateHomeDto): Promise<HomeEntity> {
    // Vérifier que l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: createHomeDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `Utilisateur avec l'ID ${createHomeDto.userId} introuvable`,
      );
    }

    // Créer la maison avec la permission "owner" automatiquement
    const home = await this.prisma.home.create({
      data: {
        name: createHomeDto.name,
        permissions: {
          create: {
            userId: createHomeDto.userId,
            type: 'owner',
          },
        },
      },
      include: {
        permissions: {
          include: {
            user: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                mail: true,
              },
            },
          },
        },
      },
    });
    return new HomeEntity(home);
  }

  async findAll(): Promise<HomeEntity[]> {
    const homes = await this.prisma.home.findMany({
      orderBy: { id: 'asc' },
    });
    return homes.map((home) => new HomeEntity(home));
  }

  async findOne(id: number): Promise<HomeEntity> {
    const home = await this.prisma.home.findUnique({
      where: { id },
    });

    if (!home) {
      throw new NotFoundException(`Maison avec l'ID ${id} introuvable`);
    }

    return new HomeEntity(home);
  }

  async update(id: number, updateHomeDto: UpdateHomeDto): Promise<HomeEntity> {
    try {
      const home = await this.prisma.home.update({
        where: { id },
        data: updateHomeDto,
      });
      return new HomeEntity(home);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Maison avec l'ID ${id} introuvable`);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      await this.prisma.home.delete({
        where: { id },
      });
      return { message: `Maison avec l'ID ${id} supprimée avec succès` };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Maison avec l'ID ${id} introuvable`);
      }
      throw error;
    }
  }

  async getHomeUsers(id: number) {
    const home = await this.prisma.home.findUnique({
      where: { id },
      include: {
        permissions: {
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
        },
      },
    });

    if (!home) {
      throw new NotFoundException(`Maison avec l'ID ${id} introuvable`);
    }

    return home.permissions.map((permission) => ({
      ...permission.user,
      permissionType: permission.type,
      permissionId: permission.id,
    }));
  }

  async getHomeCategories(id: number) {
    const home = await this.prisma.home.findUnique({
      where: { id },
      include: {
        categories: true,
      },
    });

    if (!home) {
      throw new NotFoundException(`Maison avec l'ID ${id} introuvable`);
    }

    return home.categories;
  }

  async getHomeProducts(id: number) {
    const home = await this.prisma.home.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            subcategory: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!home) {
      throw new NotFoundException(`Maison avec l'ID ${id} introuvable`);
    }

    return home.products;
  }
}
