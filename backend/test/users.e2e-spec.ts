import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Appliquer la même config que main.ts
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    // Nettoyer la base de données avant les tests
    await prismaService.user.deleteMany();
  });

  afterAll(async () => {
    // Nettoyer après les tests
    await prismaService.user.deleteMany();
    await prismaService.$disconnect();
    await app.close();
  });

  describe('/api/v1/users (POST)', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          firstname: 'John',
          lastname: 'Doe',
          mail: 'john.doe@example.com',
          password: 'SecurePass123!',
          picture: 'https://example.com/avatar.jpg',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.firstname).toBe('John');
          expect(res.body.lastname).toBe('Doe');
          expect(res.body.mail).toBe('john.doe@example.com');
          expect(res.body.picture).toBe('https://example.com/avatar.jpg');
          expect(res.body).not.toHaveProperty('password'); // Le password ne doit jamais être retourné
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          firstname: 'Test',
          lastname: 'User',
          mail: 'invalid-email',
          password: 'password123',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('mail must be an email');
        });
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          firstname: 'Test',
          lastname: 'User',
          mail: 'test@example.com',
          password: 'short',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain(
            'password must be longer than or equal to 8 characters',
          );
        });
    });

    it('should fail with duplicate email', async () => {
      // Créer un premier utilisateur
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          firstname: 'Jane',
          lastname: 'Smith',
          mail: 'jane.smith@example.com',
          password: 'password123',
        })
        .expect(201);

      // Essayer de créer un utilisateur avec le même email
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          firstname: 'Another',
          lastname: 'User',
          mail: 'jane.smith@example.com',
          password: 'password456',
        })
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Un utilisateur avec cet email existe déjà',
          );
        });
    });

    it('should fail with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          firstname: 'Test',
          // Manque lastname, mail, password
        })
        .expect(400);
    });
  });

  describe('/api/v1/users (GET)', () => {
    it('should return all users', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('firstname');
      expect(response.body[0]).not.toHaveProperty('password');
    });
  });

  describe('/api/v1/users/:id (GET)', () => {
    it('should return a user by id', async () => {
      // Créer un utilisateur
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          firstname: 'Get',
          lastname: 'Test',
          mail: 'get.test@example.com',
          password: 'password123',
        });

      const userId = createResponse.body.id;

      // Récupérer l'utilisateur
      return request(app.getHttpServer())
        .get(`/api/v1/users/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
          expect(res.body.firstname).toBe('Get');
          expect(res.body.lastname).toBe('Test');
          expect(res.body.mail).toBe('get.test@example.com');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/99999')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Utilisateur #99999 introuvable');
        });
    });
  });

  describe('/api/v1/users/search (GET)', () => {
    it('should find a user by email', async () => {
      // Créer un utilisateur
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          firstname: 'Search',
          lastname: 'Test',
          mail: 'search.test@example.com',
          password: 'password123',
        });

      // Rechercher par email
      return request(app.getHttpServer())
        .get('/api/v1/users/search')
        .query({ mail: 'search.test@example.com' })
        .expect(200)
        .expect((res) => {
          expect(res.body.mail).toBe('search.test@example.com');
          expect(res.body.firstname).toBe('Search');
        });
    });

    it('should return 404 for non-existent email', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/search')
        .query({ mail: 'notfound@example.com' })
        .expect(404);
    });
  });

  describe('/api/v1/users/:id (PATCH)', () => {
    it('should update a user', async () => {
      // Créer un utilisateur
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          firstname: 'Update',
          lastname: 'Test',
          mail: 'update.test@example.com',
          password: 'password123',
        });

      const userId = createResponse.body.id;

      // Mettre à jour
      return request(app.getHttpServer())
        .patch(`/api/v1/users/${userId}`)
        .send({
          firstname: 'Updated',
          picture: 'https://example.com/new-avatar.jpg',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
          expect(res.body.firstname).toBe('Updated');
          expect(res.body.lastname).toBe('Test'); // Inchangé
          expect(res.body.picture).toBe('https://example.com/new-avatar.jpg');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/users/99999')
        .send({ firstname: 'Test' })
        .expect(404);
    });

    it('should fail when updating to existing email', async () => {
      // Créer deux utilisateurs
      await request(app.getHttpServer()).post('/api/v1/users').send({
        firstname: 'User1',
        lastname: 'Test',
        mail: 'user1@example.com',
        password: 'password123',
      });

      const user2Response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          firstname: 'User2',
          lastname: 'Test',
          mail: 'user2@example.com',
          password: 'password123',
        });

      // Essayer de mettre à jour user2 avec l'email de user1
      return request(app.getHttpServer())
        .patch(`/api/v1/users/${user2Response.body.id}`)
        .send({ mail: 'user1@example.com' })
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toBe('Cet email est déjà utilisé');
        });
    });
  });

  describe('/api/v1/users/:id/permissions (GET)', () => {
    it('should return empty permissions array for new user', async () => {
      // Créer un utilisateur
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          firstname: 'Permission',
          lastname: 'Test',
          mail: 'permission.test@example.com',
          password: 'password123',
        });

      const userId = createResponse.body.id;

      // Récupérer les permissions
      return request(app.getHttpServer())
        .get(`/api/v1/users/${userId}/permissions`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0); // Pas encore de permissions
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/99999/permissions')
        .expect(404);
    });
  });

  describe('/api/v1/users/:id (DELETE)', () => {
    it('should delete a user', async () => {
      // Créer un utilisateur
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          firstname: 'Delete',
          lastname: 'Test',
          mail: 'delete.test@example.com',
          password: 'password123',
        });

      const userId = createResponse.body.id;

      // Supprimer
      await request(app.getHttpServer())
        .delete(`/api/v1/users/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe(
            `Utilisateur #${userId} supprimé avec succès`,
          );
        });

      // Vérifier que l'utilisateur n'existe plus
      return request(app.getHttpServer())
        .get(`/api/v1/users/${userId}`)
        .expect(404);
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/users/99999')
        .expect(404);
    });
  });
});
