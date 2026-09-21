const express = require('express');
const mongoose = require('mongoose');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');
const env = require('../config/env');

const router = express.Router();
const bootTime = Date.now();
let requestCount = 0;
router.use((req, res, next) => {
  requestCount += 1;
  next();
});

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Basic health ping (public)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is up
 */
router.get('/', (req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'drishti-ai-backend', time: new Date().toISOString() } });
});

/**
 * @openapi
 * /health/extended:
 *   get:
 *     summary: Extended health dashboard (admin only)
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detailed service stats
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/extended', protect, authorize('admin'), async (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  let collections = [];
  try {
    if (mongoose.connection.db) {
      collections = (await mongoose.connection.db.listCollections().toArray()).map((c) => c.name);
    }
  } catch (e) {
    collections = [];
  }
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptimeSec: process.uptime(),
      database: dbState,
      collections,
      memory: process.memoryUsage(),
      environment: env.nodeEnv,
      mockAI: env.useMockAI,
      requestCountSinceBoot: requestCount,
      bootTime: new Date(bootTime).toISOString(),
    },
  });
});

module.exports = router;
