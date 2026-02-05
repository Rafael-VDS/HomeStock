import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductBatchDto } from './dto/create-product-batch.dto';
import { UpdateProductBatchDto } from './dto/update-product-batch.dto';
import { ProductBatchResponseDto } from './dto/product-batch-response.dto';

@Injectable()
export class ProductBatchesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer un nouveau batch (ajouter une unité en stock)
   */
  async create(
    createProductBatchDto: CreateProductBatchDto,
  ): Promise<ProductBatchResponseDto> {
    // Vérifier que le produit existe
    const product = await this.prisma.product.findUnique({
      where: { id: createProductBatchDto.productId },
    });

    if (!product) {
      throw new NotFoundException(
        `Produit avec l'ID ${createProductBatchDto.productId} non trouvé`,
      );
    }

    // Vérifier que la maison existe
    const home = await this.prisma.home.findUnique({
      where: { id: createProductBatchDto.homeId },
    });

    if (!home) {
      throw new NotFoundException(
        `Maison avec l'ID ${createProductBatchDto.homeId} non trouvée`,
      );
    }

    // Créer le batch
    const batch = await this.prisma.productBatch.create({
      data: {
        productId: createProductBatchDto.productId,
        homeId: createProductBatchDto.homeId,
        expirationDate: createProductBatchDto.expirationDate
          ? new Date(createProductBatchDto.expirationDate)
          : null,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
      },
    });

    return this.formatBatchResponse(batch);
  }

  /**
   * Créer plusieurs batches à la fois (achat multiple)
   */
  async createMany(
    productId: number,
    homeId: number,
    quantity: number,
    expirationDate?: string,
  ): Promise<ProductBatchResponseDto[]> {
    // Vérifier que le produit existe
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Produit avec l'ID ${productId} non trouvé`);
    }

    if (quantity < 1) {
      throw new BadRequestException('La quantité doit être au moins 1');
    }

    // Créer plusieurs batches
    const batches = await Promise.all(
      Array.from({ length: quantity }).map(() =>
        this.prisma.productBatch.create({
          data: {
            productId,
            homeId,
            expirationDate: expirationDate ? new Date(expirationDate) : null,
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                picture: true,
              },
            },
          },
        }),
      ),
    );

    return batches.map((batch) => this.formatBatchResponse(batch));
  }

  /**
   * Récupérer tous les batches
   */
  async findAll(homeId?: number): Promise<ProductBatchResponseDto[]> {
    const batches = await this.prisma.productBatch.findMany({
      where: homeId ? { homeId } : undefined,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
      },
      orderBy: [
        { expirationDate: 'asc' }, // FEFO: First Expired First Out
        { id: 'asc' },
      ],
    });

    return batches.map((batch) => this.formatBatchResponse(batch));
  }

  /**
   * Récupérer tous les batches d'un produit
   */
  async findByProduct(productId: number): Promise<ProductBatchResponseDto[]> {
    const batches = await this.prisma.productBatch.findMany({
      where: { productId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
      },
      orderBy: [
        { expirationDate: 'asc' },
        { id: 'asc' },
      ],
    });

    return batches.map((batch) => this.formatBatchResponse(batch));
  }

  /**
   * Récupérer un batch par son ID
   */
  async findOne(id: number): Promise<ProductBatchResponseDto> {
    const batch = await this.prisma.productBatch.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException(`Batch avec l'ID ${id} non trouvé`);
    }

    return this.formatBatchResponse(batch);
  }

  /**
   * Récupérer les produits expirés
   */
  async findExpired(homeId: number): Promise<ProductBatchResponseDto[]> {
    const now = new Date();
    const batches = await this.prisma.productBatch.findMany({
      where: {
        homeId,
        expirationDate: {
          lt: now,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
      },
      orderBy: {
        expirationDate: 'asc',
      },
    });

    return batches.map((batch) => this.formatBatchResponse(batch));
  }

  /**
   * Récupérer les produits qui expirent bientôt (< 7 jours)
   */
  async findExpiringSoon(homeId: number): Promise<ProductBatchResponseDto[]> {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const batches = await this.prisma.productBatch.findMany({
      where: {
        homeId,
        expirationDate: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
      },
      orderBy: {
        expirationDate: 'asc',
      },
    });

    return batches.map((batch) => this.formatBatchResponse(batch));
  }

  /**
   * Mettre à jour un batch
   */
  async update(
    id: number,
    updateProductBatchDto: UpdateProductBatchDto,
  ): Promise<ProductBatchResponseDto> {
    // Vérifier que le batch existe
    await this.findOne(id);

    const batch = await this.prisma.productBatch.update({
      where: { id },
      data: {
        expirationDate: updateProductBatchDto.expirationDate
          ? new Date(updateProductBatchDto.expirationDate)
          : undefined,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
      },
    });

    return this.formatBatchResponse(batch);
  }

  /**
   * Supprimer un batch (consommer une unité)
   */
  async remove(id: number): Promise<void> {
    // Vérifier que le batch existe
    await this.findOne(id);

    await this.prisma.productBatch.delete({
      where: { id },
    });
  }

  /**
   * Consommer des unités d'un produit (FEFO - First Expired First Out)
   * @param productId ID du produit
   * @param homeId ID de la maison
   * @param quantity Nombre d'unités à consommer
   */
  async consume(
    productId: number,
    homeId: number,
    quantity: number,
  ): Promise<void> {
    if (quantity < 1) {
      throw new BadRequestException('La quantité doit être au moins 1');
    }

    // Récupérer les batches par ordre FEFO
    const batches = await this.prisma.productBatch.findMany({
      where: { productId, homeId },
      orderBy: [
        { expirationDate: 'asc' },
        { id: 'asc' },
      ],
      take: quantity,
    });

    if (batches.length < quantity) {
      throw new BadRequestException(
        `Stock insuffisant. Disponible: ${batches.length}, demandé: ${quantity}`,
      );
    }

    // Supprimer les batches consommés
    await this.prisma.productBatch.deleteMany({
      where: {
        id: {
          in: batches.map((b) => b.id),
        },
      },
    });
  }

  /**
   * Formater la réponse du batch avec informations calculées
   */
  private formatBatchResponse(batch: any): ProductBatchResponseDto {
    const now = new Date();
    let daysUntilExpiration: number | null = null;
    let isExpired = false;
    let expiringSoon = false;

    if (batch.expirationDate) {
      const expirationDate = new Date(batch.expirationDate);
      const diffTime = expirationDate.getTime() - now.getTime();
      daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      isExpired = daysUntilExpiration < 0;
      expiringSoon = daysUntilExpiration >= 0 && daysUntilExpiration <= 7;
    }

    return {
      id: batch.id,
      productId: batch.productId,
      homeId: batch.homeId,
      expirationDate: batch.expirationDate
        ? batch.expirationDate.toISOString().split('T')[0]
        : null,
      product: batch.product,
      daysUntilExpiration,
      isExpired,
      expiringSoon,
    };
  }
}
