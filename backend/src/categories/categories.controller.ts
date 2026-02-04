import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { CategoryEntity } from './entities/category.entity';
import { SubcategoryEntity } from './entities/subcategory.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // ==================== CATEGORIES ====================

  @Post('categories')
  @ApiOperation({ summary: 'Créer une catégorie' })
  @ApiResponse({
    status: 201,
    description: 'Catégorie créée avec succès',
    type: CategoryEntity,
  })
  @ApiResponse({ status: 404, description: 'Maison introuvable' })
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @Get('categories/home/:homeId')
  @ApiOperation({ summary: 'Récupérer les catégories d\'une maison' })
  @ApiParam({ name: 'homeId', description: 'ID de la maison' })
  @ApiResponse({
    status: 200,
    description: 'Liste des catégories avec sous-catégories',
    type: [CategoryEntity],
  })
  @ApiResponse({ status: 404, description: 'Maison introuvable' })
  findCategoriesByHome(@Param('homeId', ParseIntPipe) homeId: number) {
    return this.categoriesService.findCategoriesByHome(homeId);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Récupérer une catégorie par ID' })
  @ApiParam({ name: 'id', description: 'ID de la catégorie' })
  @ApiResponse({
    status: 200,
    description: 'Catégorie trouvée avec ses sous-catégories',
    type: CategoryEntity,
  })
  @ApiResponse({ status: 404, description: 'Catégorie introuvable' })
  findOneCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOneCategory(id);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Modifier une catégorie' })
  @ApiParam({ name: 'id', description: 'ID de la catégorie' })
  @ApiResponse({
    status: 200,
    description: 'Catégorie modifiée',
    type: CategoryEntity,
  })
  @ApiResponse({ status: 404, description: 'Catégorie introuvable' })
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, updateCategoryDto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une catégorie' })
  @ApiParam({ name: 'id', description: 'ID de la catégorie' })
  @ApiResponse({ status: 200, description: 'Catégorie supprimée' })
  @ApiResponse({ status: 404, description: 'Catégorie introuvable' })
  removeCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.removeCategory(id);
  }

  // ==================== SUBCATEGORIES ====================

  @Post('subcategories')
  @ApiOperation({ summary: 'Créer une sous-catégorie' })
  @ApiResponse({
    status: 201,
    description: 'Sous-catégorie créée avec succès',
    type: SubcategoryEntity,
  })
  @ApiResponse({ status: 404, description: 'Catégorie introuvable' })
  createSubcategory(@Body() createSubcategoryDto: CreateSubcategoryDto) {
    return this.categoriesService.createSubcategory(createSubcategoryDto);
  }

  @Get('subcategories/category/:categoryId')
  @ApiOperation({ summary: 'Récupérer les sous-catégories d\'une catégorie' })
  @ApiParam({ name: 'categoryId', description: 'ID de la catégorie' })
  @ApiResponse({
    status: 200,
    description: 'Liste des sous-catégories',
    type: [SubcategoryEntity],
  })
  @ApiResponse({ status: 404, description: 'Catégorie introuvable' })
  findSubcategoriesByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.categoriesService.findSubcategoriesByCategory(categoryId);
  }

  @Get('subcategories/:id')
  @ApiOperation({ summary: 'Récupérer une sous-catégorie par ID' })
  @ApiParam({ name: 'id', description: 'ID de la sous-catégorie' })
  @ApiResponse({
    status: 200,
    description: 'Sous-catégorie trouvée',
    type: SubcategoryEntity,
  })
  @ApiResponse({ status: 404, description: 'Sous-catégorie introuvable' })
  findOneSubcategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOneSubcategory(id);
  }

  @Patch('subcategories/:id')
  @ApiOperation({ summary: 'Modifier une sous-catégorie' })
  @ApiParam({ name: 'id', description: 'ID de la sous-catégorie' })
  @ApiResponse({
    status: 200,
    description: 'Sous-catégorie modifiée',
    type: SubcategoryEntity,
  })
  @ApiResponse({ status: 404, description: 'Sous-catégorie introuvable' })
  updateSubcategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubcategoryDto: UpdateSubcategoryDto,
  ) {
    return this.categoriesService.updateSubcategory(id, updateSubcategoryDto);
  }

  @Delete('subcategories/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une sous-catégorie' })
  @ApiParam({ name: 'id', description: 'ID de la sous-catégorie' })
  @ApiResponse({ status: 200, description: 'Sous-catégorie supprimée' })
  @ApiResponse({ status: 404, description: 'Sous-catégorie introuvable' })
  removeSubcategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.removeSubcategory(id);
  }
}
