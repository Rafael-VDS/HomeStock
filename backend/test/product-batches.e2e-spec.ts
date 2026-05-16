import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('ProductBatchesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testHomeId: number;
  let testProductId: number;
  let createdBatchId: number;

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
      data: { name: 'Test Home for Batches' },
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
        name: 'Test Product for Batches',
        picture: 'product.jpg',
      },
    });
    testProductId = product.id;
  }, 30000);

  afterAll(async () => {
    // Nettoyer les données de test
    try {
      if (testHomeId) {
        await prisma.productBatch.deleteMany({
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

  describe('POST /product-batches', () => {
    it('should create a new product batch', () => {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);

      return request(app.getHttpServer())
        .post('/product-batches')
        .send({
          productId: testProductId,
          homeId: testHomeId,
          expirationDate: expirationDate.toISOString().split('T')[0],
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.productId).toBe(testProductId);
          expect(response.body.expirationStatus).toBe('fresh');
          createdBatchId = response.body.id;
        });
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/product-batches')
        .send({
          productId: 'invalid',
        })
        .expect(400);
    });

    it('should fail with non-existent product', () => {
      return request(app.getHttpServer())
        .post('/product-batches')
        .send({
          productId: 99999,
          homeId: testHomeId,
        })
        .expect(404);
    });
  });

  describe('POST /product-batches/bulk', () => {
    it('should create multiple batches', () => {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 60);

      return request(app.getHttpServer())
        .post('/product-batches/bulk')
        .send({
          productId: testProductId,
          homeId: testHomeId,
          quantity: 3,
          expirationDate: expirationDate.toISOString().split('T')[0],
        })
        .expect(201)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body).toHaveLength(3);
          expect(response.body[0].productId).toBe(testProductId);
        });
    });
  });

  describe('GET /product-batches', () => {
    it('should return all batches', () => {
      return request(app.getHttpServer())
        .get('/product-batches')
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
        });
    });

    it('should filter batches by homeId', () => {
      return request(app.getHttpServer())
        .get(`/product-batches?homeId=${testHomeId}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          response.body.forEach((batch) => {
            expect(batch.homeId).toBe(testHomeId);
          });
        });
    });

    it('should filter batches by productId', () => {
      return request(app.getHttpServer())
        .get(`/product-batches?productId=${testProductId}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          response.body.forEach((batch) => {
            expect(batch.productId).toBe(testProductId);
          });
        });
    });
  });

  describe('GET /product-batches/:id', () => {
    it('should return a specific batch', () => {
      return request(app.getHttpServer())
        .get(`/product-batches/${createdBatchId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(createdBatchId);
          expect(response.body.productId).toBe(testProductId);
        });
    });

    it('should fail with non-existent batch', () => {
      return request(app.getHttpServer())
        .get('/product-batches/99999')
        .expect(404);
    });
  });

  describe('GET /product-batches/expired/:homeId', () => {
    it('should return expired batches', async () => {
      // Créer un batch expiré
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 5);

      await prisma.productBatch.create({
        data: {
          productId: testProductId,
          homeId: testHomeId,
          expirationDate: expiredDate,
        },
      });

      return request(app.getHttpServer())
        .get(`/product-batches/expired/${testHomeId}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          response.body.forEach((batch) => {
            expect(batch.expirationStatus).toBe('expired');
          });
        });
    });
  });

  describe('GET /product-batches/expiring-soon/:homeId', () => {
    it('should return batches expiring within 7 days', async () => {
      // Créer un batch qui expire bientôt
      const soonDate = new Date();
      soonDate.setDate(soonDate.getDate() + 5);

      await prisma.productBatch.create({
        data: {
          productId: testProductId,
          homeId: testHomeId,
          expirationDate: soonDate,
        },
      });

      return request(app.getHttpServer())
        .get(`/product-batches/expiring-soon/${testHomeId}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          const hasSoonExpiring = response.body.some(
            (batch) => batch.expirationStatus === 'expiring_soon',
          );
          expect(hasSoonExpiring).toBe(true);
        });
    });
  });

  describe('POST /product-batches/consume/:productId', () => {
    it('should consume batches using FEFO', async () => {
      // Créer plusieurs batches avec différentes dates
      const date1 = new Date();
      date1.setDate(date1.getDate() + 10);
      const date2 = new Date();
      date2.setDate(date2.getDate() + 20);

      await prisma.productBatch.createMany({
        data: [
          { productId: testProductId, homeId: testHomeId, expirationDate: date1 },
          { productId: testProductId, homeId: testHomeId, expirationDate: date2 },
        ],
      });

      return request(app.getHttpServer())
        .post(`/product-batches/consume/${testProductId}`)
        .send({ quantity: 2 })
        .expect(200)
        .then((response) => {
          expect(response.body.consumedBatches).toBe(2);
          expect(response.body.remainingStock).toBeGreaterThanOrEqual(0);
        });
    });

    it('should fail if insufficient stock', () => {
      return request(app.getHttpServer())
        .post(`/product-batches/consume/${testProductId}`)
        .send({ quantity: 1000 })
        .expect(400);
    });
  });

  describe('PATCH /product-batches/:id', () => {
    it('should update batch expiration date', () => {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 90);

      return request(app.getHttpServer())
        .patch(`/product-batches/${createdBatchId}`)
        .send({
          expirationDate: newDate.toISOString().split('T')[0],
        })
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(createdBatchId);
          expect(new Date(response.body.expirationDate).getDate()).toBe(
            newDate.getDate(),
          );
        });
    });

    it('should fail with non-existent batch', () => {
      return request(app.getHttpServer())
        .patch('/product-batches/99999')
        .send({ expirationDate: '2026-12-31' })
        .expect(404);
    });
  });

  describe('DELETE /product-batches/:id', () => {
    it('should delete a batch', () => {
      return request(app.getHttpServer())
        .delete(`/product-batches/${createdBatchId}`)
        .expect(204);
    });

    it('should fail with non-existent batch', () => {
      return request(app.getHttpServer())
        .delete('/product-batches/99999')
        .expect(404);
    });
  });
});
