const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token', code: 'AUTH_FAILED' });
  }
  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Not authorized, token invalid or expired', code: 'AUTH_FAILED' });
  }
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, error: 'User not found or inactive', code: 'AUTH_FAILED' });
  }
  req.user = user;
  return next();
});

module.exports = protect;
