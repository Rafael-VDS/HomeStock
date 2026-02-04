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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau produit' })
  @ApiResponse({ status: 201, description: 'Produit créé avec succès', type: ProductEntity })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les produits' })
  @ApiResponse({ status: 200, description: 'Liste des produits', type: [ProductEntity] })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un produit par son ID' })
  @ApiParam({ name: 'id', description: 'ID du produit' })
  @ApiResponse({ status: 200, description: 'Produit trouvé', type: ProductEntity })
  @ApiResponse({ status: 404, description: 'Produit non trouvé' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Get('home/:homeId')
  @ApiOperation({ summary: 'Récupérer tous les produits d\'une maison' })
  @ApiParam({ name: 'homeId', description: 'ID de la maison' })
  @ApiResponse({ status: 200, description: 'Liste des produits de la maison', type: [ProductEntity] })
  findByHome(@Param('homeId', ParseIntPipe) homeId: number) {
    return this.productsService.findByHome(homeId);
  }

  @Get(':id/stock')
  @ApiOperation({ summary: 'Récupérer le stock d\'un produit' })
  @ApiParam({ name: 'id', description: 'ID du produit' })
  @ApiResponse({ status: 200, description: 'Stock du produit' })
  @ApiResponse({ status: 404, description: 'Produit non trouvé' })
  getStock(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getStock(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un produit' })
  @ApiParam({ name: 'id', description: 'ID du produit' })
  @ApiResponse({ status: 200, description: 'Produit mis à jour', type: ProductEntity })
  @ApiResponse({ status: 404, description: 'Produit non trouvé' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un produit' })
  @ApiParam({ name: 'id', description: 'ID du produit' })
  @ApiResponse({ status: 204, description: 'Produit supprimé' })
  @ApiResponse({ status: 404, description: 'Produit non trouvé' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
