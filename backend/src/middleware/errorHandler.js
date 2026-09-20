// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, error: err.message, code: 'VALIDATION_ERROR' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, error: `Invalid ${err.path}: ${err.value}`, code: 'VALIDATION_ERROR' });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ success: false, error: `Duplicate value for ${field}`, code: 'DUPLICATE_KEY' });
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Invalid or expired token', code: 'AUTH_FAILED' });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, error: 'File too large', code: 'UPLOAD_ERROR' });
  }
  if (err.code === 'UPLOAD_ERROR') {
    return res.status(err.statusCode || 400).json({ success: false, error: err.message, code: 'UPLOAD_ERROR' });
  }
  const statusCode = err.statusCode || err.status || 500;
  const response = {
    success: false,
    error: statusCode === 500 ? 'Internal server error' : err.message || 'Internal server error',
    code: err.code || (statusCode === 500 ? 'INTERNAL_ERROR' : 'ERROR')
  };
  return res.status(statusCode).json(response);
}

module.exports = errorHandler;
