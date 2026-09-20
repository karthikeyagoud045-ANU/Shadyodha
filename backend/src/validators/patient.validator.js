const Joi = require('joi');

const createPatientSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  age: Joi.number().integer().min(0).max(130).required(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  phone: Joi.string().allow('', null),
  village: Joi.string().allow('', null),
  district: Joi.string().allow('', null),
  isDiabetic: Joi.boolean().default(true),
  diabetesDurationYears: Joi.number().min(0).allow(null)
});

const updatePatientSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  age: Joi.number().integer().min(0).max(130),
  gender: Joi.string().valid('male', 'female', 'other'),
  phone: Joi.string().allow('', null),
  village: Joi.string().allow('', null),
  district: Joi.string().allow('', null),
  isDiabetic: Joi.boolean(),
  diabetesDurationYears: Joi.number().min(0).allow(null)
}).min(1);

module.exports = { createPatientSchema, updatePatientSchema };
