import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AddProductToCartDto } from './dto/add-product-to-cart.dto';
import { UpdateCartProductDto } from './dto/update-cart-product.dto';
import { CartResponseDto, CartProductResponseDto } from './dto/cart-response.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupérer ou créer le panier d'une maison
   */
  async getOrCreateCart(homeId: number): Promise<CartResponseDto> {
    // Vérifier que la maison existe
    const home = await this.prisma.home.findUnique({
      where: { id: homeId },
    });

    if (!home) {
      throw new NotFoundException(`Maison avec l'ID ${homeId} non trouvée`);
    }

    // Récupérer ou créer le panier
    let cart = await this.prisma.cart.findUnique({
      where: { homeId },
      include: {
        cartProducts: {
          include: {
            product: {
              include: {
                subcategory: true,
              },
            },
          },
          orderBy: {
            id: 'asc',
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { homeId },
        include: {
          cartProducts: {
            include: {
              product: {
                include: {
                  subcategory: true,
                },
              },
            },
          },
        },
      });
    }

    return this.formatCartResponse(cart);
  }

  /**
   * Ajouter un produit au panier
   */
  async addProduct(
    homeId: number,
    addProductDto: AddProductToCartDto,
  ): Promise<CartResponseDto> {
    // Vérifier que le produit existe et appartient à cette maison
    const product = await this.prisma.product.findFirst({
      where: {
        id: addProductDto.productId,
        homeId,
      },
    });

    if (!product) {
      throw new NotFoundException(
        `Produit avec l'ID ${addProductDto.productId} non trouvé dans cette maison`,
      );
    }

    // Récupérer ou créer le panier
    let cart = await this.prisma.cart.findUnique({
      where: { homeId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { homeId },
      });
    }

    // Vérifier si le produit est déjà dans le panier
    const existingCartProduct = await this.prisma.cartProduct.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: addProductDto.productId,
        },
      },
    });

    if (existingCartProduct) {
      // Augmenter la quantité
      await this.prisma.cartProduct.update({
        where: { id: existingCartProduct.id },
        data: {
          quantity: existingCartProduct.quantity + (addProductDto.quantity || 1),
        },
      });
    } else {
      // Ajouter le produit au panier
      await this.prisma.cartProduct.create({
        data: {
          cartId: cart.id,
          productId: addProductDto.productId,
          quantity: addProductDto.quantity || 1,
        },
      });
    }

    return this.getOrCreateCart(homeId);
  }

  /**
   * Mettre à jour un produit du panier
   */
  async updateCartProduct(
    homeId: number,
    cartProductId: number,
    updateDto: UpdateCartProductDto,
  ): Promise<CartResponseDto> {
    // Récupérer le panier
    const cart = await this.prisma.cart.findUnique({
      where: { homeId },
    });

    if (!cart) {
      throw new NotFoundException(`Panier non trouvé pour cette maison`);
    }

    // Vérifier que le produit est dans le panier
    const cartProduct = await this.prisma.cartProduct.findFirst({
      where: {
        id: cartProductId,
        cartId: cart.id,
      },
    });

    if (!cartProduct) {
      throw new NotFoundException(`Produit non trouvé dans le panier`);
    }

    // Mettre à jour le produit
    await this.prisma.cartProduct.update({
      where: { id: cartProductId },
      data: updateDto,
    });

    return this.getOrCreateCart(homeId);
  }

  /**
   * Retirer un produit du panier
   */
  async removeProduct(
    homeId: number,
    cartProductId: number,
  ): Promise<CartResponseDto> {
    // Récupérer le panier
    const cart = await this.prisma.cart.findUnique({
      where: { homeId },
    });

    if (!cart) {
      throw new NotFoundException(`Panier non trouvé pour cette maison`);
    }

    // Vérifier que le produit est dans le panier
    const cartProduct = await this.prisma.cartProduct.findFirst({
      where: {
        id: cartProductId,
        cartId: cart.id,
      },
    });

    if (!cartProduct) {
      throw new NotFoundException(`Produit non trouvé dans le panier`);
    }

    // Supprimer le produit du panier
    await this.prisma.cartProduct.delete({
      where: { id: cartProductId },
    });

    return this.getOrCreateCart(homeId);
  }

  /**
   * Vider le panier (ou seulement les produits cochés)
   */
  async clearCart(homeId: number, onlyChecked = false): Promise<CartResponseDto> {
    // Récupérer le panier
    const cart = await this.prisma.cart.findUnique({
      where: { homeId },
    });

    if (!cart) {
      throw new NotFoundException(`Panier non trouvé pour cette maison`);
    }

    // Supprimer les produits
    await this.prisma.cartProduct.deleteMany({
      where: {
        cartId: cart.id,
        ...(onlyChecked ? { checked: true } : {}),
      },
    });

    return this.getOrCreateCart(homeId);
  }

  /**
   * Formater la réponse du panier
   */
  private formatCartResponse(cart: any): CartResponseDto {
    const products: CartProductResponseDto[] = cart.cartProducts.map((cp: any) => ({
      id: cp.id,
      productId: cp.productId,
      productName: cp.product.name,
      productPicture: cp.product.picture,
      quantity: cp.quantity,
      checked: cp.checked,
      subcategoryId: cp.product.subcategoryId,
      subcategoryName: cp.product.subcategory.name,
    }));

    return {
      id: cart.id,
      homeId: cart.homeId,
      products,
      totalItems: products.reduce((sum, p) => sum + p.quantity, 0),
      uncheckedItems: products
        .filter(p => !p.checked)
        .reduce((sum, p) => sum + p.quantity, 0),
    };
  }
}
