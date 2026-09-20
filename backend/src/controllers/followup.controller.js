const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/responseHelper');
const FollowUp = require('../models/FollowUp');
const Screening = require('../models/Screening');
const { logAudit } = require('../services/auditService');

async function resolveScreening(ref) {
  if (!ref) return null;
  return (await Screening.findById(ref).catch(() => null))
    || (await Screening.findOne({ screeningId: ref }));
}

const create = asyncHandler(async (req, res) => {
  const { screeningId, patientId, nextDate, notes } = req.body;
  const screening = await resolveScreening(screeningId);
  const followup = await FollowUp.create({
    screeningId: screening ? screening._id : undefined,
    screening: screening ? screening._id : undefined,
    patientId: patientId || (screening ? screening.patient : undefined),
    patient: patientId || (screening ? screening.patient : undefined),
    nextDate,
    notes,
    createdBy: req.user._id
  });
  logAudit(req, 'FOLLOWUP_CREATED', 'FollowUp', followup._id);
  return success(res, { followup }, 'Follow-up scheduled', 201);
});

const list = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const now = new Date();
  const followups = await FollowUp.find(filter).sort({ nextDate: 1 }).limit(100);
  const data = followups.map((f) => {
    const obj = f.toObject();
    if (obj.status === 'scheduled' && obj.nextDate && new Date(obj.nextDate) < now) obj.status = 'overdue';
    return obj;
  });
  return success(res, { followups: data });
});

const update = asyncHandler(async (req, res) => {
  const f = await FollowUp.findById(req.params.id);
  if (!f) {
    return res.status(404).json({ success: false, error: 'Follow-up not found', code: 'NOT_FOUND' });
  }
  const allowed = ['status', 'nextDate', 'notes', 'completedDate'];
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) f[k] = req.body[k];
  });
  if (f.status === 'completed' && !f.completedDate) f.completedDate = new Date();
  await f.save();
  return success(res, { followup: f }, 'Follow-up updated');
});

module.exports = { create, list, update };
