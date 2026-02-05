import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CartService', () => {
  let service: CartService;
  let prisma: PrismaService;

  const mockPrismaService = {
    home: {
      findUnique: jest.fn(),
    },
    cart: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    cartProduct: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    product: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrCreateCart', () => {
    it('should return existing cart', async () => {
      const mockHome = { id: 1, name: 'Test Home' };
      const mockCart = {
        id: 1,
        homeId: 1,
        cartProducts: [
          {
            id: 1,
            productId: 1,
            quantity: 2,
            checked: false,
            product: {
              name: 'Product 1',
              picture: 'pic.jpg',
              subcategoryId: 1,
              subcategory: { name: 'Subcategory 1' },
            },
          },
        ],
      };

      mockPrismaService.home.findUnique.mockResolvedValue(mockHome);
      mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);

      const result = await service.getOrCreateCart(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.products).toHaveLength(1);
      expect(result.totalItems).toBe(2);
    });

    it('should create cart if not exists', async () => {
      const mockHome = { id: 1, name: 'Test Home' };
      const mockNewCart = {
        id: 1,
        homeId: 1,
        cartProducts: [],
      };

      mockPrismaService.home.findUnique.mockResolvedValue(mockHome);
      mockPrismaService.cart.findUnique.mockResolvedValue(null);
      mockPrismaService.cart.create.mockResolvedValue(mockNewCart);

      const result = await service.getOrCreateCart(1);

      expect(result).toBeDefined();
      expect(result.products).toHaveLength(0);
      expect(prisma.cart.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if home does not exist', async () => {
      mockPrismaService.home.findUnique.mockResolvedValue(null);

      await expect(service.getOrCreateCart(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addProduct', () => {
    it('should add product to cart', async () => {
      const mockProduct = { id: 1, homeId: 1, name: 'Product 1' };
      const mockCart = { id: 1, homeId: 1 };
      const mockCartAfter = {
        id: 1,
        homeId: 1,
        cartProducts: [
          {
            id: 1,
            productId: 1,
            quantity: 1,
            checked: false,
            product: {
              name: 'Product 1',
              picture: 'pic.jpg',
              subcategoryId: 1,
              subcategory: { name: 'Subcategory 1' },
            },
          },
        ],
      };

      mockPrismaService.product.findFirst.mockResolvedValue(mockProduct);
      mockPrismaService.cart.findUnique.mockResolvedValueOnce(mockCart);
      mockPrismaService.cartProduct.findUnique.mockResolvedValue(null);
      mockPrismaService.cartProduct.create.mockResolvedValue({});
      mockPrismaService.home.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.cart.findUnique.mockResolvedValueOnce(mockCartAfter);

      const result = await service.addProduct(1, { productId: 1 });

      expect(result).toBeDefined();
      expect(prisma.cartProduct.create).toHaveBeenCalled();
    });

    it('should increase quantity if product already in cart', async () => {
      const mockProduct = { id: 1, homeId: 1, name: 'Product 1' };
      const mockCart = { id: 1, homeId: 1 };
      const mockExistingCartProduct = {
        id: 1,
        cartId: 1,
        productId: 1,
        quantity: 2,
        checked: false,
      };
      const mockCartAfter = {
        id: 1,
        homeId: 1,
        cartProducts: [
          {
            id: 1,
            productId: 1,
            quantity: 3,
            checked: false,
            product: {
              name: 'Product 1',
              picture: 'pic.jpg',
              subcategoryId: 1,
              subcategory: { name: 'Subcategory 1' },
            },
          },
        ],
      };

      mockPrismaService.product.findFirst.mockResolvedValue(mockProduct);
      mockPrismaService.cart.findUnique.mockResolvedValueOnce(mockCart);
      mockPrismaService.cartProduct.findUnique.mockResolvedValue(
        mockExistingCartProduct,
      );
      mockPrismaService.cartProduct.update.mockResolvedValue({});
      mockPrismaService.home.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.cart.findUnique.mockResolvedValueOnce(mockCartAfter);

      const result = await service.addProduct(1, { productId: 1 });

      expect(result).toBeDefined();
      expect(prisma.cartProduct.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { quantity: 3 },
      });
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockPrismaService.product.findFirst.mockResolvedValue(null);

      await expect(
        service.addProduct(1, { productId: 999 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCartProduct', () => {
    it('should update cart product', async () => {
      const mockCart = { id: 1, homeId: 1 };
      const mockCartProduct = {
        id: 1,
        cartId: 1,
        productId: 1,
        quantity: 2,
        checked: false,
      };
      const mockCartAfter = {
        id: 1,
        homeId: 1,
        cartProducts: [],
      };

      mockPrismaService.cart.findUnique.mockResolvedValueOnce(mockCart);
      mockPrismaService.cartProduct.findFirst.mockResolvedValue(mockCartProduct);
      mockPrismaService.cartProduct.update.mockResolvedValue({});
      mockPrismaService.home.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.cart.findUnique.mockResolvedValueOnce(mockCartAfter);

      const result = await service.updateCartProduct(1, 1, { quantity: 5 });

      expect(result).toBeDefined();
      expect(prisma.cartProduct.update).toHaveBeenCalled();
    });
  });

  describe('removeProduct', () => {
    it('should remove product from cart', async () => {
      const mockCart = { id: 1, homeId: 1 };
      const mockCartProduct = {
        id: 1,
        cartId: 1,
        productId: 1,
        quantity: 2,
        checked: false,
      };
      const mockCartAfter = {
        id: 1,
        homeId: 1,
        cartProducts: [],
      };

      mockPrismaService.cart.findUnique.mockResolvedValueOnce(mockCart);
      mockPrismaService.cartProduct.findFirst.mockResolvedValue(mockCartProduct);
      mockPrismaService.cartProduct.delete.mockResolvedValue({});
      mockPrismaService.home.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.cart.findUnique.mockResolvedValueOnce(mockCartAfter);

      const result = await service.removeProduct(1, 1);

      expect(result).toBeDefined();
      expect(prisma.cartProduct.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('clearCart', () => {
    it('should clear entire cart', async () => {
      const mockCart = { id: 1, homeId: 1 };
      const mockCartAfter = {
        id: 1,
        homeId: 1,
        cartProducts: [],
      };

      mockPrismaService.cart.findUnique.mockResolvedValueOnce(mockCart);
      mockPrismaService.cartProduct.deleteMany.mockResolvedValue({ count: 5 });
      mockPrismaService.home.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.cart.findUnique.mockResolvedValueOnce(mockCartAfter);

      const result = await service.clearCart(1, false);

      expect(result).toBeDefined();
      expect(prisma.cartProduct.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 1 },
      });
    });

    it('should clear only checked items', async () => {
      const mockCart = { id: 1, homeId: 1 };
      const mockCartAfter = {
        id: 1,
        homeId: 1,
        cartProducts: [],
      };

      mockPrismaService.cart.findUnique.mockResolvedValueOnce(mockCart);
      mockPrismaService.cartProduct.deleteMany.mockResolvedValue({ count: 3 });
      mockPrismaService.home.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.cart.findUnique.mockResolvedValueOnce(mockCartAfter);

      const result = await service.clearCart(1, true);

      expect(result).toBeDefined();
      expect(prisma.cartProduct.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 1, checked: true },
      });
    });
  });
});
