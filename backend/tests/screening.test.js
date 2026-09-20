const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongo;
let workerToken;
let patientMongoId;

// ponytail: no jest.resetModules — server must share this file's mongoose instance.
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.JWT_SECRET = 'test-secret';
  process.env.USE_MOCK_AI = 'true';
  // eslint-disable-next-line global-require
  app = require('../src/server');
  await mongoose.connect(process.env.MONGODB_URI);

  const email = `hw${Date.now()}@drishti.ai`;
  const reg = await request(app).post('/api/auth/register').send({
    name: 'HW',
    email,
    password: 'Worker@123',
    role: 'health_worker'
  });
  workerToken = reg.body.data.token;

  const p = await request(app)
    .post('/api/patients')
    .set('Authorization', `Bearer ${workerToken}`)
    .send({ name: 'Test Patient', age: 55, gender: 'male', village: 'Rampur' });
  patientMongoId = p.body.data.patient._id;
}, 90000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

describe('Screening', () => {
  test('POST /api/screenings requires auth', async () => {
    const res = await request(app).post('/api/screenings');
    expect(res.status).toBe(401);
  });

  test('POST /api/screenings uploads image and runs mock analyze', async () => {
    const buf = Buffer.alloc(300 * 1024, 0xff);
    const create = await request(app)
      .post('/api/screenings')
      .set('Authorization', `Bearer ${workerToken}`)
      .field('patientId', patientMongoId)
      .attach('image', buf, 'fundus.jpg');
    expect(create.status).toBe(201);
    const id = create.body.data.screening._id;

    const analyzed = await request(app)
      .post(`/api/screenings/${id}/analyze`)
      .set('Authorization', `Bearer ${workerToken}`);
    expect(analyzed.status).toBe(200);
    expect(analyzed.body.data.screening.aiResult.grade).toBe(2);
    expect(analyzed.body.data.screening.triage.isReferable).toBe(true);
  }, 60000);

  test('triage rules: grade mapping is deterministic', () => {
    // eslint-disable-next-line global-require
    const { triage } = require('../src/agents/triageAgent');
    expect(triage(0).priority).toBe('ROUTINE');
    expect(triage(4).priority).toBe('URGENT');
    expect(triage(2).isReferable).toBe(true);
    expect(triage(1).isReferable).toBe(false);
  });
});
