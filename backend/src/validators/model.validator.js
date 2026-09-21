const Joi = require('joi');

const modelMetricsSchema = Joi.object({
  modelVersion: Joi.string().required(),
  icdrScale: Joi.array().items(Joi.string()).length(5).default(['No DR', 'Mild NPDR', 'Moderate NPDR', 'Severe NPDR', 'Proliferative DR']),
  referableDefinition: Joi.string().default('Referable DR = ICDR Level 2+'),
  datasets: Joi.object().unknown(true).default({}),
  referableMetrics: Joi.object({
    sensitivity: Joi.number().min(0).max(1).required(),
    specificity: Joi.number().min(0).max(1).required(),
    ppv: Joi.number().min(0).max(1).allow(null),
    npv: Joi.number().min(0).max(1).allow(null),
    auc: Joi.number().min(0).max(1).allow(null),
    prevalence: Joi.number().min(0).max(1).allow(null),
  }).required().unknown(true),
  operatingPoint: Joi.object({ score: Joi.number(), threshold: Joi.number(), tunedOn: Joi.string() }).unknown(true).default({}),
  perClass: Joi.array().items(Joi.object().unknown(true)).default([]),
  confusionMatrix: Joi.array().items(Joi.array().items(Joi.number())).default([]),
  calibration: Joi.object({ method: Joi.string(), eceBefore: Joi.number(), eceAfter: Joi.number() }).unknown(true).default({}),
  artifacts: Joi.object({
    confusionMatrixUrl: Joi.string().allow('', null),
    rocUrl: Joi.string().allow('', null),
    calibrationUrl: Joi.string().allow('', null),
  }).unknown(true).default({}),
  evaluatedAt: Joi.date().allow(null),
});

module.exports = { modelMetricsSchema };
