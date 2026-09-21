const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongo;
let adminToken;
let workerToken;
let ophthToken;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.JWT_SECRET = 'test-secret';
  process.env.USE_MOCK_AI = 'true';
  // eslint-disable-next-line global-require
  app = require('../src/server');
  await mongoose.connect(process.env.MONGODB_URI);

  const mk = async (name, role) => request(app).post('/api/auth/register').send({
    name, email: `${name.replace(/\s/g, '')}${Date.now()}${Math.random()}@drishti.ai`, password: 'Worker@123', role,
  });
  adminToken = (await mk('V12 Admin', 'admin')).body.data.token;
  workerToken = (await mk('V12 Worker', 'health_worker')).body.data.token;
  ophthToken = (await mk('V12 Ophth', 'ophthalmologist')).body.data.token;
}, 90000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

describe('Model metrics registry', () => {
  const passing = {
    modelVersion: 'test-v1', referableMetrics: { sensitivity: 0.93, specificity: 0.88, auc: 0.95 },
  };
  const failing = {
    modelVersion: 'test-v0', referableMetrics: { sensitivity: 0.88, specificity: 0.9, auc: 0.9 },
  };

  test('admin registers passing set → 201, met=true', async () => {
    const res = await request(app).post('/api/model/metrics')
      .set('Authorization', `Bearer ${adminToken}`).send(passing);
    expect(res.status).toBe(201);
    expect(res.body.data.model.referableMetrics.targets.met).toBe(true);
  });

  test('admin registers failing set → met=false (server-computed)', async () => {
    const res = await request(app).post('/api/model/metrics')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...failing, referableMetrics: { ...failing.referableMetrics } });
    // client cannot force met:true — omit targets entirely
    expect(res.status).toBe(201);
    expect(res.body.data.model.referableMetrics.targets.met).toBe(false);
  });

  test('worker cannot register → 403', async () => {
    const res = await request(app).post('/api/model/metrics')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ modelVersion: 'nope', referableMetrics: { sensitivity: 1, specificity: 1 } });
    expect(res.status).toBe(403);
  });

  test('GET latest returns newest card; GET :version 404 on unknown', async () => {
    const latest = await request(app).get('/api/model/metrics').set('Authorization', `Bearer ${workerToken}`);
    expect(latest.status).toBe(200);
    expect(latest.body.data.model.modelVersion).toBe('test-v0');
    const miss = await request(app).get('/api/model/metrics/ghost').set('Authorization', `Bearer ${workerToken}`);
    expect(miss.status).toBe(404);
  });
});

describe('Context-aware triage', () => {
  // eslint-disable-next-line global-require
  const { triage, applyContext } = require('../src/agents/triageAgent');

  test('grade2 + missed referral → HIGH', () => {
    const { triage: t, reasons } = applyContext(triage(2), { missedReferrals: 1 });
    expect(t.priority).toBe('HIGH');
    expect(reasons.length).toBeGreaterThan(0);
  });

  test('grade2 no history → MEDIUM', () => {
    expect(applyContext(triage(2), {}).triage.priority).toBe('MEDIUM');
  });

  test('invariant: grade2 ANY history → isReferable still true', () => {
    const { triage: t } = applyContext(triage(2), { missedReferrals: 5, doctorUtilizationPct: 99 });
    expect(t.isReferable).toBe(true);
  });

  test('high load + MEDIUM → routingFlag set, priority unchanged', () => {
    const { triage: t } = applyContext(triage(2), { doctorUtilizationPct: 96 });
    expect(t.priority).toBe('MEDIUM');
    expect(t.routingFlag).toBe('TELEOPHTH_ROUTING_SUGGESTED');
  });
});

describe('Referral → engagement + devices', () => {
  let patientId;
  let screeningId;

  test('referral create drafts localized (ta) communication', async () => {
    const p = await request(app).post('/api/patients')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ name: 'Engage Patient', age: 60, gender: 'male', contactPreferences: { preferredLanguage: 'ta' } });
    expect(p.status).toBe(201);
    patientId = p.body.data.patient._id;

    const c = await request(app).post('/api/screenings')
      .set('Authorization', `Bearer ${workerToken}`)
      .field('patientId', patientId)
      .attach('image', Buffer.alloc(300 * 1024, 0xff), 'fundus.jpg');
    screeningId = c.body.data.screening._id;
    await request(app).post(`/api/screenings/${screeningId}/analyze`).set('Authorization', `Bearer ${workerToken}`);
    await request(app).post(`/api/reviews/${screeningId}/decision`)
      .set('Authorization', `Bearer ${ophthToken}`)
      .send({ status: 'confirmed', clinicalNote: 'ok' });

    const r = await request(app).post('/api/referrals')
      .set('Authorization', `Bearer ${ophthToken}`)
      .send({ screeningId, priority: 'HIGH', referredTo: 'District Hospital' });
    expect(r.status).toBe(201);

    const comms = await request(app).get(`/api/communications?screeningId=${screeningId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(comms.status).toBe(200);
    expect(comms.body.data.communications.length).toBe(1);
    expect(comms.body.data.communications[0].language).toBe('ta');
    expect(comms.body.data.communications[0].status).toBe('QUEUED');
  });

  test('heartbeat upsert: two posts same deviceId → one doc updated', async () => {
    const hb = (q) => request(app).post('/api/devices/heartbeat')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ deviceId: 'HW-PHONE-01', os: 'Android 14', ...q });
    await hb({ offlineQueueSize: 3 });
    const second = await hb({ offlineQueueSize: 0, appVersion: '1.2.0' });
    expect(second.status).toBe(200);
    expect(second.body.data.device.offlineQueueSize).toBe(0);

    const list = await request(app).get('/api/devices').set('Authorization', `Bearer ${adminToken}`);
    expect(list.body.data.devices.filter((d) => d.deviceId === 'HW-PHONE-01').length).toBe(1);
    const denied = await request(app).get('/api/devices').set('Authorization', `Bearer ${workerToken}`);
    expect(denied.status).toBe(403);
  });
});
