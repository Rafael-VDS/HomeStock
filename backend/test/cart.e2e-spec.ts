import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('CartController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testHomeId: number;
  let testProductId: number;
  let cartProductId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);

    // Créer des données de test
    const home = await prisma.home.create({
      data: { name: 'Test Home for Cart' },
    });
    testHomeId = home.id;

    const category = await prisma.category.create({
      data: {
        homeId: testHomeId,
        name: 'Test Category',
        picture: 'test.jpg',
      },
    });

    const subcategory = await prisma.subcategory.create({
      data: {
        categoryId: category.id,
        name: 'Test Subcategory',
      },
    });

    const product = await prisma.product.create({
      data: {
        homeId: testHomeId,
        subcategoryId: subcategory.id,
        name: 'Test Product for Cart',
        picture: 'product.jpg',
      },
    });
    testProductId = product.id;
  }, 30000);

  afterAll(async () => {
    // Nettoyer les données de test
    try {
      if (testHomeId) {
        await prisma.cartProduct.deleteMany({
          where: { cart: { homeId: testHomeId } },
        });
        await prisma.cart.deleteMany({
          where: { homeId: testHomeId },
        });
        await prisma.product.deleteMany({
          where: { homeId: testHomeId },
        });
        await prisma.subcategory.deleteMany({
          where: { category: { homeId: testHomeId } },
        });
        await prisma.category.deleteMany({
          where: { homeId: testHomeId },
        });
        await prisma.home.deleteMany({
          where: { id: testHomeId },
        });
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }

    await app.close();
  }, 30000);

  describe('GET /cart/:homeId', () => {
    it('should get or create cart for home', () => {
      return request(app.getHttpServer())
        .get(`/cart/${testHomeId}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.homeId).toBe(testHomeId);
          expect(response.body.products).toBeDefined();
          expect(Array.isArray(response.body.products)).toBe(true);
          expect(response.body.totalItems).toBe(0);
          expect(response.body.uncheckedItems).toBe(0);
        });
    });

    it('should fail with invalid homeId', () => {
      return request(app.getHttpServer())
        .get('/cart/99999')
        .expect(404);
    });
  });

  describe('POST /cart/:homeId/products', () => {
    it('should add product to cart', () => {
      return request(app.getHttpServer())
        .post(`/cart/${testHomeId}/products`)
        .send({
          productId: testProductId,
          quantity: 2,
        })
        .expect(201)
        .then((response) => {
          expect(response.body.products).toHaveLength(1);
          expect(response.body.products[0].productId).toBe(testProductId);
          expect(response.body.products[0].quantity).toBe(2);
          expect(response.body.totalItems).toBe(2);
          expect(response.body.uncheckedItems).toBe(2);
          cartProductId = response.body.products[0].id;
        });
    });

    it('should increase quantity if product already in cart', () => {
      return request(app.getHttpServer())
        .post(`/cart/${testHomeId}/products`)
        .send({
          productId: testProductId,
          quantity: 1,
        })
        .expect(201)
        .then((response) => {
          expect(response.body.products).toHaveLength(1);
          expect(response.body.products[0].quantity).toBe(3);
          expect(response.body.totalItems).toBe(3);
        });
    });

    it('should fail with invalid productId', () => {
      return request(app.getHttpServer())
        .post(`/cart/${testHomeId}/products`)
        .send({
          productId: 99999,
        })
        .expect(404);
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post(`/cart/${testHomeId}/products`)
        .send({
          productId: 'invalid',
        })
        .expect(400);
    });
  });

  describe('PATCH /cart/:homeId/products/:cartProductId', () => {
    it('should update cart product quantity', () => {
      return request(app.getHttpServer())
        .patch(`/cart/${testHomeId}/products/${cartProductId}`)
        .send({
          quantity: 5,
        })
        .expect(200)
        .then((response) => {
          expect(response.body.products[0].quantity).toBe(5);
          expect(response.body.totalItems).toBe(5);
        });
    });

    it('should update cart product checked status', () => {
      return request(app.getHttpServer())
        .patch(`/cart/${testHomeId}/products/${cartProductId}`)
        .send({
          checked: true,
        })
        .expect(200)
        .then((response) => {
          expect(response.body.products[0].checked).toBe(true);
          expect(response.body.uncheckedItems).toBe(0);
        });
    });

    it('should fail with non-existent cart product', () => {
      return request(app.getHttpServer())
        .patch(`/cart/${testHomeId}/products/99999`)
        .send({
          quantity: 1,
        })
        .expect(404);
    });
  });

  describe('DELETE /cart/:homeId/products/:cartProductId', () => {
    it('should remove product from cart', async () => {
      // Ajouter un autre produit pour le test
      const category = await prisma.category.findFirst({
        where: { homeId: testHomeId },
      });
      const subcategory = await prisma.subcategory.findFirst({
        where: { categoryId: category.id },
      });
      const tempProduct = await prisma.product.create({
        data: {
          homeId: testHomeId,
          subcategoryId: subcategory.id,
          name: 'Temp Product',
          picture: 'temp.jpg',
        },
      });

      // Ajouter au panier
      const addResponse = await request(app.getHttpServer())
        .post(`/cart/${testHomeId}/products`)
        .send({ productId: tempProduct.id });

      const tempCartProductId = addResponse.body.products.find(
        (p) => p.productId === tempProduct.id,
      ).id;

      // Supprimer du panier
      return request(app.getHttpServer())
        .delete(`/cart/${testHomeId}/products/${tempCartProductId}`)
        .expect(200)
        .then((response) => {
          const hasProduct = response.body.products.some(
            (p) => p.productId === tempProduct.id,
          );
          expect(hasProduct).toBe(false);
        });
    });

    it('should fail with non-existent cart product', () => {
      return request(app.getHttpServer())
        .delete(`/cart/${testHomeId}/products/99999`)
        .expect(404);
    });
  });

  describe('DELETE /cart/:homeId', () => {
    it('should clear only checked items', async () => {
      // Ajouter des produits non cochés
      const category = await prisma.category.findFirst({
        where: { homeId: testHomeId },
      });
      const subcategory = await prisma.subcategory.findFirst({
        where: { categoryId: category.id },
      });
      const product2 = await prisma.product.create({
        data: {
          homeId: testHomeId,
          subcategoryId: subcategory.id,
          name: 'Product 2',
          picture: 'p2.jpg',
        },
      });

      await request(app.getHttpServer())
        .post(`/cart/${testHomeId}/products`)
        .send({ productId: product2.id, quantity: 1 });

      // Vider seulement les produits cochés
      return request(app.getHttpServer())
        .delete(`/cart/${testHomeId}?onlyChecked=true`)
        .expect(200)
        .then((response) => {
          expect(response.body.products.length).toBeGreaterThan(0);
          expect(response.body.products.every((p) => !p.checked)).toBe(true);
        });
    });

    it('should clear entire cart', () => {
      return request(app.getHttpServer())
        .delete(`/cart/${testHomeId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.products).toHaveLength(0);
          expect(response.body.totalItems).toBe(0);
          expect(response.body.uncheckedItems).toBe(0);
        });
    });

    it('should fail with non-existent home', () => {
      return request(app.getHttpServer())
        .delete('/cart/99999')
        .expect(404);
    });
  });
});
