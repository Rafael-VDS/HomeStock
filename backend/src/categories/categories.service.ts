import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { CategoryEntity } from './entities/category.entity';
import { SubcategoryEntity } from './entities/subcategory.entity';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // ==================== CATEGORIES ====================

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
    // Vérifier si la maison existe
    const home = await this.prisma.home.findUnique({
      where: { id: createCategoryDto.homeId },
    });
    if (!home) {
      throw new NotFoundException(`Maison avec l'ID ${createCategoryDto.homeId} introuvable`);
    }

    const category = await this.prisma.category.create({
      data: createCategoryDto,
    });

    return new CategoryEntity(category);
  }

  async findCategoriesByHome(homeId: number): Promise<CategoryEntity[]> {
    // Vérifier si la maison existe
    const home = await this.prisma.home.findUnique({
      where: { id: homeId },
    });
    if (!home) {
      throw new NotFoundException(`Maison avec l'ID ${homeId} introuvable`);
    }

    const categories = await this.prisma.category.findMany({
      where: { homeId },
      include: {
        subcategories: true,
      },
      orderBy: { id: 'asc' },
    });

    return categories.map((category) => new CategoryEntity(category));
  }

  async findOneCategory(id: number): Promise<CategoryEntity> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Catégorie avec l'ID ${id} introuvable`);
    }

    return new CategoryEntity(category);
  }

  async updateCategory(id: number, updateCategoryDto: UpdateCategoryDto): Promise<CategoryEntity> {
    try {
      const category = await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
        include: {
          subcategories: true,
        },
      });
      return new CategoryEntity(category);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Catégorie avec l'ID ${id} introuvable`);
      }
      throw error;
    }
  }

  async removeCategory(id: number): Promise<{ message: string }> {
    try {
      await this.prisma.category.delete({
        where: { id },
      });
      return { message: `Catégorie avec l'ID ${id} supprimée avec succès` };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Catégorie avec l'ID ${id} introuvable`);
      }
      throw error;
    }
  }

  // ==================== SUBCATEGORIES ====================

  async createSubcategory(createSubcategoryDto: CreateSubcategoryDto): Promise<SubcategoryEntity> {
    // Vérifier si la catégorie existe
    const category = await this.prisma.category.findUnique({
      where: { id: createSubcategoryDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Catégorie avec l'ID ${createSubcategoryDto.categoryId} introuvable`);
    }

    const subcategory = await this.prisma.subcategory.create({
      data: createSubcategoryDto,
    });

    return new SubcategoryEntity(subcategory);
  }

  async findSubcategoriesByCategory(categoryId: number): Promise<SubcategoryEntity[]> {
    // Vérifier si la catégorie existe
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Catégorie avec l'ID ${categoryId} introuvable`);
    }

    const subcategories = await this.prisma.subcategory.findMany({
      where: { categoryId },
      orderBy: { id: 'asc' },
    });

    return subcategories.map((subcategory) => new SubcategoryEntity(subcategory));
  }

  async findOneSubcategory(id: number): Promise<SubcategoryEntity> {
    const subcategory = await this.prisma.subcategory.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!subcategory) {
      throw new NotFoundException(`Sous-catégorie avec l'ID ${id} introuvable`);
    }

    return new SubcategoryEntity(subcategory);
  }

  async updateSubcategory(id: number, updateSubcategoryDto: UpdateSubcategoryDto): Promise<SubcategoryEntity> {
    try {
      const subcategory = await this.prisma.subcategory.update({
        where: { id },
        data: updateSubcategoryDto,
      });
      return new SubcategoryEntity(subcategory);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Sous-catégorie avec l'ID ${id} introuvable`);
      }
      throw error;
    }
  }

  async removeSubcategory(id: number): Promise<{ message: string }> {
    try {
      await this.prisma.subcategory.delete({
        where: { id },
      });
      return { message: `Sous-catégorie avec l'ID ${id} supprimée avec succès` };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Sous-catégorie avec l'ID ${id} introuvable`);
      }
      throw error;
    }
  }
}
