const swaggerJsdoc = require('swagger-jsdoc');

// ponytail: single-file spec instead of JSDoc in 10 route files — same UI, one diff.
const R = (desc, extra = {}) => ({
  200: { description: desc },
  400: { description: 'Validation error' },
  401: { description: 'Unauthorized' },
  403: { description: 'Forbidden' },
  404: { description: 'Not found' },
  ...extra,
});
const SEC = [{ bearerAuth: [] }];
const PUB = [];

const paths = {
  '/health': {
    get: { summary: 'Basic health ping (public)', tags: ['Health'], security: PUB, responses: R('Service is up') },
  },
  '/health/extended': {
    get: { summary: 'Extended health dashboard (admin)', tags: ['Health'], security: SEC, responses: R('Uptime, DB, memory, env') },
  },
  '/auth/register': {
    post: { summary: 'Register user (public)', tags: ['Auth'], security: PUB, responses: R('Created', { 201: { description: 'Created' } }) },
  },
  '/auth/login': {
    post: { summary: 'Login (public)', tags: ['Auth'], security: PUB, responses: R('JWT + user') },
  },
  '/auth/me': {
    get: { summary: 'Current user', tags: ['Auth'], security: SEC, responses: R('User') },
  },
  '/patients': {
    get: { summary: 'List patients', tags: ['Patients'], security: SEC, responses: R('Patients + total') },
    post: { summary: 'Create patient (health_worker, admin)', tags: ['Patients'], security: SEC, responses: R('Patient', { 201: { description: 'Created' } }) },
  },
  '/patients/{id}': {
    get: { summary: 'Get patient by _id or PAT-XXXXX', tags: ['Patients'], security: SEC, responses: R('Patient') },
    patch: { summary: 'Update patient (health_worker, admin)', tags: ['Patients'], security: SEC, responses: R('Patient') },
  },
  '/screenings': {
    get: { summary: 'List screenings', tags: ['Screenings'], security: SEC, responses: R('Screenings + total') },
    post: { summary: 'Upload fundus image (multipart: image + patientId, Idempotency-Key supported)', tags: ['Screenings'], security: SEC, responses: R('Screening', { 201: { description: 'Created' } }) },
  },
  '/screenings/{id}': {
    get: { summary: 'Get screening by _id or SCR-...', tags: ['Screenings'], security: SEC, responses: R('Screening') },
  },
  '/screenings/{id}/analyze': {
    post: { summary: 'Run quality → AI → triage pipeline', tags: ['Screenings'], security: SEC, responses: R('Screening with results') },
  },
  '/screenings/{id}/result': {
    get: { summary: 'AI result + explainability + triage', tags: ['Screenings'], security: SEC, responses: R('Result') },
  },
  '/screenings/{id}/report': {
    get: { summary: 'Clinical report JSON (owner, ophthalmologist, admin)', tags: ['Screenings'], security: SEC, responses: R('Report') },
  },
  '/reviews/queue': {
    get: { summary: 'Review queue (ophthalmologist, admin)', tags: ['Reviews'], security: SEC, responses: R('Pending referable screenings') },
  },
  '/reviews/{id}': {
    get: { summary: 'Get review case', tags: ['Reviews'], security: SEC, responses: R('Case') },
  },
  '/reviews/{id}/decision': {
    post: { summary: 'Review decision: confirmed | overridden | recapture_requested', tags: ['Reviews'], security: SEC, responses: R('Decision recorded') },
  },
  '/referrals': {
    get: { summary: 'List referrals (ophthalmologist, admin)', tags: ['Referrals'], security: SEC, responses: R('Referrals') },
    post: { summary: 'Create referral (ophthalmologist, admin)', tags: ['Referrals'], security: SEC, responses: R('Referral', { 201: { description: 'Created' } }) },
  },
  '/referrals/{id}': {
    patch: { summary: 'Update referral status/dates/notes', tags: ['Referrals'], security: SEC, responses: R('Referral') },
  },
  '/followups': {
    get: { summary: 'List follow-ups (overdue computed)', tags: ['FollowUps'], security: SEC, responses: R('Follow-ups') },
    post: { summary: 'Create follow-up', tags: ['FollowUps'], security: SEC, responses: R('Follow-up', { 201: { description: 'Created' } }) },
  },
  '/followups/{id}': {
    patch: { summary: 'Update follow-up', tags: ['FollowUps'], security: SEC, responses: R('Follow-up') },
  },
  '/dashboard/stats': {
    get: { summary: 'Dashboard stats', tags: ['Dashboard'], security: SEC, responses: R('Stats') },
  },
  '/dashboard/priority': {
    get: { summary: 'Priority cases (ophthalmologist, admin)', tags: ['Dashboard'], security: SEC, responses: R('Cases') },
  },
  '/simulation/run': {
    post: { summary: 'Run capacity simulation (admin)', tags: ['Simulation'], security: SEC, responses: R('Results + runId') },
  },
  '/simulation/results': {
    get: { summary: 'Latest simulation runs (admin)', tags: ['Simulation'], security: SEC, responses: R('Runs') },
  },
  '/audit': {
    get: { summary: 'Audit logs (admin)', tags: ['Audit'], security: SEC, responses: R('Logs + total') },
  },
  '/model/metrics': {
    get: { summary: 'Latest registered model card (ICDR 0-4, referable 2+)', tags: ['Model'], security: SEC, responses: R('Model card') },
    post: { summary: 'Register model metrics (admin)', tags: ['Model'], security: SEC, responses: R('Registered', { 201: { description: 'Registered' } }) },
  },
  '/model/metrics/{version}': {
    get: { summary: 'Model card by version', tags: ['Model'], security: SEC, responses: R('Model card') },
  },
  '/communications': {
    get: { summary: 'Patient communications (admin, ophthalmologist, owner worker)', tags: ['Communications'], security: SEC, responses: R('Communications') },
  },
  '/devices': {
    get: { summary: 'Device registry (admin)', tags: ['Devices'], security: SEC, responses: R('Devices') },
  },
  '/devices/heartbeat': {
    post: { summary: 'Device heartbeat upsert (health_worker)', tags: ['Devices'], security: SEC, responses: R('Device') },
  },
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DRISHTI AI API',
      version: '1.0.0',
      description: 'Explainable Diabetic Retinopathy Screening Platform (SIH26038, Team ShadYodha)',
    },
    servers: [{ url: 'http://localhost:5001/api' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    paths,
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
