const pino = require('pino');

const loggerOptions = {
  level: process.env.LOG_LEVEL || 'info',
  // Never log credentials: Bearer tokens / session cookies are redacted
  redact: ['req.headers.authorization', 'req.headers.cookie', 'headers.authorization'],
};

const logger = pino(loggerOptions);

module.exports = logger;
module.exports.loggerOptions = loggerOptions;
