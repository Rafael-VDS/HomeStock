import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let homeId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    // Nettoyer la base de données
    await prisma.subcategory.deleteMany();
    await prisma.category.deleteMany();
    await prisma.home.deleteMany();
    await prisma.user.deleteMany();

    // Créer un utilisateur de test et obtenir le token
    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'test@test.com',
        password: 'Password123',
        firstname: 'Test',
        lastname: 'User',
      });

    authToken = registerResponse.body.access_token;

    // Créer une maison de test
    const home = await prisma.home.create({
      data: { name: 'Test Home' },
    });
    homeId = home.id;
  });

  afterAll(async () => {
    await prisma.subcategory.deleteMany();
    await prisma.category.deleteMany();
    await prisma.home.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  // ==================== CATEGORIES TESTS ====================

  describe('POST /api/categories', () => {
    it('should create a new category with picture', () => {
      return request(app.getHttpServer())
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          homeId: homeId,
          name: 'Fruits et Légumes',
          picture: 'https://example.com/fruits.jpg',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.homeId).toBe(homeId);
          expect(response.body.name).toBe('Fruits et Légumes');
          expect(response.body.picture).toBe('https://example.com/fruits.jpg');
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/categories')
        .send({
          homeId: homeId,
          name: 'Test',
          picture: 'https://example.com/test.jpg',
        })
        .expect(401);
    });

    it('should return 404 when home not found', () => {
      return request(app.getHttpServer())
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          homeId: 999999,
          name: 'Test',
          picture: 'https://example.com/test.jpg',
        })
        .expect(404);
    });

    it('should return 400 without picture', () => {
      return request(app.getHttpServer())
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          homeId: homeId,
          name: 'Test',
        })
        .expect(400);
    });
  });

  describe('GET /api/categories/home/:homeId', () => {
    beforeAll(async () => {
      await prisma.category.createMany({
        data: [
          {
            homeId: homeId,
            name: 'Viandes',
            picture: 'https://example.com/meat.jpg',
          },
          {
            homeId: homeId,
            name: 'Produits Laitiers',
            picture: 'https://example.com/dairy.jpg',
          },
        ],
      });
    });

    it('should return categories for a home with subcategories', () => {
      return request(app.getHttpServer())
        .get(`/api/categories/home/${homeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThanOrEqual(2);
          expect(response.body[0]).toHaveProperty('picture');
          expect(response.body[0]).toHaveProperty('subcategories');
        });
    });

    it('should return 404 for non-existent home', () => {
      return request(app.getHttpServer())
        .get('/api/categories/home/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get(`/api/categories/home/${homeId}`)
        .expect(401);
    });
  });

  describe('GET /api/categories/:id', () => {
    let categoryId: number;

    beforeAll(async () => {
      const category = await prisma.category.create({
        data: {
          homeId: homeId,
          name: 'Boissons',
          picture: 'https://example.com/drinks.jpg',
        },
      });
      categoryId = category.id;
    });

    it('should return a category by id with picture', () => {
      return request(app.getHttpServer())
        .get(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(categoryId);
          expect(response.body.name).toBe('Boissons');
          expect(response.body.picture).toBe('https://example.com/drinks.jpg');
          expect(response.body).toHaveProperty('subcategories');
        });
    });

    it('should return 404 for non-existent category', () => {
      return request(app.getHttpServer())
        .get('/api/categories/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get(`/api/categories/${categoryId}`)
        .expect(401);
    });
  });

  describe('PATCH /api/categories/:id', () => {
    let categoryId: number;

    beforeAll(async () => {
      const category = await prisma.category.create({
        data: {
          homeId: homeId,
          name: 'Snacks',
          picture: 'https://example.com/snacks.jpg',
        },
      });
      categoryId = category.id;
    });

    it('should update a category name and picture', () => {
      return request(app.getHttpServer())
        .patch(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Snacks Salés',
          picture: 'https://example.com/snacks-new.jpg',
        })
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(categoryId);
          expect(response.body.name).toBe('Snacks Salés');
          expect(response.body.picture).toBe('https://example.com/snacks-new.jpg');
        });
    });

    it('should return 404 for non-existent category', () => {
      return request(app.getHttpServer())
        .patch('/api/categories/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test',
        })
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/api/categories/${categoryId}`)
        .send({
          name: 'Test',
        })
        .expect(401);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    let categoryId: number;

    beforeEach(async () => {
      const category = await prisma.category.create({
        data: {
          homeId: homeId,
          name: 'To Delete',
          picture: 'https://example.com/delete.jpg',
        },
      });
      categoryId = category.id;
    });

    it('should delete a category', () => {
      return request(app.getHttpServer())
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('message');
        });
    });

    it('should return 404 for non-existent category', () => {
      return request(app.getHttpServer())
        .delete('/api/categories/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/api/categories/${categoryId}`)
        .expect(401);
    });
  });

  // ==================== SUBCATEGORIES TESTS ====================

  describe('POST /api/subcategories', () => {
    let categoryId: number;

    beforeAll(async () => {
      const category = await prisma.category.create({
        data: {
          homeId: homeId,
          name: 'Fruits',
          picture: 'https://example.com/fruits.jpg',
        },
      });
      categoryId = category.id;
    });

    it('should create a new subcategory without picture', () => {
      return request(app.getHttpServer())
        .post('/api/subcategories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categoryId: categoryId,
          name: 'Pommes',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.categoryId).toBe(categoryId);
          expect(response.body.name).toBe('Pommes');
          expect(response.body).not.toHaveProperty('picture');
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/subcategories')
        .send({
          categoryId: categoryId,
          name: 'Test',
        })
        .expect(401);
    });

    it('should return 404 when category not found', () => {
      return request(app.getHttpServer())
        .post('/api/subcategories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categoryId: 999999,
          name: 'Test',
        })
        .expect(404);
    });
  });

  describe('GET /api/subcategories/category/:categoryId', () => {
    let categoryId: number;

    beforeAll(async () => {
      const category = await prisma.category.create({
        data: {
          homeId: homeId,
          name: 'Légumes',
          picture: 'https://example.com/vegetables.jpg',
        },
      });
      categoryId = category.id;

      await prisma.subcategory.createMany({
        data: [
          { categoryId: categoryId, name: 'Carottes' },
          { categoryId: categoryId, name: 'Tomates' },
        ],
      });
    });

    it('should return subcategories for a category', () => {
      return request(app.getHttpServer())
        .get(`/api/subcategories/category/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThanOrEqual(2);
          expect(response.body[0]).not.toHaveProperty('picture');
        });
    });

    it('should return 404 for non-existent category', () => {
      return request(app.getHttpServer())
        .get('/api/subcategories/category/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get(`/api/subcategories/category/${categoryId}`)
        .expect(401);
    });
  });

  describe('GET /api/subcategories/:id', () => {
    let subcategoryId: number;

    beforeAll(async () => {
      const category = await prisma.category.create({
        data: {
          homeId: homeId,
          name: 'Céréales',
          picture: 'https://example.com/cereals.jpg',
        },
      });

      const subcategory = await prisma.subcategory.create({
        data: {
          categoryId: category.id,
          name: 'Riz',
        },
      });
      subcategoryId = subcategory.id;
    });

    it('should return a subcategory by id without picture', () => {
      return request(app.getHttpServer())
        .get(`/api/subcategories/${subcategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(subcategoryId);
          expect(response.body.name).toBe('Riz');
          expect(response.body).not.toHaveProperty('picture');
          expect(response.body).toHaveProperty('category');
        });
    });

    it('should return 404 for non-existent subcategory', () => {
      return request(app.getHttpServer())
        .get('/api/subcategories/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get(`/api/subcategories/${subcategoryId}`)
        .expect(401);
    });
  });

  describe('PATCH /api/subcategories/:id', () => {
    let subcategoryId: number;

    beforeAll(async () => {
      const category = await prisma.category.create({
        data: {
          homeId: homeId,
          name: 'Pâtes',
          picture: 'https://example.com/pasta.jpg',
        },
      });

      const subcategory = await prisma.subcategory.create({
        data: {
          categoryId: category.id,
          name: 'Spaghetti',
        },
      });
      subcategoryId = subcategory.id;
    });

    it('should update a subcategory name', () => {
      return request(app.getHttpServer())
        .patch(`/api/subcategories/${subcategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Spaghetti Complets',
        })
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(subcategoryId);
          expect(response.body.name).toBe('Spaghetti Complets');
        });
    });

    it('should return 404 for non-existent subcategory', () => {
      return request(app.getHttpServer())
        .patch('/api/subcategories/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test',
        })
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/api/subcategories/${subcategoryId}`)
        .send({
          name: 'Test',
        })
        .expect(401);
    });
  });

  describe('DELETE /api/subcategories/:id', () => {
    let subcategoryId: number;

    beforeEach(async () => {
      const category = await prisma.category.create({
        data: {
          homeId: homeId,
          name: 'Temp Category',
          picture: 'https://example.com/temp.jpg',
        },
      });

      const subcategory = await prisma.subcategory.create({
        data: {
          categoryId: category.id,
          name: 'To Delete Sub',
        },
      });
      subcategoryId = subcategory.id;
    });

    it('should delete a subcategory', () => {
      return request(app.getHttpServer())
        .delete(`/api/subcategories/${subcategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('message');
        });
    });

    it('should return 404 for non-existent subcategory', () => {
      return request(app.getHttpServer())
        .delete('/api/subcategories/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/api/subcategories/${subcategoryId}`)
        .expect(401);
    });
  });
});
