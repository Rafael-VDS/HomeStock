import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Vérifier si l'email existe déjà
    const existingUser = await this.prisma.user.findFirst({
      where: { mail: createUserDto.mail },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        mail: true,
        picture: true,
        // On ne sélectionne PAS le password
      },
    });

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        firstname: true,
        lastname: true,
        mail: true,
        picture: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        mail: true,
        picture: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur #${id} introuvable`);
    }

    return user;
  }

  async findByEmail(mail: string) {
    const user = await this.prisma.user.findFirst({
      where: { mail },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        mail: true,
        picture: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'email ${mail} introuvable`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Vérifier que l'utilisateur existe
    await this.findOne(id);

    // Si on modifie l'email, vérifier qu'il n'existe pas déjà
    if (updateUserDto.mail) {
      const existingUser = await this.prisma.user.findFirst({
        where: { 
          mail: updateUserDto.mail,
          NOT: { id },
        },
      });

      if (existingUser) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
    }

    // Hasher le nouveau mot de passe si fourni
    const data: any = { ...updateUserDto };
    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        firstname: true,
        lastname: true,
        mail: true,
        picture: true,
      },
    });

    return user;
  }

  async remove(id: number) {
    // Vérifier que l'utilisateur existe
    await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: `Utilisateur #${id} supprimé avec succès` };
  }

  async getUserPermissions(id: number) {
    // Vérifier que l'utilisateur existe
    await this.findOne(id);

    const permissions = await this.prisma.permission.findMany({
      where: { userId: id },
      include: {
        home: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return permissions;
  }
}
