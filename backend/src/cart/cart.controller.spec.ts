import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

describe('CartController', () => {
  let controller: CartController;
  let service: CartService;

  const mockCartService = {
    getOrCreateCart: jest.fn(),
    addProduct: jest.fn(),
    updateCartProduct: jest.fn(),
    removeProduct: jest.fn(),
    clearCart: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCart', () => {
    it('should return cart', async () => {
      const expectedResult = {
        id: 1,
        homeId: 1,
        products: [],
        totalItems: 0,
        uncheckedItems: 0,
      };

      mockCartService.getOrCreateCart.mockResolvedValue(expectedResult);

      const result = await controller.getCart(1);

      expect(result).toEqual(expectedResult);
      expect(service.getOrCreateCart).toHaveBeenCalledWith(1);
    });
  });

  describe('addProduct', () => {
    it('should add product to cart', async () => {
      const addDto = { productId: 1, quantity: 2 };
      const expectedResult = {
        id: 1,
        homeId: 1,
        products: [
          {
            id: 1,
            productId: 1,
            productName: 'Product 1',
            productPicture: 'pic.jpg',
            quantity: 2,
            checked: false,
            subcategoryId: 1,
            subcategoryName: 'Subcategory 1',
          },
        ],
        totalItems: 2,
        uncheckedItems: 2,
      };

      mockCartService.addProduct.mockResolvedValue(expectedResult);

      const result = await controller.addProduct(1, addDto);

      expect(result).toEqual(expectedResult);
      expect(service.addProduct).toHaveBeenCalledWith(1, addDto);
    });
  });

  describe('updateCartProduct', () => {
    it('should update cart product', async () => {
      const updateDto = { quantity: 5, checked: true };
      const expectedResult = {
        id: 1,
        homeId: 1,
        products: [],
        totalItems: 5,
        uncheckedItems: 0,
      };

      mockCartService.updateCartProduct.mockResolvedValue(expectedResult);

      const result = await controller.updateCartProduct(1, 1, updateDto);

      expect(result).toEqual(expectedResult);
      expect(service.updateCartProduct).toHaveBeenCalledWith(1, 1, updateDto);
    });
  });

  describe('removeProduct', () => {
    it('should remove product from cart', async () => {
      const expectedResult = {
        id: 1,
        homeId: 1,
        products: [],
        totalItems: 0,
        uncheckedItems: 0,
      };

      mockCartService.removeProduct.mockResolvedValue(expectedResult);

      const result = await controller.removeProduct(1, 1);

      expect(result).toEqual(expectedResult);
      expect(service.removeProduct).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('clearCart', () => {
    it('should clear entire cart', async () => {
      const expectedResult = {
        id: 1,
        homeId: 1,
        products: [],
        totalItems: 0,
        uncheckedItems: 0,
      };

      mockCartService.clearCart.mockResolvedValue(expectedResult);

      const result = await controller.clearCart(1);

      expect(result).toEqual(expectedResult);
      expect(service.clearCart).toHaveBeenCalledWith(1, false);
    });

    it('should clear only checked items', async () => {
      const expectedResult = {
        id: 1,
        homeId: 1,
        products: [],
        totalItems: 0,
        uncheckedItems: 0,
      };

      mockCartService.clearCart.mockResolvedValue(expectedResult);

      const result = await controller.clearCart(1, 'true');

      expect(result).toEqual(expectedResult);
      expect(service.clearCart).toHaveBeenCalledWith(1, true);
    });
  });
});
