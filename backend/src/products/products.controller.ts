import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau produit' })
  @ApiResponse({
    status: 201,
    description: 'Le produit a été créé avec succès',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Maison non trouvée' })
  create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les produits' })
  @ApiQuery({
    name: 'homeId',
    required: false,
    description: 'Filtrer par ID de maison',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des produits',
    type: [ProductResponseDto],
  })
  findAll(
    @Query('homeId') homeId?: string,
  ): Promise<ProductResponseDto[]> {
    return this.productsService.findAll(
      homeId ? parseInt(homeId, 10) : undefined,
    );
  }

  @Get('to-buy/:homeId')
  @ApiOperation({
    summary: 'Récupérer les produits à acheter (stock < 2)',
  })
  @ApiParam({ name: 'homeId', description: 'ID de la maison' })
  @ApiResponse({
    status: 200,
    description: 'Liste des produits à acheter',
    type: [ProductResponseDto],
  })
  findProductsToBuy(
    @Param('homeId', ParseIntPipe) homeId: number,
  ): Promise<ProductResponseDto[]> {
    return this.productsService.findProductsToBuy(homeId);
  }

  @Get('subcategory/:subcategoryId')
  @ApiOperation({ summary: 'Récupérer les produits par sous-catégorie' })
  @ApiParam({ name: 'subcategoryId', description: 'ID de la sous-catégorie' })
  @ApiResponse({
    status: 200,
    description: 'Liste des produits de la sous-catégorie',
    type: [ProductResponseDto],
  })
  findBySubcategory(
    @Param('subcategoryId', ParseIntPipe) subcategoryId: number,
  ): Promise<ProductResponseDto[]> {
    return this.productsService.findBySubcategory(subcategoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un produit par son ID' })
  @ApiParam({ name: 'id', description: 'ID du produit' })
  @ApiResponse({
    status: 200,
    description: 'Le produit demandé',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Produit non trouvé' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un produit' })
  @ApiParam({ name: 'id', description: 'ID du produit' })
  @ApiResponse({
    status: 200,
    description: 'Le produit a été mis à jour',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Produit non trouvé' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un produit' })
  @ApiParam({ name: 'id', description: 'ID du produit' })
  @ApiResponse({ status: 204, description: 'Le produit a été supprimé' })
  @ApiResponse({ status: 404, description: 'Produit non trouvé' })
  @ApiResponse({
    status: 400,
    description: 'Impossible de supprimer (stock ou panier existant)',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.productsService.remove(id);
  }
}
