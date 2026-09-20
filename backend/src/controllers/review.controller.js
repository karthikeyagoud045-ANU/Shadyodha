const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/responseHelper');
const Screening = require('../models/Screening');
const { transition } = require('../services/screeningService');

const queue = asyncHandler(async (req, res) => {
  const screenings = await Screening.find({ status: 'review_pending', 'triage.isReferable': true })
    .populate('patient')
    .sort({ createdAt: 1 })
    .limit(50);
  return success(res, { screenings });
});

const getById = asyncHandler(async (req, res) => {
  const s = await Screening.findById(req.params.id).populate('patient').catch(() => null)
    || await Screening.findOne({ screeningId: req.params.id }).populate('patient');
  if (!s) {
    return res.status(404).json({ success: false, error: 'Screening not found', code: 'NOT_FOUND' });
  }
  return success(res, { screening: s });
});

const decide = asyncHandler(async (req, res) => {
  const s = await Screening.findById(req.params.id).catch(() => null)
    || await Screening.findOne({ screeningId: req.params.id });
  if (!s) {
    return res.status(404).json({ success: false, error: 'Screening not found', code: 'NOT_FOUND' });
  }
  if (s.status !== 'review_pending') {
    return res.status(400).json({ success: false, error: `Case is not pending review (status: ${s.status})`, code: 'STATE_ERROR' });
  }
  const { status, correctGrade, clinicalNote } = req.body;
  s.review = s.review || {};
  s.review.assignedTo = req.user._id;
  s.review.status = status;
  s.review.decision = status;
  if (correctGrade !== undefined) s.review.correctGrade = correctGrade;
  if (clinicalNote !== undefined) s.review.clinicalNote = clinicalNote;
  s.review.reviewedAt = new Date();
  s.auditTrail.push({
    timestamp: new Date(),
    userId: req.user._id,
    action: 'REVIEW_DECISION',
    details: `Review: ${status}${correctGrade !== undefined ? `, grade ${correctGrade}` : ''}`
  });
  await s.save();
  await transition(s, 'review_completed', req.user._id, `Review decision: ${status}`);
  await s.populate('patient');
  return success(res, { screening: s }, 'Review recorded');
});

module.exports = { queue, getById, decide };
