const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid('health_worker', 'ophthalmologist', 'admin').required(),
  phone: Joi.string().allow('', null),
  facility: Joi.string().allow('', null)
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required()
});

module.exports = { registerSchema, loginSchema };
