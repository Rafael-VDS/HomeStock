import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('PermissionsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: number;
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
    await prisma.permission.deleteMany();
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

    // Récupérer l'ID de l'utilisateur
    const user = await prisma.user.findFirst({
      where: { mail: 'test@test.com' },
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    userId = user.id;

    // Créer une maison de test
    const home = await prisma.home.create({
      data: { name: 'Test Home' },
    });
    homeId = home.id;
  });

  afterAll(async () => {
    await prisma.permission.deleteMany();
    await prisma.home.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('POST /api/permissions', () => {
    it('should create a new permission', () => {
      return request(app.getHttpServer())
        .post('/api/permissions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: userId,
          homeId: homeId,
          type: 'admin',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.userId).toBe(userId);
          expect(response.body.homeId).toBe(homeId);
          expect(response.body.type).toBe('admin');
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/permissions')
        .send({
          userId: userId,
          homeId: homeId,
          type: 'admin',
        })
        .expect(401);
    });

    it('should return 409 when permission already exists', () => {
      return request(app.getHttpServer())
        .post('/api/permissions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: userId,
          homeId: homeId,
          type: 'member',
        })
        .expect(409);
    });

    it('should return 404 when user not found', () => {
      return request(app.getHttpServer())
        .post('/api/permissions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: 999999,
          homeId: homeId,
          type: 'admin',
        })
        .expect(404);
    });

    it('should return 404 when home not found', () => {
      return request(app.getHttpServer())
        .post('/api/permissions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: userId,
          homeId: 999999,
          type: 'admin',
        })
        .expect(404);
    });
  });

  describe('GET /api/permissions/home/:homeId', () => {
    it('should return permissions for a home', () => {
      return request(app.getHttpServer())
        .get(`/api/permissions/home/${homeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
          expect(response.body[0]).toHaveProperty('user');
          expect(response.body[0].user).toHaveProperty('firstname');
        });
    });

    it('should return 404 for non-existent home', () => {
      return request(app.getHttpServer())
        .get('/api/permissions/home/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get(`/api/permissions/home/${homeId}`)
        .expect(401);
    });
  });

  describe('GET /api/permissions/user/:userId', () => {
    it('should return permissions for a user', () => {
      return request(app.getHttpServer())
        .get(`/api/permissions/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
          expect(response.body[0]).toHaveProperty('home');
          expect(response.body[0].home).toHaveProperty('name');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/api/permissions/user/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get(`/api/permissions/user/${userId}`)
        .expect(401);
    });
  });

  describe('GET /api/permissions/:id', () => {
    let permissionId: number;

    beforeAll(async () => {
      const permission = await prisma.permission.findFirst({
        where: { userId: userId, homeId: homeId },
      });
      
      if (!permission) {
        throw new Error('Permission not found');
      }
      
      permissionId = permission.id;
    });

    it('should return a permission by id', () => {
      return request(app.getHttpServer())
        .get(`/api/permissions/${permissionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(permissionId);
          expect(response.body).toHaveProperty('user');
          expect(response.body).toHaveProperty('home');
        });
    });

    it('should return 404 for non-existent permission', () => {
      return request(app.getHttpServer())
        .get('/api/permissions/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get(`/api/permissions/${permissionId}`)
        .expect(401);
    });
  });

  describe('PATCH /api/permissions/:id', () => {
    let permissionId: number;

    beforeAll(async () => {
      const permission = await prisma.permission.findFirst({
        where: { userId: userId, homeId: homeId },
      });
      
      if (!permission) {
        throw new Error('Permission not found');
      }
      
      permissionId = permission.id;
    });

    it('should update a permission type', () => {
      return request(app.getHttpServer())
        .patch(`/api/permissions/${permissionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'member',
        })
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(permissionId);
          expect(response.body.type).toBe('member');
        });
    });

    it('should return 404 for non-existent permission', () => {
      return request(app.getHttpServer())
        .patch('/api/permissions/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'viewer',
        })
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/api/permissions/${permissionId}`)
        .send({
          type: 'viewer',
        })
        .expect(401);
    });
  });

  describe('DELETE /api/permissions/:id', () => {
    let permissionId: number;

    beforeEach(async () => {
      // Créer une nouvelle permission pour chaque test de suppression
      const newUser = await prisma.user.create({
        data: {
          firstname: 'Delete',
          lastname: 'Test',
          mail: `delete-${Date.now()}@test.com`,
          password: 'hash',
        },
      });

      const permission = await prisma.permission.create({
        data: {
          userId: newUser.id,
          homeId: homeId,
          type: 'viewer',
        },
      });
      
      permissionId = permission.id;
    });

    it('should delete a permission', () => {
      return request(app.getHttpServer())
        .delete(`/api/permissions/${permissionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('message');
        });
    });

    it('should return 404 for non-existent permission', () => {
      return request(app.getHttpServer())
        .delete('/api/permissions/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/api/permissions/${permissionId}`)
        .expect(401);
    });
  });
});
