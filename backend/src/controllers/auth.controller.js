const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/responseHelper');
const authService = require('../services/authService');
const { logAudit } = require('../services/auditService');

const register = asyncHandler(async (req, res) => {
  const { token, user } = await authService.register(req.body);
  logAudit({ user, ip: req.ip }, 'USER_REGISTER', 'User', user._id);
  return success(res, { token, user }, 'Registered successfully', 201);
});

const login = asyncHandler(async (req, res) => {
  const { token, user } = await authService.login(req.body.email, req.body.password);
  logAudit({ user, ip: req.ip }, 'USER_LOGIN', 'User', user._id);
  return success(res, { token, user }, 'Login successful');
});

const me = asyncHandler(async (req, res) => {
  const safe = req.user.toObject ? req.user.toObject() : { ...req.user };
  delete safe.password;
  return success(res, { user: safe });
});

module.exports = { register, login, me };
