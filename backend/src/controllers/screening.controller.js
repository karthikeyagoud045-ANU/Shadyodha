const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/responseHelper');
const Screening = require('../models/Screening');
const patientService = require('../services/patientService');
const screeningService = require('../services/screeningService');
const { runPipeline } = require('../agents/orchestrator');

function resolvePatientRef(body) {
  return body.patientId || body.patient || body.patientDocId || null;
}

const create = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Fundus image file is required', code: 'UPLOAD_ERROR' });
  }
  const ref = resolvePatientRef(req.body);
  if (!ref) {
    return res.status(400).json({ success: false, error: 'patientId is required', code: 'VALIDATION_ERROR' });
  }
  const patient = await patientService.findPatientById(ref);
  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient not found', code: 'NOT_FOUND' });
  }
  const screening = await screeningService.createScreening({
    patientDocId: patient._id,
    healthWorkerId: req.user._id,
    file: req.file
  });
  await screening.populate('patient');
  return success(res, { screening }, 'Screening created', 201);
});

const list = asyncHandler(async (req, res) => {
  const { status, limit, page } = req.query;
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  const pg = Math.max(parseInt(page, 10) || 1, 1);
  const filter = {};
  if (status) filter.status = status;
  if (req.user.role === 'health_worker') filter.healthWorkerId = req.user._id;
  const [screenings, total] = await Promise.all([
    Screening.find(filter).populate('patient').sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim),
    Screening.countDocuments(filter)
  ]);
  return success(res, { screenings, total, page: pg, limit: lim });
});

const getById = asyncHandler(async (req, res) => {
  const s = await Screening.findById(req.params.id).populate('patient').catch(() => null)
    || await Screening.findOne({ screeningId: req.params.id }).populate('patient');
  if (!s) {
    return res.status(404).json({ success: false, error: 'Screening not found', code: 'NOT_FOUND' });
  }
  return success(res, { screening: s });
});

const analyze = asyncHandler(async (req, res) => {
  const s = await Screening.findById(req.params.id).catch(() => null)
    || await Screening.findOne({ screeningId: req.params.id });
  if (!s) {
    return res.status(404).json({ success: false, error: 'Screening not found', code: 'NOT_FOUND' });
  }
  const updated = await runPipeline(s._id, req.user._id);
  await updated.populate('patient');
  return success(res, { screening: updated }, 'Analysis completed');
});

const getResult = asyncHandler(async (req, res) => {
  const s = await Screening.findById(req.params.id).catch(() => null)
    || await Screening.findOne({ screeningId: req.params.id });
  if (!s) {
    return res.status(404).json({ success: false, error: 'Screening not found', code: 'NOT_FOUND' });
  }
  return success(res, {
    aiResult: s.aiResult,
    explainability: s.explainability,
    triage: s.triage,
    qualityAssessment: s.qualityAssessment,
    status: s.status
  });
});

module.exports = { create, list, getById, analyze, getResult };
