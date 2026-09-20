const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/responseHelper');
const Screening = require('../models/Screening');
const Patient = require('../models/Patient');
const Referral = require('../models/Referral');
const FollowUp = require('../models/FollowUp');

const stats = asyncHandler(async (req, res) => {
  const [totalScreenings, byStatus, totalPatients, pendingReviews, totalReferrals] = await Promise.all([
    Screening.countDocuments(),
    Screening.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Patient.countDocuments(),
    Screening.countDocuments({ status: 'review_pending' }),
    Referral.countDocuments()
  ]);
  const gradeDist = await Screening.aggregate([
    { $match: { 'aiResult.grade': { $exists: true, $ne: null } } },
    { $group: { _id: '$aiResult.grade', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  const statusBreakdown = {};
  byStatus.forEach((s) => { statusBreakdown[s._id] = s.count; });
  return success(res, {
    stats: {
      totalScreenings,
      totalPatients,
      pendingReviews,
      totalReferrals,
      statusBreakdown,
      gradeDistribution: gradeDist
    }
  });
});

const priorityCases = asyncHandler(async (req, res) => {
  const cases = await Screening.find({ 'triage.isReferable': true, status: 'review_pending' })
    .populate('patient')
    .sort({ 'triage.priority': -1, createdAt: 1 })
    .limit(50);
  return success(res, { cases });
});

const followupStats = asyncHandler(async (req, res) => {
  const total = await FollowUp.countDocuments();
  return success(res, { stats: { totalFollowUps: total } });
});

module.exports = { stats, priorityCases, followupStats };
