const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongo;

// ponytail: no jest.resetModules — server must share this file's mongoose instance,
// otherwise models buffer forever on an unconnected copy.
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.JWT_SECRET = 'test-secret';
  process.env.USE_MOCK_AI = 'true';
  // eslint-disable-next-line global-require
  app = require('../src/server');
  await mongoose.connect(process.env.MONGODB_URI);
}, 90000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

describe('Auth', () => {
  test('POST /api/auth/register creates a user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Worker',
      email: `worker${Date.now()}@drishti.ai`,
      password: 'Worker@123',
      role: 'health_worker'
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
  }, 30000);

  test('POST /api/auth/login rejects bad credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@drishti.ai',
      password: 'wrong'
    });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('AUTH_FAILED');
  }, 30000);

  test('GET /api/health is public', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
  });
});
