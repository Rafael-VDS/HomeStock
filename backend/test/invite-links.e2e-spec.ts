import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('InviteLinks (e2e)', () => {
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
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Nettoyer la base de données de test
    await (prisma as any).inviteLink.deleteMany({});
    await prisma.permission.deleteMany({});
    await prisma.home.deleteMany({});
    await prisma.user.deleteMany({});

    // Créer un utilisateur de test
    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstname: 'John',
        lastname: 'Doe',
        mail: 'john.doe.invite@example.com',
        password: 'password123',
      });

    authToken = registerResponse.body.access_token;
    userId = registerResponse.body.user.id;

    // Créer un foyer
    const homeResponse = await request(app.getHttpServer())
      .post('/api/homes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Home',
        userId,
      });

    homeId = homeResponse.body.id;
  });

  afterAll(async () => {
    await (prisma as any).inviteLink.deleteMany({});
    await prisma.permission.deleteMany({});
    await prisma.home.deleteMany({});
    await prisma.user.deleteMany({});
    await app.close();
  });

  describe('/api/invite-links (POST)', () => {
    it('should create an invite link', () => {
      return request(app.getHttpServer())
        .post('/api/invite-links')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          homeId,
          permissionType: 'read-write',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('link');
          expect(res.body.homeId).toBe(homeId);
          expect(res.body.permissionType).toBe('read-write');
          expect(res.body.link).toHaveLength(25);
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/invite-links')
        .send({
          homeId,
          permissionType: 'read-write',
        })
        .expect(401);
    });

    it('should create an invite link with read permission', () => {
      return request(app.getHttpServer())
        .post('/api/invite-links')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          homeId,
          permissionType: 'read',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('link');
          expect(res.body.permissionType).toBe('read');
        });
    });

    it('should return 400 with invalid permission type', () => {
      return request(app.getHttpServer())
        .post('/api/invite-links')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          homeId,
          permissionType: 'admin', // Type invalide
        })
        .expect(400);
    });
  });

  describe('/api/invite-links/home/:homeId (GET)', () => {
    it('should get all active invite links for a home', async () => {
      // D'abord créer un lien
      await request(app.getHttpServer())
        .post('/api/invite-links')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ homeId, permissionType: 'read-write' });

      return request(app.getHttpServer())
        .get(`/api/invite-links/home/${homeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/api/invite-links/use (POST)', () => {
    it('should allow a user to join a home with valid invite link', async () => {
      // Créer un nouveau utilisateur
      const newUserResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          firstname: 'Jane',
          lastname: 'Smith',
          mail: 'jane.smith.invite@example.com',
          password: 'password123',
        });

      const newUserToken = newUserResponse.body.access_token;
      const newUserId = newUserResponse.body.user.id;

      // Créer un lien d'invitation
      const inviteResponse = await request(app.getHttpServer())
        .post('/api/invite-links')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ homeId, permissionType: 'read' });

      const inviteLink = inviteResponse.body.link;

      // Utiliser le lien
      return request(app.getHttpServer())
        .post('/api/invite-links/use')
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({
          link: inviteLink,
          userId: newUserId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.userId).toBe(newUserId);
          expect(res.body.homeId).toBe(homeId);
          expect(res.body.type).toBe('read');
        });
    });

    it('should return 404 for invalid invite link', async () => {
      return request(app.getHttpServer())
        .post('/api/invite-links/use')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          link: 'invalid123',
          userId,
        })
        .expect(404);
    });
  });

  describe('/api/invite-links/:id (DELETE)', () => {
    it('should delete an invite link', async () => {
      // Créer un lien
      const createResponse = await request(app.getHttpServer())
        .post('/api/invite-links')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ homeId, permissionType: 'read-write' });

      const linkId = createResponse.body.id;

      // Supprimer le lien
      return request(app.getHttpServer())
        .delete(`/api/invite-links/${linkId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });
});
