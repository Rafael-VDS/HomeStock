import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer un nouveau produit
   */
  async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    // Vérifier que la maison existe
    const home = await this.prisma.home.findUnique({
      where: { id: createProductDto.homeId },
    });

    if (!home) {
      throw new NotFoundException(
        `Maison avec l'ID ${createProductDto.homeId} non trouvée`,
      );
    }

    // Vérifier que la sous-catégorie existe
    const subcategory = await this.prisma.subcategory.findUnique({
      where: { id: createProductDto.subcategoryId },
      include: { category: true },
    });

    if (!subcategory) {
      throw new NotFoundException(
        `Sous-catégorie avec l'ID ${createProductDto.subcategoryId} non trouvée`,
      );
    }

    // Créer le produit
    const product = await this.prisma.product.create({
      data: {
        homeId: createProductDto.homeId,
        subcategoryId: createProductDto.subcategoryId,
        name: createProductDto.name,
        picture: createProductDto.picture,
        mass: createProductDto.mass,
        liquid: createProductDto.liquid,
      },
      include: {
        subcategory: {
          include: {
            category: true,
          },
        },
        productBatches: true,
      },
    });

    return this.formatProductResponse(product);
  }

  /**
   * Récupérer tous les produits d'une maison
   */
  async findAll(homeId?: number): Promise<ProductResponseDto[]> {
    const products = await this.prisma.product.findMany({
      where: homeId ? { homeId } : undefined,
      include: {
        subcategory: {
          include: {
            category: true,
          },
        },
        productBatches: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return products.map((product) => this.formatProductResponse(product));
  }

  /**
   * Récupérer un produit par son ID
   */
  async findOne(id: number): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        subcategory: {
          include: {
            category: true,
          },
        },
        productBatches: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Produit avec l'ID ${id} non trouvé`);
    }

    return this.formatProductResponse(product);
  }

  /**
   * Récupérer les produits par sous-catégorie
   */
  async findBySubcategory(subcategoryId: number): Promise<ProductResponseDto[]> {
    const products = await this.prisma.product.findMany({
      where: {
        subcategoryId,
      },
      include: {
        subcategory: {
          include: {
            category: true,
          },
        },
        productBatches: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return products.map((product) => this.formatProductResponse(product));
  }

  /**
   * Récupérer les produits qui doivent être achetés (stock < 2)
   */
  async findProductsToBuy(homeId: number): Promise<ProductResponseDto[]> {
    const products = await this.findAll(homeId);
    return products.filter((product) => product.needsToBuy);
  }

  /**
   * Mettre à jour un produit
   */
  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    // Vérifier que le produit existe
    await this.findOne(id);

    // Si subcategoryId est fourni, vérifier qu'elle existe
    if (updateProductDto.subcategoryId) {
      const subcategory = await this.prisma.subcategory.findUnique({
        where: { id: updateProductDto.subcategoryId },
      });

      if (!subcategory) {
        throw new NotFoundException(
          `Sous-catégorie avec l'ID ${updateProductDto.subcategoryId} non trouvée`,
        );
      }
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        subcategory: {
          include: {
            category: true,
          },
        },
        productBatches: true,
      },
    });

    return this.formatProductResponse(product);
  }

  /**
   * Supprimer un produit
   */
  async remove(id: number): Promise<void> {
    // Vérifier que le produit existe
    await this.findOne(id);

    // Vérifier qu'il n'y a pas de batches (stock) associés
    const batchCount = await this.prisma.productBatch.count({
      where: { productId: id },
    });

    if (batchCount > 0) {
      throw new BadRequestException(
        `Impossible de supprimer le produit : ${batchCount} unité(s) en stock`,
      );
    }

    // Vérifier qu'il n'est pas dans le panier
    const cartCount = await this.prisma.cartProduct.count({
      where: { productId: id },
    });

    if (cartCount > 0) {
      throw new BadRequestException(
        'Impossible de supprimer le produit : présent dans le panier',
      );
    }

    // Supprimer le produit
    await this.prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Formater la réponse du produit avec stock et sous-catégorie
   */
  private formatProductResponse(product: any): ProductResponseDto {
    const stockCount = product.productBatches?.length || 0;
    const needsToBuy = stockCount < 2;

    return {
      id: product.id,
      homeId: product.homeId,
      subcategoryId: product.subcategoryId,
      name: product.name,
      picture: product.picture,
      mass: product.mass,
      liquid: product.liquid,
      stockCount,
      needsToBuy,
      subcategory: {
        id: product.subcategory.id,
        name: product.subcategory.name,
        categoryId: product.subcategory.categoryId,
        categoryName: product.subcategory.category.name,
      },
    };
  }
}