import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Campunity E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const testUser = {
      email: `e2e-${Date.now()}@test.com`,
      password: 'testpass123',
      username: `user-${Date.now()}`,
      displayName: 'E2E Test User',
    };
    let accessToken: string;

    it('POST /auth/register - should register a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.username).toBe(testUser.username);
    });

    it('POST /auth/register - should reject duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('POST /auth/login - should login with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(201);

      expect(res.body.user).toBeDefined();
      accessToken = res.headers['set-cookie']?.toString() || '';
    });

    it('POST /auth/login - should reject invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: 'wrongpass' })
        .expect(401);
    });

    it('GET /auth/me - should return profile with valid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', accessToken)
        .expect(200);

      expect(res.body.email).toBe(testUser.email);
    });

    it('GET /auth/me - should reject without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('POST /auth/logout - should clear cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(201);

      expect(res.body.message).toBe('Logged out');
    });
  });

  describe('Protected Routes', () => {
    it('GET /users/me - should reject without auth', async () => {
      await request(app.getHttpServer())
        .put('/users/me')
        .send({ displayName: 'Hacker' })
        .expect(401);
    });

    it('POST /resources - should reject without auth', async () => {
      await request(app.getHttpServer())
        .post('/resources')
        .send({ title: 'Hacked', description: 'Evil' })
        .expect(401);
    });

    it('GET /messages - should reject without auth', async () => {
      await request(app.getHttpServer())
        .get('/messages')
        .expect(401);
    });

    it('GET /notifications - should reject without auth', async () => {
      await request(app.getHttpServer())
        .get('/notifications')
        .expect(401);
    });
  });

  describe('Public Endpoints', () => {
    it('GET /universities - should return universities list', async () => {
      const res = await request(app.getHttpServer())
        .get('/universities')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /resources - should return paginated resources', async () => {
      const res = await request(app.getHttpServer())
        .get('/resources?page=1&limit=10')
        .expect(200);
      expect(res.body.data).toBeDefined();
      expect(typeof res.body.total).toBe('number');
    });

    it('GET /resources/search - should search resources', async () => {
      const res = await request(app.getHttpServer())
        .get('/resources/search?q=test')
        .expect(200);
      expect(res.body.data).toBeDefined();
    });

    it('GET /users/search - should search users', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/search?q=test')
        .expect(200);
      expect(res.body.data).toBeDefined();
    });

    it('GET /users/:id - should return 404 for nonexistent user', async () => {
      await request(app.getHttpServer())
        .get('/users/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('Resources Public Routes', () => {
    it('GET /resources/trending - should return trending', async () => {
      const res = await request(app.getHttpServer())
        .get('/resources/trending')
        .expect(200);
      expect(res.body.data).toBeDefined();
    });

    it('GET /resources/:id - should return 404 for nonexistent', async () => {
      await request(app.getHttpServer())
        .get('/resources/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('Lookup Routes', () => {
    it('GET /resource-types - should return resource types', async () => {
      const res = await request(app.getHttpServer())
        .get('/resource-types')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /courses/search?q= - should return empty for no query', async () => {
      const res = await request(app.getHttpServer())
        .get('/courses/search?q=')
        .expect(200);
      expect(res.body).toEqual([]);
    });
  });
});
