const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/responseHelper');
const Referral = require('../models/Referral');
const Screening = require('../models/Screening');
const { addAuditTrail } = require('../services/reportService');
const { transition } = require('../services/screeningService');
const { logAudit } = require('../services/auditService');

async function findScreening(ref) {
  return (await Screening.findById(ref).catch(() => null))
    || (await Screening.findOne({ screeningId: ref }));
}

const create = asyncHandler(async (req, res) => {
  const { screeningId, priority, referredTo, scheduledDate, notes } = req.body;
  const screening = await findScreening(screeningId);
  if (!screening) {
    return res.status(404).json({ success: false, error: 'Screening not found', code: 'NOT_FOUND' });
  }
  const referral = await Referral.create({
    screeningId: screening._id,
    screening: screening._id,
    patientId: screening.patient,
    patient: screening.patient,
    priority,
    referredTo,
    scheduledDate,
    notes,
    createdBy: req.user._id
  });
  await addAuditTrail(screening._id, req.user._id, 'REFERRAL_CREATED', `Referral ${referral.referralId} to ${referredTo}`);
  if (screening.status === 'review_completed') {
    await transition(screening, 'referred', req.user._id, `Referred to ${referredTo}`);
  }
  logAudit(req, 'REFERRAL_CREATED', 'Referral', referral._id);
  return success(res, { referral }, 'Referral created', 201);
});

const list = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const referrals = await Referral.find(filter).populate('patientId').sort({ createdAt: -1 }).limit(100);
  return success(res, { referrals });
});

const update = asyncHandler(async (req, res) => {
  const referral = await Referral.findById(req.params.id);
  if (!referral) {
    return res.status(404).json({ success: false, error: 'Referral not found', code: 'NOT_FOUND' });
  }
  const allowed = ['status', 'scheduledDate', 'completedDate', 'notes'];
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) referral[k] = req.body[k];
  });
  await referral.save();
  return success(res, { referral }, 'Referral updated');
});

module.exports = { create, list, update };
