import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('HomesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
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
    await prisma.home.deleteMany();
    await prisma.user.deleteMany();

    // Créer un utilisateur de test et obtenir le token
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'test@test.com',
        password: 'Password123',
        firstname: 'Test',
        lastname: 'User',
      });

    authToken = registerResponse.body.access_token;
  });

  afterAll(async () => {
    await prisma.home.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('POST /api/v1/homes', () => {
    it('should create a new home', () => {
      return request(app.getHttpServer())
        .post('/api/v1/homes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Maison Test',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.name).toBe('Maison Test');
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/v1/homes')
        .send({
          name: 'Maison Test',
        })
        .expect(401);
    });

    it('should return 400 with invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/v1/homes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '',
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/homes', () => {
    beforeAll(async () => {
      await prisma.home.deleteMany();
      await prisma.home.createMany({
        data: [
          { name: 'Maison 1' },
          { name: 'Maison 2' },
        ],
      });
    });

    it('should return all homes', () => {
      return request(app.getHttpServer())
        .get('/api/v1/homes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThanOrEqual(2);
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/api/v1/homes')
        .expect(401);
    });
  });

  describe('GET /api/v1/homes/:id', () => {
    let homeId: number;

    beforeAll(async () => {
      const home = await prisma.home.create({
        data: { name: 'Maison Détails' },
      });
      homeId = home.id;
    });

    it('should return a home by id', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/homes/${homeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(homeId);
          expect(response.body.name).toBe('Maison Détails');
        });
    });

    it('should return 404 for non-existent home', () => {
      return request(app.getHttpServer())
        .get('/api/v1/homes/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/homes/${homeId}`)
        .expect(401);
    });
  });

  describe('PATCH /api/v1/homes/:id', () => {
    let homeId: number;

    beforeAll(async () => {
      const home = await prisma.home.create({
        data: { name: 'Maison à Modifier' },
      });
      homeId = home.id;
    });

    it('should update a home', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/homes/${homeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Maison Modifiée',
        })
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(homeId);
          expect(response.body.name).toBe('Maison Modifiée');
        });
    });

    it('should return 404 for non-existent home', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/homes/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test',
        })
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/homes/${homeId}`)
        .send({
          name: 'Test',
        })
        .expect(401);
    });
  });

  describe('DELETE /api/v1/homes/:id', () => {
    let homeId: number;

    beforeEach(async () => {
      const home = await prisma.home.create({
        data: { name: 'Maison à Supprimer' },
      });
      homeId = home.id;
    });

    it('should delete a home', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/homes/${homeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('message');
        });
    });

    it('should return 404 for non-existent home', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/homes/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/homes/${homeId}`)
        .expect(401);
    });
  });

  describe('GET /api/v1/homes/:id/users', () => {
    let homeId: number;
    let userId: number;

    beforeAll(async () => {
      const home = await prisma.home.create({
        data: { name: 'Maison avec Utilisateurs' },
      });
      homeId = home.id;

      const user = await prisma.user.findFirst({
        where: { mail: 'test@test.com' },
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      userId = user.id;

      await prisma.permission.create({
        data: {
          userId: userId,
          homeId: homeId,
          type: 'admin',
        },
      });
    });

    it('should return users of a home', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/homes/${homeId}/users`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
          expect(response.body[0]).toHaveProperty('permissionType');
        });
    });

    it('should return 404 for non-existent home', () => {
      return request(app.getHttpServer())
        .get('/api/v1/homes/999999/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /api/v1/homes/:id/categories', () => {
    let homeId: number;

    beforeAll(async () => {
      const home = await prisma.home.create({
        data: { name: 'Maison avec Catégories' },
      });
      homeId = home.id;
    });

    it('should return categories of a home', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/homes/${homeId}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
        });
    });

    it('should return 404 for non-existent home', () => {
      return request(app.getHttpServer())
        .get('/api/v1/homes/999999/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /api/v1/homes/:id/products', () => {
    let homeId: number;

    beforeAll(async () => {
      const home = await prisma.home.create({
        data: { name: 'Maison avec Produits' },
      });
      homeId = home.id;
    });

    it('should return products of a home', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/homes/${homeId}/products`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
        });
    });

    it('should return 404 for non-existent home', () => {
      return request(app.getHttpServer())
        .get('/api/v1/homes/999999/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
