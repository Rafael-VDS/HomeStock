import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateInviteLinkDto } from './dto/create-invite-link.dto';
import { UseInviteLinkDto } from './dto/use-invite-link.dto';
import { InviteLinkEntity } from './entities/invite-link.entity';

@Injectable()
export class InviteLinksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Génère un code aléatoire de 25 caractères
   */
  private generateInviteCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 25; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * Crée un nouveau lien d'invitation pour un foyer
   */
  async create(createInviteLinkDto: CreateInviteLinkDto): Promise<InviteLinkEntity> {
    // Vérifier que le foyer existe
    const home = await this.prisma.home.findUnique({
      where: { id: createInviteLinkDto.homeId },
    });

    if (!home) {
      throw new NotFoundException(
        `Foyer avec l'ID ${createInviteLinkDto.homeId} introuvable`,
      );
    }

    // Générer un code unique
    let inviteCode = this.generateInviteCode();
    let isUnique = false;
    
    while (!isUnique) {
      const existingLink = await (this.prisma as any).inviteLink.findUnique({
        where: { link: inviteCode },
      });
      if (!existingLink) {
        isUnique = true;
      } else {
        inviteCode = this.generateInviteCode();
      }
    }

    // Créer le lien avec une expiration de 7 jours
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);

    const inviteLink = await (this.prisma as any).inviteLink.create({
      data: {
        homeId: createInviteLinkDto.homeId,
        link: inviteCode,
        permissionType: createInviteLinkDto.permissionType,
        expirationDate,
      },
    });

    return new InviteLinkEntity(inviteLink);
  }

  /**
   * Récupère tous les liens d'invitation actifs pour un foyer
   */
  async findByHome(homeId: number): Promise<InviteLinkEntity[]> {
    const now = new Date();
    const inviteLinks = await (this.prisma as any).inviteLink.findMany({
      where: {
        homeId,
        expirationDate: {
          gte: now,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return inviteLinks.map(link => new InviteLinkEntity(link));
  }

  /**
   * Utilise un lien d'invitation pour rejoindre un foyer
   */
  async useInviteLink(useInviteLinkDto: UseInviteLinkDto) {
    const { link, userId } = useInviteLinkDto;
    const now = new Date();

    // Trouver le lien d'invitation
    const inviteLink = await (this.prisma as any).inviteLink.findUnique({
      where: { link },
    });

    if (!inviteLink) {
      throw new NotFoundException('Lien d\'invitation invalide');
    }

    // Vérifier si le lien a expiré
    if (inviteLink.expirationDate < now) {
      throw new BadRequestException('Ce lien d\'invitation a expiré');
    }

    // Vérifier que l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} introuvable`);
    }

    // Vérifier si l'utilisateur n'est pas déjà membre du foyer
    const existingPermission = await this.prisma.permission.findUnique({
      where: {
        userId_homeId: {
          userId,
          homeId: inviteLink.homeId,
        },
      },
    });

    if (existingPermission) {
      throw new ConflictException('Vous êtes déjà membre de ce foyer');
    }

    // Créer la permission pour l'utilisateur
    const permission = await this.prisma.permission.create({
      data: {
        userId,
        homeId: inviteLink.homeId,
        type: inviteLink.permissionType,
      },
      include: {
        home: true,
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
    });

    return permission;
  }

  /**
   * Supprime un lien d'invitation
   */
  async remove(id: number): Promise<void> {
    const inviteLink = await (this.prisma as any).inviteLink.findUnique({
      where: { id },
    });

    if (!inviteLink) {
      throw new NotFoundException(`Lien d'invitation avec l'ID ${id} introuvable`);
    }

    await (this.prisma as any).inviteLink.delete({
      where: { id },
    });
  }

  /**
   * Nettoie tous les liens expirés
   */
  async cleanExpiredLinks(): Promise<number> {
    const now = new Date();
    const result = await (this.prisma as any).inviteLink.deleteMany({
      where: {
        expirationDate: {
          lt: now,
        },
      },
    });

    return result.count;
  }
}
