require('dotenv').config();

const env = {
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/drishti_ai',
  jwtSecret: process.env.JWT_SECRET || 'drishti-ai-secret-key-change-in-prod',
  jwtExpire: process.env.JWT_EXPIRE || '24h',
  matlabPath: process.env.MATLAB_PATH || 'matlab',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
  useMockAI: String(process.env.USE_MOCK_AI || 'true').toLowerCase() === 'true'
};

module.exports = env;
