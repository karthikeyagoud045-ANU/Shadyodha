const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/responseHelper');
const Screening = require('../models/Screening');
const Referral = require('../models/Referral');
const patientService = require('../services/patientService');
const screeningService = require('../services/screeningService');
const { runPipeline } = require('../agents/orchestrator');
const { logAudit } = require('../services/auditService');

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
  const idempotencyKey = req.headers['idempotency-key'];
  if (idempotencyKey) {
    const existing = await Screening.findOne({ idempotencyKey }).populate('patient');
    if (existing) {
      return success(res, { screening: existing, deduped: true }, 'Duplicate request, returning existing screening');
    }
  }
  const screening = await screeningService.createScreening({
    patientDocId: patient._id,
    healthWorkerId: req.user._id,
    file: req.file,
    idempotencyKey
  });
  await screening.populate('patient');
  logAudit(req, 'SCREENING_CREATED', 'Screening', screening._id);
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
  logAudit(req, 'SCREENING_ANALYZED', 'Screening', s._id, { status: updated.status });
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

const getReport = asyncHandler(async (req, res) => {
  const s = await Screening.findById(req.params.id).populate('patient').catch(() => null)
    || await Screening.findOne({ screeningId: req.params.id }).populate('patient');
  if (!s) {
    return res.status(404).json({ success: false, error: 'Screening not found', code: 'NOT_FOUND' });
  }
  const isOwner = String(s.healthWorkerId) === String(req.user._id);
  const privileged = req.user.role === 'ophthalmologist' || req.user.role === 'admin';
  if (!isOwner && !privileged) {
    return res.status(403).json({ success: false, error: 'Forbidden: not attached to this screening', code: 'FORBIDDEN' });
  }
  const referral = await Referral.findOne({ screeningId: s._id });
  const lesions = (s.explainability && s.explainability.detectedLesions) || [];
  const p = s.patient || {};
  return success(res, {
    report: {
      screeningId: s.screeningId,
      status: s.status,
      patient: {
        patientId: p.patientId,
        name: p.name,
        age: p.age,
        gender: p.gender,
        village: p.village,
        district: p.district
      },
      qualityAssessment: s.qualityAssessment,
      prediction: s.aiResult,
      explainability: {
        lesionCounts: lesions.map((l) => ({ type: l.type, count: l.count })),
        imageUrls: {
          gradcam: (s.explainability && s.explainability.gradcamUrl) || `/uploads/results/${s.screeningId}/gradcam.png`,
          overlay: (s.explainability && s.explainability.overlayUrl) || `/uploads/results/${s.screeningId}/overlay.png`,
          annotation: (s.explainability && s.explainability.annotationUrl) || `/uploads/results/${s.screeningId}/lesion_annotation.png`
        }
      },
      triage: s.triage,
      review: s.review,
      referral: referral
        ? { referralId: referral.referralId, priority: referral.priority, referredTo: referral.referredTo, status: referral.status, scheduledDate: referral.scheduledDate }
        : null,
      generatedAt: new Date().toISOString(),
      disclaimer: 'AI screening aid - final clinical decision rests with the ophthalmologist.'
    }
  });
});

module.exports = { create, list, getById, analyze, getResult, getReport };
