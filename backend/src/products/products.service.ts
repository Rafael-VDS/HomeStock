import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        home: true,
        subcategoriesProducts: {
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
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        home: true,
        subcategoriesProducts: {
          include: {
            subcategory: {
              include: {
                category: true,
              },
            },
          },
        },
        productBatches: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id); // Vérifie que le produit existe

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Vérifie que le produit existe

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async findByHome(homeId: number) {
    return this.prisma.product.findMany({
      where: { homeId },
      include: {
        subcategoriesProducts: {
          include: {
            subcategory: {
              include: {
                category: true,
              },
            },
          },
        },
        productBatches: true,
      },
    });
  }

  async getStock(productId: number) {
    const batches = await this.prisma.productBatch.findMany({
      where: { productId },
      orderBy: {
        expirationDate: 'asc', // FEFO: First Expired, First Out
      },
    });

    return {
      productId,
      totalQuantity: batches.length,
      batches,
    };
  }
}
