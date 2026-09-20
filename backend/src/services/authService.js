const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpire
  });
}

async function register(data) {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    err.code = 'DUPLICATE_KEY';
    throw err;
  }
  const hashed = await bcrypt.hash(data.password, 12);
  const user = await User.create({ ...data, email: data.email.toLowerCase(), password: hashed });
  const token = signToken(user);
  return { token, user: user.toSafeJSON() };
}

async function login(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    err.code = 'AUTH_FAILED';
    throw err;
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    err.code = 'AUTH_FAILED';
    throw err;
  }
  if (!user.isActive) {
    const err = new Error('Account is deactivated');
    err.statusCode = 401;
    err.code = 'AUTH_FAILED';
    throw err;
  }
  user.lastLogin = new Date();
  await user.save();
  const token = signToken(user);
  const safe = user.toObject();
  delete safe.password;
  return { token, user: safe };
}

module.exports = { register, login, signToken };
