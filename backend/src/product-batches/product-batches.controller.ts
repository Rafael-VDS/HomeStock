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
  ApiBody,
} from '@nestjs/swagger';
import { ProductBatchesService } from './product-batches.service';
import { CreateProductBatchDto } from './dto/create-product-batch.dto';
import { UpdateProductBatchDto } from './dto/update-product-batch.dto';
import { ProductBatchResponseDto } from './dto/product-batch-response.dto';

@ApiTags('product-batches')
@Controller('product-batches')
export class ProductBatchesController {
  constructor(
    private readonly productBatchesService: ProductBatchesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau batch (ajouter une unité)' })
  @ApiResponse({
    status: 201,
    description: 'Le batch a été créé avec succès',
    type: ProductBatchResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Produit ou maison non trouvé' })
  create(
    @Body() createProductBatchDto: CreateProductBatchDto,
  ): Promise<ProductBatchResponseDto> {
    return this.productBatchesService.create(createProductBatchDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Créer plusieurs batches à la fois (achat)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productId: { type: 'number', example: 1 },
        homeId: { type: 'number', example: 1 },
        quantity: { type: 'number', example: 3 },
        expirationDate: { type: 'string', example: '2026-12-31' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Les batches ont été créés',
    type: [ProductBatchResponseDto],
  })
  createMany(
    @Body()
    data: {
      productId: number;
      homeId: number;
      quantity: number;
      expirationDate?: string;
    },
  ): Promise<ProductBatchResponseDto[]> {
    return this.productBatchesService.createMany(
      data.productId,
      data.homeId,
      data.quantity,
      data.expirationDate,
    );
  }

  @Post('consume')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Consommer des unités (FEFO - First Expired First Out)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productId: { type: 'number', example: 1 },
        homeId: { type: 'number', example: 1 },
        quantity: { type: 'number', example: 2 },
      },
    },
  })
  @ApiResponse({
    status: 204,
    description: 'Les unités ont été consommées',
  })
  @ApiResponse({ status: 400, description: 'Stock insuffisant' })
  consume(
    @Body() data: { productId: number; homeId: number; quantity: number },
  ): Promise<void> {
    return this.productBatchesService.consume(
      data.productId,
      data.homeId,
      data.quantity,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les batches' })
  @ApiQuery({
    name: 'homeId',
    required: false,
    description: 'Filtrer par ID de maison',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des batches',
    type: [ProductBatchResponseDto],
  })
  findAll(
    @Query('homeId') homeId?: string,
  ): Promise<ProductBatchResponseDto[]> {
    return this.productBatchesService.findAll(
      homeId ? parseInt(homeId, 10) : undefined,
    );
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Récupérer tous les batches d\'un produit' })
  @ApiParam({ name: 'productId', description: 'ID du produit' })
  @ApiResponse({
    status: 200,
    description: 'Liste des batches du produit',
    type: [ProductBatchResponseDto],
  })
  findByProduct(
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<ProductBatchResponseDto[]> {
    return this.productBatchesService.findByProduct(productId);
  }

  @Get('expired/:homeId')
  @ApiOperation({ summary: 'Récupérer les produits expirés' })
  @ApiParam({ name: 'homeId', description: 'ID de la maison' })
  @ApiResponse({
    status: 200,
    description: 'Liste des produits expirés',
    type: [ProductBatchResponseDto],
  })
  findExpired(
    @Param('homeId', ParseIntPipe) homeId: number,
  ): Promise<ProductBatchResponseDto[]> {
    return this.productBatchesService.findExpired(homeId);
  }

  @Get('expiring-soon/:homeId')
  @ApiOperation({
    summary: 'Récupérer les produits qui expirent bientôt (< 7 jours)',
  })
  @ApiParam({ name: 'homeId', description: 'ID de la maison' })
  @ApiResponse({
    status: 200,
    description: 'Liste des produits qui expirent bientôt',
    type: [ProductBatchResponseDto],
  })
  findExpiringSoon(
    @Param('homeId', ParseIntPipe) homeId: number,
  ): Promise<ProductBatchResponseDto[]> {
    return this.productBatchesService.findExpiringSoon(homeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un batch par son ID' })
  @ApiParam({ name: 'id', description: 'ID du batch' })
  @ApiResponse({
    status: 200,
    description: 'Le batch demandé',
    type: ProductBatchResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Batch non trouvé' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProductBatchResponseDto> {
    return this.productBatchesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un batch' })
  @ApiParam({ name: 'id', description: 'ID du batch' })
  @ApiResponse({
    status: 200,
    description: 'Le batch a été mis à jour',
    type: ProductBatchResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Batch non trouvé' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductBatchDto: UpdateProductBatchDto,
  ): Promise<ProductBatchResponseDto> {
    return this.productBatchesService.update(id, updateProductBatchDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un batch (consommer une unité)' })
  @ApiParam({ name: 'id', description: 'ID du batch' })
  @ApiResponse({ status: 204, description: 'Le batch a été supprimé' })
  @ApiResponse({ status: 404, description: 'Batch non trouvé' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.productBatchesService.remove(id);
  }
}
