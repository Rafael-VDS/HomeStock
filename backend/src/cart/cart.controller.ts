import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
import { CartService } from './cart.service';
import { AddProductToCartDto } from './dto/add-product-to-cart.dto';
import { UpdateCartProductDto } from './dto/update-cart-product.dto';
import { CartResponseDto } from './dto/cart-response.dto';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':homeId')
  @ApiOperation({ summary: 'Récupérer le panier d\'une maison' })
  @ApiParam({ name: 'homeId', description: 'ID de la maison' })
  @ApiResponse({
    status: 200,
    description: 'Panier récupéré avec succès',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Maison non trouvée' })
  getCart(
    @Param('homeId', ParseIntPipe) homeId: number,
  ): Promise<CartResponseDto> {
    return this.cartService.getOrCreateCart(homeId);
  }

  @Post(':homeId/products')
  @ApiOperation({ summary: 'Ajouter un produit au panier' })
  @ApiParam({ name: 'homeId', description: 'ID de la maison' })
  @ApiResponse({
    status: 201,
    description: 'Produit ajouté au panier',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Produit ou maison non trouvé' })
  addProduct(
    @Param('homeId', ParseIntPipe) homeId: number,
    @Body() addProductDto: AddProductToCartDto,
  ): Promise<CartResponseDto> {
    return this.cartService.addProduct(homeId, addProductDto);
  }

  @Patch(':homeId/products/:cartProductId')
  @ApiOperation({ summary: 'Mettre à jour un produit du panier' })
  @ApiParam({ name: 'homeId', description: 'ID de la maison' })
  @ApiParam({ name: 'cartProductId', description: 'ID du produit dans le panier' })
  @ApiResponse({
    status: 200,
    description: 'Produit mis à jour',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Produit non trouvé dans le panier' })
  updateCartProduct(
    @Param('homeId', ParseIntPipe) homeId: number,
    @Param('cartProductId', ParseIntPipe) cartProductId: number,
    @Body() updateDto: UpdateCartProductDto,
  ): Promise<CartResponseDto> {
    return this.cartService.updateCartProduct(homeId, cartProductId, updateDto);
  }

  @Delete(':homeId/products/:cartProductId')
  @ApiOperation({ summary: 'Retirer un produit du panier' })
  @ApiParam({ name: 'homeId', description: 'ID de la maison' })
  @ApiParam({ name: 'cartProductId', description: 'ID du produit dans le panier' })
  @ApiResponse({
    status: 200,
    description: 'Produit retiré du panier',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Produit non trouvé dans le panier' })
  removeProduct(
    @Param('homeId', ParseIntPipe) homeId: number,
    @Param('cartProductId', ParseIntPipe) cartProductId: number,
  ): Promise<CartResponseDto> {
    return this.cartService.removeProduct(homeId, cartProductId);
  }

  @Delete(':homeId')
  @ApiOperation({ summary: 'Vider le panier' })
  @ApiParam({ name: 'homeId', description: 'ID de la maison' })
  @ApiQuery({
    name: 'onlyChecked',
    required: false,
    description: 'Supprimer uniquement les produits cochés',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Panier vidé',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Panier non trouvé' })
  clearCart(
    @Param('homeId', ParseIntPipe) homeId: number,
    @Query('onlyChecked') onlyChecked?: string,
  ): Promise<CartResponseDto> {
    return this.cartService.clearCart(homeId, onlyChecked === 'true');
  }
}
