const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/responseHelper');
const PatientCommunication = require('../models/PatientCommunication');
const Screening = require('../models/Screening');

// GET /api/communications?patientId=&screeningId= (admin, ophthalmologist, owner health_worker)
const list = asyncHandler(async (req, res) => {
  const { patientId, screeningId } = req.query;
  const filter = {};
  if (patientId) filter.patientId = patientId;
  if (screeningId) filter.screeningId = screeningId;
  if (req.user.role === 'health_worker') {
    const mine = await Screening.find({ healthWorkerId: req.user._id }).select('_id');
    const ids = new Set(mine.map((s) => String(s._id)));
    const comms = await PatientCommunication.find(filter).sort({ createdAt: -1 }).limit(100);
    return success(res, { communications: comms.filter((c) => ids.has(String(c.screeningId))) });
  }
  const comms = await PatientCommunication.find(filter).sort({ createdAt: -1 }).limit(100);
  return success(res, { communications: comms });
});

module.exports = { list };
