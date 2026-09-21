const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const pinoHttp = require('pino-http');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const env = require('./config/env');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const apiLimiter = require('./middleware/rateLimiter');
const logger = require('./utils/logger');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const screeningRoutes = require('./routes/screening.routes');
const reviewRoutes = require('./routes/review.routes');
const referralRoutes = require('./routes/referral.routes');
const followupRoutes = require('./routes/followup.routes');
const simulationRoutes = require('./routes/simulation.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const auditRoutes = require('./routes/audit.routes');
const healthRoutes = require('./routes/health.routes');
const modelRoutes = require('./routes/model.routes');
const communicationRoutes = require('./routes/communication.routes');
const deviceRoutes = require('./routes/device.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger, genReqId: (req) => req.headers['x-request-id'] || uuidv4() }));

// Expose request ID on all responses for log correlation
app.use((req, res, next) => {
  res.setHeader('X-Request-ID', req.id);
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/uploads', express.static(path.resolve(process.cwd(), env.uploadDir)));

app.use('/api/health', healthRoutes);
app.use('/api/', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/screenings', screeningRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/followups', followupRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/model', modelRoutes);
app.use('/api/communications', communicationRoutes);
app.use('/api/devices', deviceRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found', code: 'NOT_FOUND' });
});

app.use(errorHandler);

if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(env.port, () => {
        logger.info(`DRISHTI AI backend listening on port ${env.port}`);
      });
    })
    .catch((err) => {
      logger.error('Failed to connect to MongoDB:', err.message);
      process.exit(1);
    });
}

module.exports = app;
