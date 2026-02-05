import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdProductId: number;
  let testHomeId: number;
  let testSubcategoryId: number;

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
      data: { name: 'Test Home for Products' },
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
    testSubcategoryId = subcategory.id;
  }, 30000);

  afterAll(async () => {
    // Nettoyer les données de test
    try {
      if (createdProductId) {
        await prisma.subcategoryProduct.deleteMany({
          where: { productId: createdProductId },
        });
        await prisma.product.deleteMany({
          where: { id: createdProductId },
        });
      }
      if (testSubcategoryId) {
        await prisma.subcategory.deleteMany({
          where: { id: testSubcategoryId },
        });
      }
      if (testHomeId) {
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

  describe('POST /products', () => {
    it('should create a new product', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          homeId: testHomeId,
          name: 'Test Product E2E',
          picture: 'https://example.com/test.jpg',
          mass: 500,
          subcategoryIds: [testSubcategoryId],
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.name).toBe('Test Product E2E');
          expect(response.body.mass).toBe(500);
          expect(response.body.stockCount).toBe(0);
          expect(response.body.needsToBuy).toBe(true);
          expect(response.body.subcategories).toHaveLength(1);
          createdProductId = response.body.id;
        });
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          homeId: 'invalid',
          name: '',
        })
        .expect(400);
    });

    it('should fail with non-existent home', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          homeId: 99999,
          name: 'Test Product',
          picture: 'test.jpg',
        })
        .expect(404);
    });
  });

  describe('GET /products', () => {
    it('should return all products', () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
        });
    });

    it('should filter products by homeId', () => {
      return request(app.getHttpServer())
        .get(`/products?homeId=${testHomeId}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          response.body.forEach((product) => {
            expect(product.homeId).toBe(testHomeId);
          });
        });
    });
  });

  describe('GET /products/:id', () => {
    it('should return a specific product', () => {
      return request(app.getHttpServer())
        .get(`/products/${createdProductId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(createdProductId);
          expect(response.body.name).toBe('Test Product E2E');
        });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer()).get('/products/99999').expect(404);
    });
  });

  describe('GET /products/subcategory/:subcategoryId', () => {
    it('should return products by subcategory', () => {
      return request(app.getHttpServer())
        .get(`/products/subcategory/${testSubcategoryId}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
          response.body.forEach((product) => {
            const hasSubcategory = product.subcategories.some(
              (sub) => sub.id === testSubcategoryId,
            );
            expect(hasSubcategory).toBe(true);
          });
        });
    });
  });

  describe('GET /products/to-buy/:homeId', () => {
    it('should return products that need to be bought', () => {
      return request(app.getHttpServer())
        .get(`/products/to-buy/${testHomeId}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          response.body.forEach((product) => {
            expect(product.needsToBuy).toBe(true);
            expect(product.stockCount).toBeLessThan(2);
          });
        });
    });
  });

  describe('PATCH /products/:id', () => {
    it('should update a product', () => {
      return request(app.getHttpServer())
        .patch(`/products/${createdProductId}`)
        .send({
          name: 'Updated Product Name',
          mass: 750,
        })
        .expect(200)
        .then((response) => {
          expect(response.body.name).toBe('Updated Product Name');
          expect(response.body.mass).toBe(750);
        });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .patch('/products/99999')
        .send({ name: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product without stock', async () => {
      // Créer un produit temporaire pour le supprimer
      const tempProduct = await prisma.product.create({
        data: {
          homeId: testHomeId,
          name: 'Temp Product',
          picture: 'temp.jpg',
        },
      });

      return request(app.getHttpServer())
        .delete(`/products/${tempProduct.id}`)
        .expect(204);
    });

    it('should fail to delete product with stock', async () => {
      // Ajouter du stock au produit de test
      await prisma.productBatch.create({
        data: {
          productId: createdProductId,
          homeId: testHomeId,
        },
      });

      await request(app.getHttpServer())
        .delete(`/products/${createdProductId}`)
        .expect(400);

      // Nettoyer le stock
      await prisma.productBatch.deleteMany({
        where: { productId: createdProductId },
      });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer()).delete('/products/99999').expect(404);
    });
  });
});
