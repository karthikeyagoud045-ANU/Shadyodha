const Joi = require('joi');

const reviewDecisionSchema = Joi.object({
  status: Joi.string().valid('confirmed', 'overridden', 'recapture_requested').required(),
  correctGrade: Joi.number().integer().min(0).max(4).when('status', {
    is: 'overridden',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  clinicalNote: Joi.string().max(2000).allow('', null)
});

const createReferralSchema = Joi.object({
  screeningId: Joi.string().required(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').required(),
  referredTo: Joi.string().required(),
  scheduledDate: Joi.date().iso().allow(null),
  notes: Joi.string().max(2000).allow('', null)
});

const createFollowUpSchema = Joi.object({
  screeningId: Joi.string().allow(null),
  patientId: Joi.string().allow(null),
  nextDate: Joi.date().iso().required(),
  notes: Joi.string().max(2000).allow('', null)
});

const simulationSchema = Joi.object({
  patientsPerDay: Joi.number().min(1).max(10000).required(),
  numCameras: Joi.number().min(1).max(100).required(),
  aiProcessingTimeSec: Joi.number().min(0.1).max(3600).required(),
  numOphthalmologists: Joi.number().min(1).max(100).required(),
  reviewTimeSec: Joi.number().min(1).max(3600).required(),
  bandwidthMbps: Joi.number().min(0.1).max(10000).required(),
  referableRate: Joi.number().min(0).max(1).required()
});

module.exports = { reviewDecisionSchema, createReferralSchema, createFollowUpSchema, simulationSchema };
